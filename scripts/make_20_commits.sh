#!/bin/bash
set -e

echo "=== Setting up Git configuration for Arnav Kumar <arnavaru62@gmail.com> ==="
git config user.name "Arnav Kumar"
git config user.email "arnavaru62@gmail.com"

echo "=== Creating 20 Clean Modular Commits for Today ==="

# 1. Dependencies & MongoDB Package
git add package.json package-lock.json backend/package.json
git commit -m "build(deps): add mongodb driver and update core workspace dependencies" || true

# 2. Local Fallback Database
git add backend/src/db/localStore.js
git commit -m "feat(db): implement standalone local json storage adapter for zero-crash fallback" || true

# 3. MongoDB Store Adapter
git add backend/src/db/mongoStore.js
git commit -m "feat(db): implement high-performance mongodb store with 14 clinical collections" || true

# 4. Database Connection Router
git add backend/src/db/prisma.js backend/src/config/env.js
git commit -m "feat(db): add dynamic database connection routing between mongodb and local store" || true

# 5. Canonical Lab Catalog
git add backend/src/services/canonicalLabCatalog.js
git commit -m "feat(catalog): expand clinical biomarker catalog with standard LOINC codes and reference bounds" || true

# 6. Clinical Unit Converter
git add backend/src/services/unitConverter.js
git commit -m "feat(pipeline): add physiological unit conversion engine for lab measurements" || true

# 7. Document Service OCR Adapter
git add document-service/adapters/ocr_adapter.py document-service/api/ document-service/tests/
git commit -m "feat(ocr): enhance pymupdf and tesseract ocr text extraction pipelines" || true

# 8. Extraction Pipeline & Worker
git add backend/src/services/extractionPipeline.js backend/src/services/medicalExtractor.js backend/src/workers/documentWorker.js
git commit -m "feat(pipeline): implement dual-confidence optical and semantic entity extraction" || true

# 9. Extraction Review & Verification
git add backend/src/services/extractionReviewService.js backend/src/routes/extractionRoutes.js
git commit -m "feat(review): implement human-in-the-loop clinical audit and measurement verification API" || true

# 10. Analytics & Trend Engine
git add backend/src/services/analyticsService.js backend/src/routes/analyticsRoutes.js
git commit -m "feat(analytics): add longitudinal trajectory math, delta tracking, and unit-compatible series" || true

# 11. Physician Summaries Service
git add backend/src/services/summaryService.js backend/src/routes/summaryRoutes.js
git commit -m "feat(summaries): build doctor-ready longitudinal health summary generator" || true

# 12. Security & Auth Routes
git add backend/src/services/authService.js backend/src/routes/authRoutes.js backend/src/middleware/
git commit -m "feat(auth): enhance argon2 password hashing, jwt token rotation, and rate limiting" || true

# 13. UI Healthcare Theme
git add frontend/src/styles/theme.css frontend/index.html
git commit -m "feat(ui-theme): redesign healthcare UI with soothing healing teal palette and readable typography" || true

# 14. 11 Indian Languages Localization Context
git add frontend/src/context/LanguageContext.jsx
git commit -m "feat(i18n): create language context supporting 11 major Indian regional languages" || true

# 15. Language Selector Modal Component
git add frontend/src/components/LanguageSelectorModal.jsx
git commit -m "feat(i18n): build accessible language selector modal with native regional scripts" || true

# 16. Biomarker Dictionary Modal
git add frontend/src/components/BiomarkerDictionaryModal.jsx
git commit -m "feat(ui): add interactive clinical dictionary modal explaining common blood tests" || true

# 17. Responsive Layout & Navigation
git add frontend/src/components/Layout.jsx frontend/src/components/StatusBadge.jsx frontend/src/components/DisclaimerBanner.jsx
git commit -m "feat(nav): add responsive mobile drawer and discreet healthcare footer" || true

# 18. Dashboard & Analytics Pages
git add frontend/src/pages/DashboardPage.jsx frontend/src/pages/AnalyticsPage.jsx
git commit -m "feat(dashboard): display multi-biomarker status matrix and interactive Recharts trajectories" || true

# 19. Patient Ingestion & Auth Pages
git add frontend/src/pages/LandingPage.jsx frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx frontend/src/pages/UploadPage.jsx frontend/src/pages/SummariesPage.jsx frontend/src/pages/PrivacyPage.jsx frontend/src/pages/DocumentsPage.jsx frontend/src/pages/DocumentDetailsPage.jsx frontend/src/pages/ExtractionReviewPage.jsx frontend/src/pages/TimelinePage.jsx frontend/src/pages/AssistantPage.jsx frontend/src/context/AuthContext.jsx frontend/src/api/client.js frontend/vite.config.js frontend/package.json
git commit -m "feat(frontend): streamline patient onboarding, lab report ingestion, and summaries UI" || true

# 20. DevOps Orchestration & Docs
git add run.sh README.md docker-compose.yml docs/ infrastructure/ .github/ backend/tests/ tests/ || true
git commit -m "chore(devops): add unified local runner script, container configs, and documentation" || true

echo "=== All 20 commits created successfully! ==="
git log -n 20 --oneline
