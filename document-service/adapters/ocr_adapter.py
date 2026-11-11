from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import io
import fitz # PyMuPDF
from PIL import Image

class BaseOCRAdapter(ABC):
    @abstractmethod
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> List[Dict[str, Any]]:
        """Extracts text, metadata, and per-page OCR confidence from PDF bytes."""
        pass

    @abstractmethod
    def extract_text_from_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """Extracts text and confidence from image bytes."""
        pass

class PyMuPDFAdapter(BaseOCRAdapter):
    """
    High-performance native text and layout extractor for digital PDFs.
    Computes text completeness and confidence scores per page.
    """
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> List[Dict[str, Any]]:
        pages = []
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        try:
            for page_index in range(len(doc)):
                page = doc[page_index]
                text = page.get_text("text").strip()
                rect = page.rect
                images = page.get_images(full=True)
                has_images = len(images) > 0

                # If page contains selectable digital text, confidence is near 1.0.
                # If page has very little text but has images, it's likely a scanned page requiring OCR.
                if len(text) > 50:
                    confidence = 0.98
                elif len(text) > 0:
                    confidence = 0.85
                else:
                    confidence = 0.30 if has_images else 0.0

                pages.append({
                    "page_number": page_index + 1,
                    "text": text,
                    "ocr_confidence": confidence,
                    "has_images": has_images,
                    "width": int(rect.width),
                    "height": int(rect.height)
                })
        finally:
            doc.close()

        return pages

    def extract_text_from_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        # For pure image with PyMuPDF, wrap in a 1-page PDF or return image attributes
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size

        return {
            "page_number": 1,
            "text": "",
            "ocr_confidence": 0.5,
            "has_images": True,
            "width": width,
            "height": height
        }

class SyntheticMockAdapter(BaseOCRAdapter):
    """
    Deterministic mock adapter used for zero-cost offline testing and unit test validation.
    """
    def __init__(self, default_text: Optional[str] = None):
        self.default_text = default_text or (
            "METROPOLITAN HEALTH LABORATORY\n"
            "Patient: Jane Doe | DOB: 1985-04-12 | Date: 2024-03-15\n"
            "TEST NAME              RESULT    UNIT     REFERENCE RANGE   FLAG\n"
            "Hemoglobin            14.2      g/dL     12.0 - 16.0       NORMAL\n"
            "Fasting Blood Glucose 118       mg/dL    70 - 99           HIGH\n"
            "HbA1c                 5.9       %        4.0 - 5.6         HIGH\n"
            "Serum Creatinine      0.95      mg/dL    0.60 - 1.20       NORMAL\n"
            "Total Cholesterol     210       mg/dL    < 200             HIGH\n"
            "HDL Cholesterol       55        mg/dL    > 40              NORMAL\n"
            "LDL Cholesterol       132       mg/dL    < 100             HIGH\n"
        )

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> List[Dict[str, Any]]:
        return [{
            "page_number": 1,
            "text": self.default_text,
            "ocr_confidence": 0.99,
            "has_images": False,
            "width": 612,
            "height": 792
        }]

    def extract_text_from_image(self, image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        return {
            "page_number": 1,
            "text": self.default_text,
            "ocr_confidence": 0.95,
            "has_images": True,
            "width": 800,
            "height": 1100
        }
