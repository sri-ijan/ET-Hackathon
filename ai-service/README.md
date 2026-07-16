# EPC AI Service

FastAPI service that owns all AI/ML logic for the platform: LLM access,
RAG, embeddings, extraction, and the AI pipelines behind all four modules
(Spec Compliance, Schedule Risk Radar, RFI Copilot, Executive Summary).

Owned by: AI/ML Lead.

## Day 1 setup

```bash
cd ai-service
python3 -m venv .venv
 .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

copy .env.example .env
# then edit .env and paste in at least one of:
#   GROQ_API_KEY   (free, no card, sign up at https://console.groq.com)
#   GEMINI_API_KEY (free, no card, get key at https://aistudio.google.com/apikey)
# Setting both gives you automatic fallback if one hits a rate limit.

uvicorn app.main:app --reload --port 8001
```

## Verify it's alive

```bash
curl http://localhost:8001/health
```

Expected:
```json
{"status": "ok", "service": "ai-service", "app_env": "development"}
```

## Verify the LLM connection (Day 1 exit criteria)

Check which providers are configured (no API call made, no cost):

```bash
curl http://localhost:8001/llm/status
```

Send a real test prompt through the fallback chain:

```bash
curl -X POST http://localhost:8001/llm/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Reply with exactly one word: pong"}'
```

Expected shape:
```json
{
  "response": "pong",
  "provider_used": "groq",
  "model_used": "llama-3.3-70b-versatile",
  "latency_ms": 412
}
```

If `provider_used` comes back as `"gemini"` instead of `"groq"`, that means
Groq failed (usually a rate limit or missing key) and the fallback kicked in
correctly — that's the fallback working as designed, not a bug.

If you get a `502` with "All configured LLM providers failed", check:
1. Is at least one of `GROQ_API_KEY` / `GEMINI_API_KEY` actually set in `.env`?
2. Did you restart uvicorn after editing `.env`?
3. Is the key valid (not expired / not truncated on copy-paste)?

## Interactive API docs

FastAPI auto-generates these — useful for the Backend Lead integrating
against this service:

- http://localhost:8001/docs (Swagger UI)
- http://localhost:8001/redoc

## Folder structure

```
app/
  main.py            FastAPI app + router registration
  config.py           all env vars, read once, imported everywhere else
  core/
    llm_client.py      Groq/Gemini abstraction with automatic fallback — import this, not the SDKs directly
    exceptions.py       LLMProviderError, AllProvidersFailedError
    logging_config.py
  routers/
    health.py
    llm_test.py         Day 1 verification endpoints
  schemas/              pydantic request/response models
  agents/                Day 6+: LangGraph workflows (schedule risk, etc.)
  rag/                   Day 4-5: chunking, embeddings, retrieval (RFI Copilot)
  ingestion/              Day 2+: document upload/parsing (spec, submittal, schedule)
  prompts/                Day 2+: prompt templates per module
  utils/                  shared helpers
```

`agents/`, `rag/`, `ingestion/`, `prompts/`, `utils/` are intentionally
empty on Day 1 — they exist now so nobody has to restructure imports later
in the week.

## Rules for everyone calling this service (Backend Lead, take note)

- Never call Groq or Gemini SDKs directly from a router or agent — always
  go through `app.core.llm_client.llm_client`. That's the only place
  fallback logic lives.
- Every LLM-backed endpoint should return `provider_used` and `model_used`
  in its response during the hackathon build — it's the fastest way to
  debug "why did this answer look different" during rehearsal.
