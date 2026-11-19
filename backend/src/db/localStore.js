import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

const DB_FILE = path.resolve('./storage/local-db.json');

function ensureStorageDir() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadData() {
  ensureStorageDir();
  let data = null;
  if (fs.existsSync(DB_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      // Return fresh state if corrupt
    }
  }

  if (data) {
    data.generatedSummaries = data.generatedSummaries || [];
    data.auditLogs = data.auditLogs || [];
    data.consentRecords = data.consentRecords || [];
    data.medicalEvents = data.medicalEvents || [];
    data.chatSessions = data.chatSessions || [];
    data.chatMessages = data.chatMessages || [];
    return data;
  }

  // Initial seed with demo user
  const demoUserId = 'usr-demo-patient-12345';
  const demoDocId = 'doc-demo-initial-report-1';

  return {
    users: [
      {
        id: demoUserId,
        email: 'patient.demo@medigraph.ai',
        // Hash for "DemoPassword123!"
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$RTxnqFmOxPI6BafwZv4EJQ$W42lFiIjF4QvQVAOT/DS0WaUIsZBtXZYGTkwlfLhzXE',
        role: 'PATIENT',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          id: 'prof-1',
          userId: demoUserId,
          fullName: 'Jane Doe',
          isSyntheticDemo: true,
          dateOfBirth: '1985-04-12',
          gender: 'Female'
        },
        consents: []
      }
    ],
    documents: [
      {
        id: demoDocId,
        userId: demoUserId,
        originalFilename: 'metropolitan_lab_panel_2024_03.pdf',
        storageKey: `${demoUserId}/${demoDocId}.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1816,
        sha256Checksum: 'demo_sha256_checksum_sample_1234567890abcdef',
        processingStatus: 'COMPLETED',
        pageCount: 1,
        uploadedAt: new Date('2024-03-15T09:30:00Z').toISOString(),
        updatedAt: new Date('2024-03-15T09:30:00Z').toISOString(),
        deletedAt: null
      }
    ],
    documentPages: [
      {
        id: 'page-1',
        documentId: demoDocId,
        pageNumber: 1,
        rawText: 'METROPOLITAN HEALTH LABORATORY\nPatient: Jane Doe | DOB: 1985-04-12 | Collected: 2024-03-15\nHemoglobin 14.2 g/dL 12.0 - 16.0 NORMAL\nFasting Blood Glucose 118 mg/dL 70 - 99 HIGH\nHbA1c 5.9 % 4.0 - 5.6 HIGH\nSerum Creatinine 0.95 mg/dL 0.60 - 1.20 NORMAL\nTotal Cholesterol 210 mg/dL < 200 HIGH\nHDL Cholesterol 55 mg/dL > 40 NORMAL\nLDL Cholesterol 132 mg/dL < 100 HIGH',
        ocrConfidence: 0.98,
        hasImages: false,
        createdAt: new Date('2024-03-15T09:30:00Z').toISOString()
      }
    ],
    processingJobs: [
      {
        id: 'job-1',
        documentId: demoDocId,
        queueJobId: 'local-job-1',
        status: 'COMPLETED',
        attempts: 1,
        maxAttempts: 3,
        startedAt: new Date('2024-03-15T09:30:00Z').toISOString(),
        completedAt: new Date('2024-03-15T09:30:02Z').toISOString(),
        createdAt: new Date('2024-03-15T09:30:00Z').toISOString(),
        updatedAt: new Date('2024-03-15T09:30:02Z').toISOString()
      }
    ],
    labTests: [
      { id: 'test-hgb', canonicalName: 'Hemoglobin', standardCode: '718-7', category: 'Hematology', defaultUnit: 'g/dL' },
      { id: 'test-fbg', canonicalName: 'Fasting Blood Glucose', standardCode: '1558-6', category: 'Metabolic', defaultUnit: 'mg/dL' },
      { id: 'test-a1c', canonicalName: 'HbA1c', standardCode: '4548-4', category: 'Metabolic', defaultUnit: '%' },
      { id: 'test-creat', canonicalName: 'Serum Creatinine', standardCode: '2160-0', category: 'Renal', defaultUnit: 'mg/dL' },
      { id: 'test-chol', canonicalName: 'Total Cholesterol', standardCode: '2093-3', category: 'Lipid Panel', defaultUnit: 'mg/dL' },
      { id: 'test-hdl', canonicalName: 'HDL Cholesterol', standardCode: '2085-9', category: 'Lipid Panel', defaultUnit: 'mg/dL' },
      { id: 'test-ldl', canonicalName: 'LDL Cholesterol', standardCode: '2089-1', category: 'Lipid Panel', defaultUnit: 'mg/dL' }
    ],
    extractedRecords: [
      { id: 'rec-1', documentId: demoDocId, userId: demoUserId, pageNumber: 1, recordType: 'LAB_TEST', rawText: 'Hemoglobin 14.2 g/dL 12.0 - 16.0 NORMAL', extractionConfidence: 0.98, verificationStatus: 'VERIFIED', createdAt: new Date('2024-03-15T09:30:00Z').toISOString() },
      { id: 'rec-2', documentId: demoDocId, userId: demoUserId, pageNumber: 1, recordType: 'LAB_TEST', rawText: 'Fasting Blood Glucose 118 mg/dL 70 - 99 HIGH', extractionConfidence: 0.98, verificationStatus: 'VERIFIED', createdAt: new Date('2024-03-15T09:30:00Z').toISOString() },
      { id: 'rec-3', documentId: demoDocId, userId: demoUserId, pageNumber: 1, recordType: 'LAB_TEST', rawText: 'HbA1c 5.9 % 4.0 - 5.6 HIGH', extractionConfidence: 0.98, verificationStatus: 'VERIFIED', createdAt: new Date('2024-03-15T09:30:00Z').toISOString() },
      { id: 'rec-4', documentId: demoDocId, userId: demoUserId, pageNumber: 1, recordType: 'LAB_TEST', rawText: 'Serum Creatinine 0.95 mg/dL 0.60 - 1.20 NORMAL', extractionConfidence: 0.98, verificationStatus: 'VERIFIED', createdAt: new Date('2024-03-15T09:30:00Z').toISOString() },
      { id: 'rec-5', documentId: demoDocId, userId: demoUserId, pageNumber: 1, recordType: 'LAB_TEST', rawText: 'Total Cholesterol 210 mg/dL < 200 HIGH', extractionConfidence: 0.98, verificationStatus: 'VERIFIED', createdAt: new Date('2024-03-15T09:30:00Z').toISOString() }
    ],
    labResults: [
      { id: 'lr-1', extractedRecordId: 'rec-1', labTestId: 'test-hgb', userId: demoUserId, testNameRaw: 'Hemoglobin', rawValue: '14.2', normalizedValue: 14.2, rawUnit: 'g/dL', normalizedUnit: 'g/dL', referenceRangeRaw: '12.0 - 16.0', refLow: 12.0, refHigh: 16.0, isAbnormalFlag: false, testDate: new Date('2024-03-15T09:30:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      { id: 'lr-2', extractedRecordId: 'rec-2', labTestId: 'test-fbg', userId: demoUserId, testNameRaw: 'Fasting Blood Glucose', rawValue: '118', normalizedValue: 118, rawUnit: 'mg/dL', normalizedUnit: 'mg/dL', referenceRangeRaw: '70 - 99', refLow: 70.0, refHigh: 99.0, isAbnormalFlag: true, testDate: new Date('2024-03-15T09:30:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      { id: 'lr-3', extractedRecordId: 'rec-3', labTestId: 'test-a1c', userId: demoUserId, testNameRaw: 'HbA1c', rawValue: '5.9', normalizedValue: 5.9, rawUnit: '%', normalizedUnit: '%', referenceRangeRaw: '4.0 - 5.6', refLow: 4.0, refHigh: 5.6, isAbnormalFlag: true, testDate: new Date('2024-03-15T09:30:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      { id: 'lr-4', extractedRecordId: 'rec-4', labTestId: 'test-creat', userId: demoUserId, testNameRaw: 'Serum Creatinine', rawValue: '0.95', normalizedValue: 0.95, rawUnit: 'mg/dL', normalizedUnit: 'mg/dL', referenceRangeRaw: '0.60 - 1.20', refLow: 0.60, refHigh: 1.20, isAbnormalFlag: false, testDate: new Date('2024-03-15T09:30:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      { id: 'lr-5', extractedRecordId: 'rec-5', labTestId: 'test-chol', userId: demoUserId, testNameRaw: 'Total Cholesterol', rawValue: '210', normalizedValue: 210, rawUnit: 'mg/dL', normalizedUnit: 'mg/dL', referenceRangeRaw: '< 200', refLow: null, refHigh: 200.0, isAbnormalFlag: true, testDate: new Date('2024-03-15T09:30:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      // Prior historical visit for Hemoglobin & Glucose to show multi-point trends
      { id: 'lr-6', extractedRecordId: 'rec-1', labTestId: 'test-hgb', userId: demoUserId, testNameRaw: 'Hemoglobin', rawValue: '13.8', normalizedValue: 13.8, rawUnit: 'g/dL', normalizedUnit: 'g/dL', referenceRangeRaw: '12.0 - 16.0', refLow: 12.0, refHigh: 16.0, isAbnormalFlag: false, testDate: new Date('2023-11-10T10:00:00Z').toISOString(), verificationStatus: 'VERIFIED' },
      { id: 'lr-7', extractedRecordId: 'rec-2', labTestId: 'test-fbg', userId: demoUserId, testNameRaw: 'Fasting Blood Glucose', rawValue: '105', normalizedValue: 105, rawUnit: 'mg/dL', normalizedUnit: 'mg/dL', referenceRangeRaw: '70 - 99', refLow: 70.0, refHigh: 99.0, isAbnormalFlag: true, testDate: new Date('2023-11-10T10:00:00Z').toISOString(), verificationStatus: 'VERIFIED' }
    ],
    medicalEvents: [
      {
        id: 'evt-1',
        userId: demoUserId,
        documentId: demoDocId,
        eventType: 'LAB_PANEL',
        title: 'Metropolitan Health Laboratory Comprehensive Panel',
        eventDate: new Date('2024-03-15T09:30:00Z').toISOString(),
        description: 'Complete metabolic and hematology panel showing elevated fasting blood glucose and cholesterol.',
        createdAt: new Date('2024-03-15T09:30:00Z').toISOString()
      },
      {
        id: 'evt-2',
        userId: demoUserId,
        documentId: null,
        eventType: 'CLINICAL_VISIT',
        title: 'Routine Health Wellness Checkup',
        eventDate: new Date('2023-11-10T10:00:00Z').toISOString(),
        description: 'Baseline annual wellness examination and preventive laboratory work.',
        createdAt: new Date('2023-11-10T10:00:00Z').toISOString()
      }
    ],
    documentChunks: [
      {
        id: 'chk-1',
        documentId: demoDocId,
        userId: demoUserId,
        pageNumber: 1,
        chunkIndex: 0,
        content: 'Metropolitan Health Laboratory. Patient Jane Doe, Date 2024-03-15. Hemoglobin 14.2 g/dL (normal). Fasting blood glucose 118 mg/dL (elevated). HbA1c 5.9% (elevated). Total cholesterol 210 mg/dL.',
        tokenCount: 45
      }
    ],
    chatSessions: [],
    chatMessages: [],
    generatedSummaries: [],
    auditLogs: [],
    consentRecords: []
  };
}

let memoryDb = loadData();

function getDb() {
  memoryDb = loadData();
  return memoryDb;
}

function saveData() {
  ensureStorageDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
}

/**
 * Clean In-Memory / File-based database adapter compatible with Prisma client interface
 */
export const localDb = {
  user: {
    findUnique: async ({ where }) => {
      const db = getDb();
      if (where.email) return db.users.find(u => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      if (where.id) return db.users.find(u => u.id === where.id) || null;
      return null;
    },
    findMany: async () => getDb().users,
    create: async ({ data }) => {
      const db = getDb();
      const newUser = {
        id: data.id || uuidv4(),
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role || 'PATIENT',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: data.profile?.create ? { id: uuidv4(), ...data.profile.create } : null,
        consents: data.consents?.create || []
      };
      db.users.push(newUser);
      memoryDb = db;
      saveData();
      return newUser;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const db = getDb();
      const idx = db.users.findIndex(u => u.id === where.id);
      if (idx !== -1) {
        db.users[idx] = { ...db.users[idx], ...data, updatedAt: new Date().toISOString() };
        memoryDb = db;
        saveData();
        return db.users[idx];
      }
      return null;
    },
    delete: async ({ where }) => {
      const db = getDb();
      db.users = db.users.filter(u => u.id !== where.id);
      memoryDb = db;
      saveData();
      return { success: true };
    }
  },

  document: {
    findUnique: async ({ where, include }) => {
      let doc = null;
      if (where.id) doc = memoryDb.documents.find(d => d.id === where.id) || null;
      if (where.userId_sha256Checksum) {
        doc = memoryDb.documents.find(d => d.userId === where.userId_sha256Checksum.userId && d.sha256Checksum === where.userId_sha256Checksum.sha256Checksum) || null;
      }
      if (!doc) return null;
      const res = { ...doc };
      if (include?.processingJobs) {
        res.processingJobs = memoryDb.processingJobs
          .filter(j => j.documentId === doc.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      if (include?.pages) {
        res.pages = memoryDb.documentPages.filter(p => p.documentId === doc.id);
      }
      if (include?.extractedRecords) {
        res.extractedRecords = memoryDb.extractedRecords.filter(r => r.documentId === doc.id);
      }
      return res;
    },
    findFirst: async ({ where, include }) => {
      const doc = memoryDb.documents.find(d => {
        if (where.id && d.id !== where.id) return false;
        if (where.userId && d.userId !== where.userId) return false;
        if (where.deletedAt === null && d.deletedAt !== null) return false;
        return true;
      }) || null;
      if (!doc) return null;
      const res = { ...doc };
      if (include?.processingJobs) {
        res.processingJobs = memoryDb.processingJobs
          .filter(j => j.documentId === doc.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      if (include?.pages) {
        res.pages = memoryDb.documentPages.filter(p => p.documentId === doc.id);
      }
      if (include?.extractedRecords) {
        res.extractedRecords = memoryDb.extractedRecords.filter(r => r.documentId === doc.id);
      }
      return res;
    },
    findMany: async ({ where, skip = 0, take = 50 }) => {
      let filtered = memoryDb.documents.filter(d => {
        if (where?.userId && d.userId !== where.userId) return false;
        if (where?.deletedAt === null && d.deletedAt !== null) return false;
        if (where?.processingStatus && d.processingStatus !== where.processingStatus) return false;
        return true;
      });
      return filtered.slice(skip, skip + take).map(d => ({
        ...d,
        _count: {
          extractedRecords: memoryDb.extractedRecords.filter(r => r.documentId === d.id).length,
          pages: memoryDb.documentPages.filter(p => p.documentId === d.id).length
        }
      }));
    },
    count: async ({ where }) => {
      return memoryDb.documents.filter(d => {
        if (where?.userId && d.userId !== where.userId) return false;
        if (where?.deletedAt === null && d.deletedAt !== null) return false;
        return true;
      }).length;
    },
    create: async ({ data }) => {
      const newDoc = {
        id: data.id || uuidv4(),
        userId: data.userId,
        originalFilename: data.originalFilename,
        storageKey: data.storageKey,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        sha256Checksum: data.sha256Checksum,
        processingStatus: data.processingStatus || 'UPLOADED',
        pageCount: 1,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null
      };
      memoryDb.documents.push(newDoc);
      saveData();
      return newDoc;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.documents.findIndex(d => d.id === where.id);
      if (idx !== -1) {
        memoryDb.documents[idx] = { ...memoryDb.documents[idx], ...data, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.documents[idx];
      }
      return null;
    }
  },

  documentPage: {
    findMany: async ({ where }) => memoryDb.documentPages.filter(p => p.documentId === where.documentId),
    deleteMany: async ({ where }) => {
      memoryDb.documentPages = memoryDb.documentPages.filter(p => p.documentId !== where.documentId);
      saveData();
      return { count: 0 };
    },
    create: async ({ data }) => {
      const newPage = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      memoryDb.documentPages.push(newPage);
      saveData();
      return newPage;
    }
  },

  processingJob: {
    findMany: async () => memoryDb.processingJobs,
    create: async ({ data }) => {
      const newJob = { id: uuidv4(), ...data, attempts: 1, maxAttempts: 3, createdAt: new Date().toISOString() };
      memoryDb.processingJobs.push(newJob);
      saveData();
      return newJob;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.processingJobs.findIndex(j => j.id === where.id);
      if (idx !== -1) {
        const updateData = { ...data };
        if (updateData.attempts && typeof updateData.attempts === 'object' && updateData.attempts.increment) {
          updateData.attempts = (memoryDb.processingJobs[idx].attempts || 0) + updateData.attempts.increment;
        }
        memoryDb.processingJobs[idx] = { ...memoryDb.processingJobs[idx], ...updateData, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.processingJobs[idx];
      }
      return null;
    }
  },

  extractedRecord: {
    findMany: async ({ where }) => {
      return memoryDb.extractedRecords
        .filter(r => {
          if (where.documentId && r.documentId !== where.documentId) return false;
          if (where.userId && r.userId !== where.userId) return false;
          return true;
        })
        .map(r => ({
          ...r,
          labResults: memoryDb.labResults
            .filter(lr => lr.extractedRecordId === r.id)
            .map(lr => ({
              ...lr,
              labTest: memoryDb.labTests.find(t => t.id === lr.labTestId) || null
            }))
        }));
    },
    findFirst: async ({ where }) => {
      const rec = memoryDb.extractedRecords.find(r => r.id === where.id);
      if (!rec) return null;
      return {
        ...rec,
        labResults: memoryDb.labResults.filter(lr => lr.extractedRecordId === rec.id)
      };
    },
    create: async ({ data }) => {
      const rec = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      memoryDb.extractedRecords.push(rec);
      saveData();
      return rec;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.extractedRecords.findIndex(r => r.id === where.id);
      if (idx !== -1) {
        memoryDb.extractedRecords[idx] = { ...memoryDb.extractedRecords[idx], ...data, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.extractedRecords[idx];
      }
      return null;
    },
    updateMany: async ({ where, data }) => {
      memoryDb.extractedRecords.forEach((r, idx) => {
        if (where.documentId && r.documentId === where.documentId) {
          memoryDb.extractedRecords[idx] = { ...r, ...data, updatedAt: new Date().toISOString() };
        }
      });
      saveData();
      return { count: 1 };
    }
  },

  labTest: {
    upsert: async ({ where, create }) => {
      let existing = memoryDb.labTests.find(t => t.canonicalName === where.canonicalName);
      if (!existing) {
        existing = { id: uuidv4(), ...create };
        memoryDb.labTests.push(existing);
        saveData();
      }
      return existing;
    },
    findMany: async () => memoryDb.labTests
  },

  labResult: {
    findMany: async ({ where }) => {
      return memoryDb.labResults
        .filter(lr => {
          if (where?.userId && lr.userId !== where.userId) return false;
          if (where?.verificationStatus && lr.verificationStatus !== where.verificationStatus) return false;
          if (where?.labTestId && lr.labTestId !== where.labTestId) return false;
          if (where?.testNameRaw && lr.testNameRaw !== where.testNameRaw) return false;
          if (where?.OR && Array.isArray(where.OR)) {
            const matchesOr = where.OR.some(cond => {
              if (cond.labTestId && lr.labTestId === cond.labTestId) return true;
              if (cond.testNameRaw) {
                const val = typeof cond.testNameRaw === 'object' ? cond.testNameRaw.equals : cond.testNameRaw;
                if (val && lr.testNameRaw && lr.testNameRaw.toLowerCase() === val.toLowerCase()) return true;
              }
              if (cond.labTest?.canonicalName) {
                const val = typeof cond.labTest.canonicalName === 'object' ? cond.labTest.canonicalName.equals : cond.labTest.canonicalName;
                const test = memoryDb.labTests.find(t => t.id === lr.labTestId);
                if (test && test.canonicalName.toLowerCase() === val.toLowerCase()) return true;
              }
              return false;
            });
            if (!matchesOr) return false;
          }
          return true;
        })
        .map(lr => {
          const extractedRecord = memoryDb.extractedRecords.find(r => r.id === lr.extractedRecordId);
          const doc = extractedRecord ? memoryDb.documents.find(d => d.id === extractedRecord.documentId) : null;
          return {
            ...lr,
            testDate: new Date(lr.testDate),
            labTest: memoryDb.labTests.find(t => t.id === lr.labTestId) || null,
            extractedRecord: extractedRecord ? {
              ...extractedRecord,
              document: doc ? { id: doc.id, originalFilename: doc.originalFilename } : { id: 'unknown', originalFilename: 'report.pdf' }
            } : null
          };
        });
    },
    findFirst: async ({ where }) => {
      const match = memoryDb.labResults.find(lr => {
        if (where?.userId && lr.userId !== where.userId) return false;
        if (where?.OR) {
          return where.OR.some(cond => {
            if (cond.labTest?.canonicalName) {
              const test = memoryDb.labTests.find(t => t.id === lr.labTestId);
              return test?.canonicalName?.toLowerCase() === cond.labTest.canonicalName.toLowerCase();
            }
            if (cond.testNameRaw) {
              return lr.testNameRaw.toLowerCase().includes(cond.testNameRaw.contains?.toLowerCase() || '');
            }
            return false;
          });
        }
        return true;
      });
      if (!match) return null;
      const extractedRecord = memoryDb.extractedRecords.find(r => r.id === match.extractedRecordId);
      const doc = extractedRecord ? memoryDb.documents.find(d => d.id === extractedRecord.documentId) : null;
      return {
        ...match,
        testDate: new Date(match.testDate),
        extractedRecord: {
          ...extractedRecord,
          document: doc || { id: 'doc-1', originalFilename: 'report.pdf' }
        }
      };
    },
    create: async ({ data }) => {
      const res = { id: uuidv4(), ...data, testDate: new Date(data.testDate).toISOString(), createdAt: new Date().toISOString() };
      memoryDb.labResults.push(res);
      saveData();
      return res;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.labResults.findIndex(r => r.id === where.id);
      if (idx !== -1) {
        memoryDb.labResults[idx] = { ...memoryDb.labResults[idx], ...data, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.labResults[idx];
      }
      return null;
    },
    updateMany: async ({ where, data }) => {
      memoryDb.labResults.forEach((lr, idx) => {
        if (where?.extractedRecordId && lr.extractedRecordId === where.extractedRecordId) {
          memoryDb.labResults[idx] = { ...lr, ...data };
        }
      });
      saveData();
      return { count: 1 };
    }
  },

  medicalEvent: {
    findMany: async ({ where, skip = 0, take = 50 }) => {
      const filtered = memoryDb.medicalEvents.filter(e => {
        if (where?.userId && e.userId !== where.userId) return false;
        if (where?.eventType && e.eventType !== where.eventType) return false;
        return true;
      });
      return filtered.slice(skip, skip + take).map(e => ({
        ...e,
        eventDate: new Date(e.eventDate),
        createdAt: new Date(e.createdAt),
        document: e.documentId ? memoryDb.documents.find(d => d.id === e.documentId) || null : null
      }));
    },
    findFirst: async ({ where }) => {
      const evt = memoryDb.medicalEvents.find(e => e.id === where.id && e.userId === where.userId);
      if (!evt) return null;
      return {
        ...evt,
        eventDate: new Date(evt.eventDate),
        document: evt.documentId ? memoryDb.documents.find(d => d.id === evt.documentId) || null : null
      };
    },
    count: async ({ where }) => {
      return memoryDb.medicalEvents.filter(e => {
        if (where?.userId && e.userId !== where.userId) return false;
        return true;
      }).length;
    },
    create: async ({ data }) => {
      const evt = {
        id: uuidv4(),
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        createdAt: new Date().toISOString()
      };
      memoryDb.medicalEvents.push(evt);
      saveData();
      return evt;
    }
  },

  documentChunk: {
    findMany: async ({ where, take = 50 }) => {
      return memoryDb.documentChunks
        .filter(c => c.userId === where.userId)
        .slice(0, take)
        .map(c => ({
          ...c,
          document: memoryDb.documents.find(d => d.id === c.documentId) || { id: c.documentId, originalFilename: 'medical_report.pdf' }
        }));
    },
    create: async ({ data }) => {
      const chunk = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      memoryDb.documentChunks.push(chunk);
      saveData();
      return chunk;
    }
  },

  chatSession: {
    findMany: async ({ where }) => memoryDb.chatSessions.filter(s => s.userId === where.userId && s.deletedAt === null),
    findFirst: async ({ where }) => {
      const s = memoryDb.chatSessions.find(s => s.id === where.id && s.userId === where.userId);
      if (!s) return null;
      return {
        ...s,
        messages: memoryDb.chatMessages.filter(m => m.sessionId === s.id)
      };
    },
    create: async ({ data }) => {
      const session = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };
      memoryDb.chatSessions.push(session);
      saveData();
      return session;
    },
    deleteMany: async ({ where }) => {
      const before = memoryDb.extractedRecords.length;
      memoryDb.extractedRecords = memoryDb.extractedRecords.filter(r => {
        if (where?.documentId && r.documentId === where.documentId) return false;
        if (where?.userId && r.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.extractedRecords.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.chatSessions.findIndex(s => s.id === where.id);
      if (idx !== -1) {
        memoryDb.chatSessions[idx] = { ...memoryDb.chatSessions[idx], ...data, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.chatSessions[idx];
      }
      return null;
    }
  },

  chatMessage: {
    create: async ({ data }) => {
      const msg = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      memoryDb.chatMessages.push(msg);
      saveData();
      return msg;
    }
  },

  generatedSummary: {
    findMany: async ({ where }) => (memoryDb.generatedSummaries || []).filter(s => !where?.userId || s.userId === where.userId),
    findFirst: async ({ where }) => (memoryDb.generatedSummaries || []).find(s => s.id === where.id && (!where.userId || s.userId === where.userId)) || null,
    create: async ({ data }) => {
      const sum = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      memoryDb.generatedSummaries = memoryDb.generatedSummaries || [];
      memoryDb.generatedSummaries.push(sum);
      saveData();
      return sum;
    },
    deleteMany: async ({ where }) => {
      memoryDb.generatedSummaries = memoryDb.generatedSummaries || [];
      const before = memoryDb.generatedSummaries.length;
      memoryDb.generatedSummaries = memoryDb.generatedSummaries.filter(s => {
        if (where?.userId && s.userId === where.userId) return false;
        return true;
      });
      saveData();
      return { count: before - memoryDb.generatedSummaries.length };
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.generatedSummaries.findIndex(s => s.id === where.id);
      if (idx !== -1) {
        memoryDb.generatedSummaries[idx] = { ...memoryDb.generatedSummaries[idx], ...data, updatedAt: new Date().toISOString() };
        saveData();
        return memoryDb.generatedSummaries[idx];
      }
      return null;
    }
  },

  auditLog: {
    create: async ({ data }) => {
      const entry = { id: uuidv4(), ...data, timestamp: new Date().toISOString() };
      memoryDb.auditLogs.push(entry);
      saveData();
      return entry;
    },
    findMany: async () => memoryDb.auditLogs
  },

  consentRecord: {
    create: async ({ data }) => {
      const c = { id: uuidv4(), ...data, grantedAt: new Date().toISOString() };
      memoryDb.consentRecords.push(c);
      saveData();
      return c;
    },
    findMany: async () => memoryDb.consentRecords
  },

  $transaction: async (arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === 'function') {
      return arg(localDb);
    }
    return arg;
  }
};

