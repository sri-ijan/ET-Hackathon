# AegisEPC — AI Intelligence Platform for Data Centre EPC Project Delivery

AegisEPC turns the manual paperwork of a data centre EPC (Engineering, Procurement & Construction) project — specifications, vendor submittals, schedules, and RFIs — into an AI-reviewed, searchable, single-pane-of-glass workflow.

Built for the **ET Hackathon**, addressing **PS4: AI Intelligence Platform for Data Centre EPC Project Delivery**.

## The problem

EPC project teams review thousands of pages of specs and vendor submittals by hand, track schedule risk in spreadsheets, and re-answer the same RFI questions project after project. A missed spec mismatch or a schedule slip caught late can cost weeks and real money. AegisEPC automates the first pass of that review so engineers spend their time on judgment calls, not document hunting.

## What it does

AegisEPC ships four AI-powered modules behind a single dashboard:

| Module | What it does |
|---|---|
| **Spec Compliance** | Upload a specification and a vendor submittal; the AI extracts every technical parameter from both and compares them line by line, marking each **Pass / Fail / Flagged**, with the source page/clause shown as evidence. Failed parameters can generate a draft RFI in one click. |
| **Schedule Risk Radar** | Upload a project schedule (CSV); the AI analyzes tasks and dependencies to flag delay risk (**Critical / High / Medium / Low**) and gives specific, actionable recommendations to recover the schedule before the delay happens. |
| **RFI Knowledge Copilot** | Ingest historical RFI documents into a searchable knowledge base, then ask questions in plain English and get instant, sourced answers instead of digging through past project folders. |
| **Executive Summary** | One click pulls insights from the three modules above — compliance, schedule risk, and RFIs — into a single project health report with KPIs, milestones, and executive-level insights. |

## Architecture

```
frontend/     React 19 + Vite + Tailwind — dashboard and the four module UIs
backend/      Node.js + Express — REST API, MongoDB persistence, file uploads
ai-service/   Python + FastAPI — all AI/ML logic: LLM access, RAG, embeddings,
              document parsing, and the pipelines behind all four modules
```

The frontend talks to the Node backend for persistence, dashboard stats, and orchestration; the backend forwards AI-heavy work to the FastAPI `ai-service`, which owns all LLM calls and document ingestion.

**LLM providers:** the AI service calls **Groq** (primary) and **Gemini** (fallback + embeddings) through a single abstraction with automatic fallback, so a rate limit on one provider doesn't take the platform down mid-review.

### Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Recharts, Framer Motion
- **Backend:** Node.js, Express, MongoDB (Mongoose), Multer, Winston, Zod
- **AI Service:** FastAPI, Groq SDK, Google Gemini SDK, NumPy (vector similarity), pypdf, python-docx

## Getting started

Each service runs independently and needs its own terminal.

### 1. AI Service (FastAPI) — port 8001

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add at least one of:
#   GROQ_API_KEY   — free, no card, https://console.groq.com
#   GEMINI_API_KEY — free, no card, https://aistudio.google.com/apikey
# GEMINI_API_KEY is required for the RFI Copilot's embeddings even if
# Groq is your primary provider.

uvicorn app.main:app --reload --port 8001
```

Verify it's running:

```bash
curl http://localhost:8001/health
curl http://localhost:8001/llm/status
```

### 2. Backend (Express) — port 3000

```bash
cd backend
npm install

cp .env.example .env
# Set MONGODB_URI, AI_SERVICE_URL (default http://localhost:8001), CORS_ORIGIN

npm run dev
```

### 3. Frontend (React + Vite) — port 5173

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**.

## Sample data

The repo includes sample files to try each module immediately:

- `Spec_26_33_53_UPS_System.pdf` — specification for the Spec Compliance module
- `Submittal_PowerGuard_PG-800XD.pdf` — vendor submittal for the Spec Compliance module
- `Sample_Schedule_DataHall1.csv` — schedule for the Schedule Risk Radar module

## Project status

Built during the ET Hackathon build week — see individual service READMEs (`ai-service/README.md`) for day-by-day setup notes and folder structure.

## License

ISC (see `backend/package.json`). Add a project-wide LICENSE file before public release if a different license is intended.
