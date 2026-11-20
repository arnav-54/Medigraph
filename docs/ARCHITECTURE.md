# MediVault — System Architecture & AI/ML Pipeline Specification

## 1. Overview
MediVault (formerly MediGraph AI) is a personal longitudinal health document intelligence platform designed to ingest diagnostic reports from Indian laboratory networks (Dr Lal PathLabs, Thyrocare, SRL Diagnostics, Apollo 24|7, Max Healthcare, Metropolis), deterministically extract physiological biomarkers, standardize measurement units across years, and provide grounded multi-lingual AI consultations.

---

## 2. Four-Tier AI/ML Architecture

```
[Uploaded Lab PDF / Image]
           │
           ▼
Tier 1: Document Computer Vision & Layout-Aware OCR
• PyMuPDF native stream analysis
• Spatial coordinate bounding box extraction
• Inverted column stream reordering
• Per-page OCR confidence scoring (0.0 to 1.0)
           │
           ▼
Tier 2: Biomedical NLP & Canonical Entity Resolution
• LOINC-aligned canonical lab dictionary matching
• Cross-lab terminology mapping ("Glycated Hb" -> HBA1C)
• Unit normalization mathematics (e.g. mmol/L to mg/dL)
           │
           ▼
Tier 3: Vector Embeddings & Mathematical Retrieval
• Google Gemini embedding-001 (128 / 768 dimensions)
• Semantic vector indexing
• Cosine Similarity similarity search:
  Cosine(A, B) = (A • B) / (||A|| ||B||)
           │
           ▼
Tier 4: Grounded RAG & Multi-Lingual LLM
• Strict Grounding prompt engineering (Zero-Hallucination)
• Optical provenance: direct [FileName, Page X] source citations
• 11 Indian regional languages support
```

---

## 3. Data Sovereignty & Tenant Privacy
* **Cryptographic Fingerprinting**: Every uploaded document receives a SHA-256 integrity hash.
* **Tenant Isolation**: Files and database records are strictly partitioned by patient ID.
* **GDPR Art. 20 Portability**: One-click machine-readable JSON data export.
* **Permanent Purge**: Credential-authorized hard deletion of all files and vectors.
