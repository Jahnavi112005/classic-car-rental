import multer from 'multer';
import fs from 'fs';
import Document from '../models/Document.js';
import { extract, parseIdentityFields, verifyIdentity } from '../services/identityVerificationService.js';
import { cloudinaryConfig } from '../config/cloudinary.js';

function logStage(stage, details) {
  console.log(`[OCR][${stage}]`, JSON.stringify(details));
}

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  },
});

export const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const localPath = req.file.path;
  let fileUrl = `/uploads/${req.file.filename}`;

  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const cloudinary = await import('cloudinary').then(m => m.v2 || m);
      cloudinary.config({
        cloud_name: cloudinaryConfig.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const uploaded = await cloudinary.uploader.upload(localPath, { resource_type: 'auto', folder: 'documents' });
      fileUrl = uploaded.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, keeping local copy', err.message || err);
    }
  }

  logStage('Upload', { filename: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, localPath });
  const ocrResult = await extract(localPath, req.file.mimetype).catch(err => ({ error: err.message }));
  const rawText = ocrResult?.raw || '';
  console.log('RAW OCR TEXT:');
  console.log(rawText);
  const parsedFields = parseIdentityFields(req.body.documentType || req.body.type || 'other', rawText);
  const parsedName = parsedFields?.fullName || null;
  const parsedDocumentNumber = parsedFields?.documentNumber || null;
  const parsedDOB = parsedFields?.dob || null;
  logStage('Text Parsing', {
    documentType: req.body.documentType || req.body.type || 'other',
    parsedFields,
    parsedName,
    parsedDocumentNumber,
    parsedDOB,
  });

  const userName = String(req.body.fullName || '').trim();
  const normalizedUserName = userName.toLowerCase().replace(/[^a-z\s]/gi, ' ').replace(/\s+/g, ' ').trim();
  const normalizedRawLower = rawText.toLowerCase();
  const rawContainsName = normalizedUserName && normalizedRawLower.includes(normalizedUserName);

  if (!rawContainsName) {
    console.log('OCR did not detect the customer\'s name.');
  } else if (rawContainsName && !parsedName) {
    console.log('Name parsing failed.');
  }
  const verification = verifyIdentity(
    {
      documentType: req.body.documentType || req.body.type || 'other',
      fullName: req.body.fullName || '',
      documentNumber: req.body.documentNumber || '',
      country: req.body.country || '',
    },
    parsedFields,
    rawText,
    { failureReason: ocrResult?.failureReason || null }
  );

  logStage('Booking Creation', { documentType: req.body.documentType || req.body.type || 'other', verificationStatus: verification.passed ? 'verified' : verification.status === 'restricted' ? 'restricted' : 'rejected' });
  const doc = await Document.create({
    user: req.user?._id,
    type: req.body.type || req.body.documentType || 'other',
    fileUrl,
    originalImageUrl: fileUrl,
    ocrText: ocrResult.raw || '',
    parsedFields,
    verificationStatus: verification.passed ? 'verified' : verification.status === 'restricted' ? 'restricted' : 'rejected',
    verificationNotes: verification.notes,
    verificationMessage: verification.message,
    verifiedAt: verification.passed ? new Date() : null,
    status: verification.passed ? 'verified' : 'rejected',
    ocr: {
      ...ocrResult,
      parsedFields,
      verification,
      uploadedAt: new Date().toISOString(),
    },
  });

  logStage('Booking Creation', { createdDocumentId: doc._id, status: doc.status, verificationStatus: doc.verificationStatus });

  const responsePayload = {
    _id: doc._id,
    id: doc._id,
    fileUrl: doc.fileUrl,
    status: doc.status,
    verificationStatus: verification.passed ? 'verified' : 'rejected',
    verificationMessage: verification.message,
    verificationNotes: verification.notes,
    rawText: rawText,
    ocr: doc.ocr,
  };

  if (process.env.NODE_ENV !== 'production') {
    responsePayload.debug = {
      typedName: req.body.fullName || '',
      parsedName: parsedName || '',
      parsedDocumentNumber: parsedDocumentNumber || '',
      typedDocumentNumber: req.body.documentNumber || '',
      parsedDOB: parsedDOB || '',
      parsedDocumentType: req.body.documentType || req.body.type || 'other',
      rawText,
      verification,
    };
  }

  res.status(201).json(responsePayload);
};
