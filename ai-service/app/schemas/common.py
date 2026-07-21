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
    source: str = Field(
        default="live_llm",
        description="'live_llm' for a real model call. Never set anything else here — "
        "this service should fail loudly (HTTP error) instead of returning canned data.",
    )


class ScheduleTask(BaseModel):
    """One row of a parsed schedule CSV."""
    task_id: str
    task_name: str
    start_date: str  # ISO date string (YYYY-MM-DD)
    end_date: str
    dependency_id: str | None = None
    percent_complete: float = Field(..., ge=0, le=100)


class TaskRiskAssessment(BaseModel):
    task_id: str
    task_name: str
    end_date: str
    percent_complete: float
    risk_score: int = Field(..., ge=0, le=100, description="0 = no risk, 100 = critical/certain delay")
    risk_level: str = Field(..., description="'low', 'medium', 'high', or 'critical'")
    risk_reason: str = Field(..., description="Plain-language explanation of why this task is at risk")
    has_downstream_dependents: bool = Field(default=False, description="True if other tasks depend on this one")


class ScheduleRiskResponse(BaseModel):
    as_of_date: str
    total_tasks: int
    flagged_tasks: int
    overall_project_risk: str = Field(..., description="'low', 'medium', 'high', or 'critical'")
    summary: str
    ranked_risks: list[TaskRiskAssessment] = Field(..., description="At-risk tasks, ranked highest risk first")


class RFIIngestResponse(BaseModel):
    filename: str
    chunks_added: int
    total_chunks_in_corpus: int


class RFICitation(BaseModel):
    source_filename: str
    chunk_index: int
    excerpt: str = Field(..., description="Short snippet of the cited chunk, for display")
    similarity: float


class RFIAskResponse(BaseModel):
    question: str
    answer: str
    citations: list[RFICitation]
    source: str = Field(default="live_llm")


class ExecSummaryRequest(BaseModel):
    compliance_summary: str | None = Field(default=None, description="Latest Spec Compliance Agent summary text")
    compliance_flag_count: int = Field(default=0)
    schedule_summary: str | None = Field(default=None, description="Latest Schedule Risk Radar summary text")
    schedule_overall_risk: str | None = Field(default=None)
    recent_rfi_questions: list[str] = Field(default_factory=list, description="Recent RFI Copilot questions asked, for context")


class ExecSummaryResponse(BaseModel):
    overall_status: str = Field(..., description="'on_track', 'at_risk', or 'critical'")
    headline: str = Field(..., description="One-sentence project pulse")
    top_risks: list[str] = Field(..., description="Top 3 risks/flags across all modules, plain language")
    recommended_actions: list[str] = Field(..., description="2-4 concrete next actions for the project manager")
    full_summary: str = Field(..., description="Full paragraph synthesis, for the dashboard card")
    source: str = Field(default="live_llm")