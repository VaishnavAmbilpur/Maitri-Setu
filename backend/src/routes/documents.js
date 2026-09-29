const express = require('express');
const multer = require('multer');
const path = require('path');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed.'));
    }
  }
});

// POST /api/documents/:approvalId/upload — upload & validate a document
router.post('/:approvalId/upload', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const approval = await prisma.approval.findUnique({
      where: { id: req.params.approvalId },
      include: { application: true }
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found.' });
    }

    // Basic validation — in production this would use Tesseract.js OCR
    const validationResult = performMockValidation(req.file, approval.approvalType);

    const document = await prisma.document.create({
      data: {
        approvalId: req.params.approvalId,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        validationStatus: validationResult.status,
        validationNotes: validationResult.notes
      }
    });

    res.status(201).json({
      document,
      validation: validationResult
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
});

// GET /api/documents/:approvalId — list documents for an approval
router.get('/:approvalId', authMiddleware, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { approvalId: req.params.approvalId },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(documents);
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
});

// Mock validation function — simulates Tesseract.js OCR-based checking
function performMockValidation(file, approvalType) {
  const ext = path.extname(file.originalname).toLowerCase();
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  // Simulate validation rules
  const rules = {
    'Factory Licence': { keywords: ['registration', 'company', 'certificate'], requiredFormat: ['.pdf'] },
    'Fire NOC': { keywords: ['fire', 'safety', 'noc'], requiredFormat: ['.pdf', '.jpg', '.png'] },
    'Electricity Connection': { keywords: ['load', 'power', 'electricity'], requiredFormat: ['.pdf'] },
    'Pollution NOC': { keywords: ['environment', 'pollution', 'waste'], requiredFormat: ['.pdf'] },
    'Food Safety Licence': { keywords: ['food', 'hygiene', 'fssai'], requiredFormat: ['.pdf'] }
  };

  const rule = rules[approvalType] || { keywords: [], requiredFormat: ['.pdf', '.jpg', '.png'] };

  // Check file format
  if (!rule.requiredFormat.includes(ext)) {
    return {
      status: 'flagged',
      notes: `Invalid file format. Expected ${rule.requiredFormat.join(' or ')}, got ${ext}.`,
      details: { fileSize: `${sizeMB} MB`, format: ext }
    };
  }

  // Simulate OCR check — 80% pass rate for demo
  const passChance = Math.random();
  if (passChance > 0.2) {
    return {
      status: 'passed',
      notes: 'Document validated successfully. All required fields detected.',
      details: { fileSize: `${sizeMB} MB`, format: ext, ocrConfidence: `${(85 + Math.random() * 10).toFixed(1)}%` }
    };
  } else {
    return {
      status: 'flagged',
      notes: `Some required fields may be missing. Please ensure document contains: ${rule.keywords.join(', ')}.`,
      details: { fileSize: `${sizeMB} MB`, format: ext, ocrConfidence: `${(40 + Math.random() * 20).toFixed(1)}%` }
    };
  }
}

module.exports = router;
