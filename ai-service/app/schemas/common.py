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


class ParameterComparison(BaseModel):
    parameter_name: str = Field(..., description="Name of the parameter (e.g. Rated Capacity, Dimensions, Material)")
    specification_value: str = Field(..., description="Value required in the specification document")
    submittal_value: str = Field(..., description="Value provided in the vendor submittal document")
    status: str = Field(..., description="Compliance status: 'pass', 'fail', or 'flagged'")
    deviation_reason: str | None = Field(default=None, description="Detailed explanation if status is fail or flagged")
    location_in_spec: str | None = Field(default=None, description="Page number or section in spec document")
    location_in_submittal: str | None = Field(default=None, description="Page number or section in submittal document")


class SpecComplianceResponse(BaseModel):
    overall_status: str = Field(..., description="Overall compliance status: 'pass', 'fail', or 'flagged'")
    summary: str = Field(..., description="High-level text summary of the comparison and deviation flags")
    parameters: list[ParameterComparison] = Field(..., description="Detailed side-by-side parameter list")

