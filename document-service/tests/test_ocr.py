import os
import pytest
from fastapi.testclient import TestClient
from adapters.ocr_adapter import PyMuPDFAdapter, SyntheticMockAdapter
from api.main import app

client = TestClient(app)

SAMPLE_PDF_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../tests/fixtures/sample_lab_report.pdf")
)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pass"
    assert data["service"] == "document-service"

def test_synthetic_mock_adapter():
    adapter = SyntheticMockAdapter()
    pages = adapter.extract_text_from_pdf(b"%PDF-1.4...")
    assert len(pages) == 1
    assert "Hemoglobin" in pages[0]["text"]
    assert pages[0]["ocr_confidence"] >= 0.95
    assert pages[0]["page_number"] == 1

def test_pymupdf_adapter_with_real_pdf():
    assert os.path.exists(SAMPLE_PDF_PATH), f"Fixture not found at {SAMPLE_PDF_PATH}"

    with open(SAMPLE_PDF_PATH, "rb") as f:
        pdf_bytes = f.read()

    adapter = PyMuPDFAdapter()
    pages = adapter.extract_text_from_pdf(pdf_bytes)

    assert len(pages) == 1
    assert pages[0]["page_number"] == 1
    text = pages[0]["text"]
    assert "Hemoglobin" in text
    assert "Fasting Blood Glucose" in text
    assert "14.2" in text
    assert pages[0]["ocr_confidence"] >= 0.90

def test_process_file_endpoint():
    with open(SAMPLE_PDF_PATH, "rb") as f:
        response = client.post(
            "/process-file",
            files={"file": ("sample_report.pdf", f, "application/pdf")},
            data={"document_id": "doc-test-12345"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["document_id"] == "doc-test-12345"
    assert data["page_count"] == 1
    assert data["overall_confidence"] >= 0.90
    assert len(data["pages"]) == 1
    assert "Hemoglobin" in data["pages"][0]["text"]
