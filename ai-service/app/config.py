"""
Centralized application configuration.

All environment-dependent values are read here, once, via pydantic-settings.
Nothing else in the codebase should call os.getenv() directly — import
`settings` from this module instead.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    app_env: Literal["development", "production"] = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"

    # --- LLM providers ---
    # Which provider to try first on every call. The other is used as an
    # automatic fallback if the primary fails (rate limit, timeout, auth error).
    primary_llm_provider: Literal["groq", "gemini"] = "groq"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # --- LLM call behavior ---
    llm_request_timeout_seconds: float = 20.0
    llm_max_retries_per_provider: int = 2
    llm_retry_backoff_seconds: float = 1.5

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def configured_providers(self) -> list[str]:
        """Providers that actually have an API key set, in priority order."""
        providers = []
        primary, secondary = self.provider_order
        for name in (primary, secondary):
            key = self.groq_api_key if name == "groq" else self.gemini_api_key
            if key:
                providers.append(name)
        return providers

    @property
    def provider_order(self) -> tuple[str, str]:
        if self.primary_llm_provider == "groq":
            return "groq", "gemini"
        return "gemini", "groq"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
print("=" * 60)
print("Groq Key Loaded:", bool(settings.groq_api_key))
print("Gemini Key Loaded:", bool(settings.gemini_api_key))
print("Configured Providers:", settings.configured_providers)
print("Primary Provider:", settings.primary_llm_provider)
print("=" * 60)