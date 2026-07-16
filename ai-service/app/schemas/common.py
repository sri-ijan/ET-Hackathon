from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "ai-service"
    app_env: str


class LLMTestRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000, description="Prompt to send to the LLM")
    system: str | None = Field(default=None, max_length=2000)


class LLMTestResponse(BaseModel):
    response: str
    provider_used: str
    model_used: str
    latency_ms: int


class LLMStatusResponse(BaseModel):
    primary_provider: str
    configured_providers: list[str]
    groq_configured: bool
    gemini_configured: bool
