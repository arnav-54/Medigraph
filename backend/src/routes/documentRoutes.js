import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  uploadDocument,
  listUserDocuments,
  getDocumentById,
  deleteDocument
} from '../services/documentService.js';
import {
  getDocumentExtractions,
  verifyAllDocumentExtractions
} from '../services/extractionReviewService.js';
import { enqueueDocumentJob } from '../queue/documentQueue.js';
import { storageService } from '../services/storageService.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();

// Memory storage for upfront magic-byte validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  }
});

// All document routes require authentication
router.use(authenticate);

// Upload a document
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No document file was uploaded');
    }

    const result = await uploadDocument({
      userId: req.user.userId,
      fileBuffer: req.file.buffer,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(202).json({
      success: true,
      message: 'Document uploaded and queued for processing',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// List documents
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || null;

    const result = await listUserDocuments(req.user.userId, { page, limit, status });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Get document details
router.get('/:id', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: { document }
    });
  } catch (err) {
    next(err);
  }
});

// Download original document
router.get('/:id/download', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.user.userId, req.params.id);
    const buffer = await storageService.getFileBuffer(document.storageKey);

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.originalFilename)}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// Get document extractions
router.get('/:id/extractions', async (req, res, next) => {
  try {
    const extractions = await getDocumentExtractions(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: {
        documentId: req.params.id,
        count: extractions.length,
        extractions
      }
    });
  } catch (err) {
    next(err);
  }
});

// Bulk verify all extractions for document
router.post('/:id/verify-all', async (req, res, next) => {
  try {
    const result = await verifyAllDocumentExtractions(
      req.user.userId,
      req.params.id,
      req.ip,
      req.get('user-agent')
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Lightweight status check for polling
router.get('/:id/status', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      data: {
        documentId: document.id,
        processingStatus: document.processingStatus,
        pageCount: document.pageCount,
        latestJob: document.processingJobs[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
});

// Trigger re-processing / re-scan of document
router.post('/:id/reprocess', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.user.userId, req.params.id);
    await enqueueDocumentJob(document.id, {
      originalFilename: document.originalFilename,
      fileSize: document.fileSize
    });
    res.status(200).json({
      success: true,
      message: 'Document re-enqueued for processing'
    });
  } catch (err) {
    next(err);
  }
});

// Delete document
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteDocument(
      req.user.userId,
      req.params.id,
      req.ip,
      req.get('user-agent')
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
