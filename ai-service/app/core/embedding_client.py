"""
Embedding generation for the RFI Knowledge Copilot's RAG pipeline.

Unlike text generation (app/core/llm_client.py), which falls back between
Groq and Gemini, embeddings are Gemini-only — Groq's API does not offer an
embeddings endpoint at all. This means RFI Copilot requires GEMINI_API_KEY
specifically, even if GROQ_API_KEY is set as the primary provider for the
other modules (Spec Compliance, Schedule Risk).
"""

import logging

from app.config import settings
from app.core.exceptions import LLMProviderError

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONALITY = 768  # reduced from the 3072 default — plenty for a small seeded corpus, faster + smaller

_client = None


def _get_client():
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise LLMProviderError(
                "gemini",
                "GEMINI_API_KEY is required for RFI Copilot embeddings, even if Groq is your primary "
                "LLM provider for other modules. Groq does not offer an embeddings API.",
                retryable=False,
            )
        from google import genai

        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def embed_texts(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
    """
    Embeds a batch of texts. task_type should be "RETRIEVAL_DOCUMENT" when embedding
    corpus chunks at ingestion time, and "RETRIEVAL_QUERY" when embedding a user's question.
    """
    if not texts:
        return []

    from google.genai.types import EmbedContentConfig

    client = _get_client()
    try:
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=texts,
            config=EmbedContentConfig(task_type=task_type, output_dimensionality=EMBEDDING_DIMENSIONALITY),
        )
        return [e.values for e in response.embeddings]
    except Exception as e:
        logger.error("Gemini embedding call failed: %s", e)
        raise LLMProviderError("gemini", f"Embedding generation failed: {e}", retryable=True)


def embed_query(text: str) -> list[float]:
    return embed_texts([text], task_type="RETRIEVAL_QUERY")[0]