from pydantic import BaseModel, Field
from typing import List, Optional

class PageExtractionResult(BaseModel):
    page_number: int = Field(..., description="1-based page index")
    text: str = Field(..., description="Extracted raw text from this page")
    ocr_confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from OCR engine")
    has_images: bool = Field(default=False)
    width: Optional[int] = None
    height: Optional[int] = None

class DocumentProcessResponse(BaseModel):
    document_id: str
    page_count: int
    overall_confidence: float
    pages: List[PageExtractionResult]
    needs_review: bool
    processing_time_ms: int

class HealthResponse(BaseModel):
    status: str
    service: str
    ocr_provider: str
