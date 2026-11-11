# MediGraph AI — Longitudinal Health-Document Intelligence Platform

MediGraph AI is a production-minded, full-stack healthcare document intelligence platform designed to securely ingest clinical medical documents, extract structured health metrics with strict provenance, organize records chronologically, compute unit-aware laboratory trends, and provide context-grounded AI answers with source citations.

---

## Non-Negotiable Medical Engineering Principles

1. **Never claim the system is error-free**: All clinical outputs are labeled informational and require human confirmation.
2. **Never silently accept uncertain OCR or AI-extracted values**: Dual confidence metrics (OCR confidence and extraction confidence) are tracked and displayed. Low-confidence extractions are flagged for human review.
3. **Strict Provenance**: Every extracted laboratory value retains its source document ID, filename, and page number.
4. **Distinguish Values**: Clear boundary between raw extracted strings, normalized numeric values, reference ranges, and AI-generated explanations.
5. **No Medical Fabrication**: Never invent medical values, reference ranges, dates, diagnoses, or citations. If evidence is missing, the system explicitly reports insufficient data.
6. **Deterministic Verification Over AI**: Calculations, reference ranges, unit compatibility checks, and exact numeric queries execute via deterministic algorithms, not generative LLMs.
7. **Synthetic Data Policy**: Built and verified using synthetic demo medical records. No unauthorized patient data is stored.
8. **Multi-Tenant Isolation**: Hard query-level tenant scoping (`WHERE user_id = $1`) on every single endpoint prevents IDOR or cross-tenant data leakage.
9. **Zero PHI Logging**: Structured loggers, error handlers, and traces automatically sanitize passwords, tokens, patient names, and health values.

---

## Technology Stack

- **Frontend**: React 18, Vite, React Router 6, Recharts, Vanilla CSS Design System with accessible custom properties.
- **Backend API**: Node.js 20, Express, Prisma ORM, PostgreSQL with pgvector, Redis 7, BullMQ, Argon2, JWT.
- **Document Service**: Python 3.12, FastAPI, PyMuPDF, PIL, Uvicorn, pytest.
- **DevOps & Infrastructure**: Docker, Docker Compose, GitHub Actions CI/CD.

---

## Monorepo Architecture

```
medigraph-ai/
  frontend/             # React 18 + Vite SPA (13 SaaS screens, Recharts, Theme CSS)
  backend/              # Express API, Prisma Schema, BullMQ Queues, Auth & Audit Services
  document-service/     # Python FastAPI Document Extraction & OCR Adapter Service
  infrastructure/
    docker/             # Multi-stage Dockerfiles for Backend, Frontend, and Python service
  tests/
    fixtures/           # Synthetic PDF medical report generators
  docs/
    ARCHITECTURE.md     # In-depth architectural blueprint, ER diagrams, STRIDE threat model
  docker-compose.yml    # Complete orchestration: Postgres 16, Redis 7, Backend, Worker, Frontend
  .github/workflows/    # CI Pipeline (Backend Vitest, Python Pytest, Frontend build)
```

---

## Quickstart & Local Development

### Prerequisites
- Node.js `v20.x` or higher
- Python `3.12.x` (or `3.11.x`)
- Docker & Docker Compose (optional for full containerized stack)

### 1. Local Monorepo Setup
```bash
# Clone repository
git clone https://github.com/your-org/medigraph-ai.git
cd medigraph-ai

# Install root & workspace npm dependencies
npm install

# Generate Prisma Client
npm run prisma:generate --workspace=backend

# Setup Python Document Service Virtual Environment
cd document-service
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Automated Tests

Run backend unit and integration suites (54 tests):
```bash
npm run test:backend
```

Run Python document service tests (4 tests):
```bash
PYTHONPATH=document-service document-service/.venv/bin/pytest document-service/tests
```

Run frontend build verification:
```bash
npm run build:frontend
```

### 4. Running via Docker Compose
To launch the complete application stack (PostgreSQL 16 + pgvector, Redis 7, Express API, Python Document Service, and Frontend SPA):
```bash
docker-compose up --build
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:4000/api/v1`
- Health check: `http://localhost:4000/health/live`
- Document Service: `http://localhost:8000/health`

---

## Core SaaS Screens

1. **Landing Page**: Platform overview, security principles, and demo access.
2. **Registration & Consent**: Argon2-hashed credentials with explicit GDPR/HIPAA consent checkboxes.
3. **Login**: Session authentication with quick demo credential filler.
4. **Dashboard**: High-level patient health summary, quick upload action, recent reports, and test previews.
5. **Document Upload**: Drag-and-drop file uploader with client-side 15MB limit check and one-click synthetic sample report generator.
6. **Document Library**: Filterable list of all uploaded reports with status badges (`QUEUED`, `PROCESSING`, `REVIEW_REQUIRED`, `COMPLETED`, `FAILED`).
7. **Document Processing Details**: Real-time polling/status view showing page counts, OCR confidence, and duration.
8. **Extraction Review Interface**: Interactive human-in-the-loop table allowing users to review raw vs normalized values, reference ranges, confidence indicators, and edit/verify fields.
9. **Medical Timeline**: Interactive chronological history with date range filtering, category filters, and document preview links.
10. **Lab Trend Analytics**: Recharts interactive line charts for longitudinal values (Hemoglobin, Glucose, HbA1c, etc.) with reference range bands, unit consistency, and non-diagnosis disclaimers.
11. **Grounded AI Assistant**: Chat interface with clickable citations, source document tags, and evidence indicators.
12. **Generated Summaries**: Longitudinal health summaries with user-editable text areas and export actions.
13. **Privacy & Settings**: Consent management, GDPR full data export download, and password-confirmed account deletion.

---

## API Documentation (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user with consent record |
| `POST` | `/api/v1/auth/login` | Authenticate and issue JWT cookies |
| `POST` | `/api/v1/auth/logout` | Revoke session and clear cookies |
| `GET` | `/api/v1/auth/me` | Current authenticated user profile |
| `POST` | `/api/v1/documents` | Ingest document with magic byte inspection |
| `GET` | `/api/v1/documents` | List paginated user documents |
| `GET` | `/api/v1/documents/:id` | Document metadata, checksum, and jobs |
| `GET` | `/api/v1/documents/:id/extractions` | Extracted fields with confidence scores |
| `PATCH` | `/api/v1/extractions/:id` | User correction of extracted value (Audit logged) |
| `POST` | `/api/v1/extractions/:id/verify` | Verify single record |
| `POST` | `/api/v1/documents/:id/verify-all` | Bulk verify all extractions for document |
| `GET` | `/api/v1/timeline` | Filterable chronological medical timeline |
| `GET` | `/api/v1/analytics/lab-tests` | Available laboratory tests catalog |
| `GET` | `/api/v1/analytics/lab-trends/:testId` | Longitudinal time-series trend calculation |
| `POST` | `/api/v1/chat/sessions/:id/messages` | Grounded RAG assistant query with citations |
| `POST` | `/api/v1/summaries` | Generate editable longitudinal summary |
| `GET` | `/api/v1/privacy/export` | Download full JSON user data export |
| `POST` | `/api/v1/privacy/delete-account` | Permanent cascading account purge |
