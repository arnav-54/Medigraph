import time
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from adapters.ocr_adapter import PyMuPDFAdapter, SyntheticMockAdapter, BaseOCRAdapter
from api.schemas import DocumentProcessResponse, PageExtractionResult, HealthResponse

app = FastAPI(
    title="MediGraph AI Document Processing Service",
    description="Python FastAPI document extraction, OCR, and provenance engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Select OCR provider via environment
OCR_PROVIDER = os.getenv("OCR_PROVIDER", "pymupdf").lower()

def get_ocr_adapter() -> BaseOCRAdapter:
    if OCR_PROVIDER == "mock":
        return SyntheticMockAdapter()
    return PyMuPDFAdapter()

adapter = get_ocr_adapter()

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="pass",
        service="document-service",
        ocr_provider=OCR_PROVIDER
    )

@app.post("/process-file", response_model=DocumentProcessResponse)
async def process_file(
    file: UploadFile = File(...),
    document_id: str = Form(...)
):
    start_time = time.time()
    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Empty document payload")

    mime_type = file.content_type or "application/pdf"

    try:
        if "pdf" in mime_type.lower():
            raw_pages = adapter.extract_text_from_pdf(contents)
        else:
            raw_pages = [adapter.extract_text_from_image(contents, mime_type)]

        page_results = [
            PageExtractionResult(
                page_number=p["page_number"],
                text=p["text"],
                ocr_confidence=p["ocr_confidence"],
                has_images=p["has_images"],
                width=p.get("width"),
                height=p.get("height")
            )
            for p in raw_pages
        ]

        if not page_results:
            raise HTTPException(status_code=422, detail="Document could not be parsed into pages")

        avg_confidence = sum(p.ocr_confidence for p in page_results) / len(page_results)
        needs_review = avg_confidence < 0.90 or any(p.ocr_confidence < 0.80 for p in page_results)

        duration_ms = int((time.time() - start_time) * 1000)

        return DocumentProcessResponse(
            document_id=document_id,
            page_count=len(page_results),
            overall_confidence=round(avg_confidence, 4),
            pages=page_results,
            needs_review=needs_review,
            processing_time_ms=duration_ms
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document parsing error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

