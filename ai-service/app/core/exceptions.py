"""Domain-specific exceptions. Keep these small and specific — callers branch on type."""


class LLMProviderError(Exception):
    """Raised when a single provider call fails (timeout, rate limit, auth, etc.)."""

    def __init__(self, provider: str, message: str, retryable: bool = True):
        self.provider = provider
        self.retryable = retryable
        super().__init__(f"[{provider}] {message}")


class AllProvidersFailedError(Exception):
    """Raised when every configured provider has been tried and all failed."""

    def __init__(self, attempts: list[LLMProviderError]):
        self.attempts = attempts
        summary = "; ".join(str(a) for a in attempts) or "no providers were configured"
        super().__init__(f"All LLM providers failed: {summary}")
