"""
Provider-agnostic LLM client.

Design goal: every other part of the codebase (agents, RAG, extraction,
schedule risk, exec summary) calls `llm_client.generate(...)` and never
imports `groq` or `google.genai` directly. That keeps a provider outage
or a free-tier rate-limit wall from becoming a demo-blocking incident —
this class silently falls back to the secondary provider and tells the
caller which one actually answered.

Usage:
    from app.core.llm_client import llm_client
    result = await llm_client.generate("Summarize this spec: ...")
    print(result.text, result.provider, result.model)
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass

from app.config import settings
from app.core.exceptions import AllProvidersFailedError, LLMProviderError

logger = logging.getLogger(__name__)


@dataclass
class LLMResult:
    text: str
    provider: str
    model: str
    latency_ms: int


class LLMClient:
    """
    Wraps Groq and Gemini behind one interface with automatic fallback.

    Provider order is read from settings.provider_order (primary, secondary).
    A provider is skipped entirely if its API key isn't set, so a partially
    configured .env still works — it just has no fallback.
    """

    def __init__(self) -> None:
        self._groq_client = None
        self._gemini_client = None

    # ---- lazy client construction (avoids import/auth cost if unused) ----

    def _get_groq(self):
        if self._groq_client is None:
            from groq import Groq

            self._groq_client = Groq(api_key=settings.groq_api_key)
        return self._groq_client

    def _get_gemini(self):
        if self._gemini_client is None:
            from google import genai

            self._gemini_client = genai.Client(api_key=settings.gemini_api_key)
        return self._gemini_client

    # ---- public API ----

    async def generate(
        self,
        prompt: str,
        system: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> LLMResult:
        """
        Generate a completion, trying providers in configured priority order.
        Raises AllProvidersFailedError only if every configured provider fails.
        """
        providers = settings.configured_providers
        if not providers:
            raise AllProvidersFailedError(
                attempts=[LLMProviderError("none", "No GROQ_API_KEY or GEMINI_API_KEY set in .env", retryable=False)]
            )

        failures: list[LLMProviderError] = []
        for provider in providers:
            try:
                return await self._call_with_retry(provider, prompt, system, temperature, max_tokens)
            except LLMProviderError as exc:
                logger.warning("Provider %s failed, trying next fallback if available: %s", provider, exc)
                failures.append(exc)
                continue

        raise AllProvidersFailedError(attempts=failures)

    # ---- internals ----

    async def _call_with_retry(
        self,
        provider: str,
        prompt: str,
        system: str | None,
        temperature: float,
        max_tokens: int,
    ) -> LLMResult:
        last_error: LLMProviderError | None = None
        for attempt in range(1, settings.llm_max_retries_per_provider + 1):
            start = time.monotonic()
            try:
                if provider == "groq":
                    text = await asyncio.to_thread(self._call_groq, prompt, system, temperature, max_tokens)
                    model = settings.groq_model
                else:
                    text = await asyncio.to_thread(self._call_gemini, prompt, system, temperature, max_tokens)
                    model = settings.gemini_model

                latency_ms = int((time.monotonic() - start) * 1000)
                logger.info("LLM call ok | provider=%s model=%s latency_ms=%d attempt=%d", provider, model, latency_ms, attempt)
                return LLMResult(text=text, provider=provider, model=model, latency_ms=latency_ms)

            except Exception as exc:  # noqa: BLE001 — deliberately broad, normalized below
                retryable = _is_retryable(exc)
                last_error = LLMProviderError(provider, str(exc), retryable=retryable)
                logger.warning(
                    "LLM call failed | provider=%s attempt=%d/%d retryable=%s error=%s",
                    provider, attempt, settings.llm_max_retries_per_provider, retryable, exc,
                )
                if not retryable or attempt == settings.llm_max_retries_per_provider:
                    break
                await asyncio.sleep(settings.llm_retry_backoff_seconds * attempt)

        raise last_error  # type: ignore[misc]

    def _call_groq(self, prompt: str, system: str | None, temperature: float, max_tokens: int) -> str:
        client = self._get_groq()
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=settings.llm_request_timeout_seconds,
        )
        return response.choices[0].message.content

    def _call_gemini(self, prompt: str, system: str | None, temperature: float, max_tokens: int) -> str:
        from google.genai import types

        client = self._get_gemini()
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
            system_instruction=system if system else None,
        )
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=config,
        )
        return response.text


def _is_retryable(exc: Exception) -> bool:
    """
    Best-effort classification without importing every provider's exception
    hierarchy: rate limits (429) and transient network/timeout errors are
    worth retrying; auth (401/403) and bad-request (400) errors are not.
    """
    message = str(exc).lower()
    non_retryable_markers = ("401", "403", "invalid api key", "unauthorized", "permission denied", "400", "invalid_argument")
    if any(marker in message for marker in non_retryable_markers):
        return False
    return True


# Module-level singleton — import this everywhere.
llm_client = LLMClient()
