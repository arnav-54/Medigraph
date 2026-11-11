import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../db/prisma.js';
import { queryMedicalAssistant } from '../services/rag/ragService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const router = express.Router();
router.use(authenticate);

const messageSchema = z.object({
  content: z.string().min(1, 'Question content is required').max(1000)
});

// POST /api/v1/chat/sessions
router.post('/sessions', async (req, res, next) => {
  try {
    const session = await prisma.chatSession.create({
      data: {
        userId: req.user.userId,
        title: req.body.title || 'Health Records Query'
      }
    });

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/chat/sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { sessions }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/chat/sessions/:id
router.get('/sessions/:id', async (req, res, next) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.user.userId, deletedAt: null },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new NotFoundError('Chat session not found or access denied');
    }

    res.status(200).json({
      success: true,
      data: { session }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/chat/sessions/:id/messages
router.post('/sessions/:id/messages', async (req, res, next) => {
  try {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Message content required', parsed.error.issues);
    }

    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.user.userId, deletedAt: null }
    });

    if (!session) {
      throw new NotFoundError('Chat session not found or access denied');
    }

    // Save user question message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: 'USER',
        content: parsed.data.content
      }
    });

    // Execute grounded RAG assistant query
    const ragResult = await queryMedicalAssistant(req.user.userId, parsed.data.content);

    // Save assistant response message with citations
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: 'ASSISTANT',
        content: ragResult.answer,
        citations: ragResult.citations,
        isHallucinationFlag: ragResult.insufficientEvidence || false
      }
    });

    // Touch session updated timestamp
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        message: assistantMessage,
        citations: ragResult.citations,
        disclaimer: ragResult.disclaimer,
        insufficientEvidence: ragResult.insufficientEvidence || false
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
