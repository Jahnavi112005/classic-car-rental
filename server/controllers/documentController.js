import multer from 'multer';
import fs from 'fs';
import Document from '../models/Document.js';
import { cloudinaryConfig } from '../config/cloudinary.js';

function logStage(stage, details) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OCR][${stage}]`, JSON.stringify(details));
  }
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

  // Temporarily bypass OCR and identity verification.
  // Store the uploaded file and minimal metadata for manual review by staff.
  const doc = await Document.create({
    user: req.user?._id,
    type: req.body.type || req.body.documentType || 'other',
    fileUrl,
    originalImageUrl: fileUrl,
    originalName: req.file.originalname || '',
    mimeType: req.file.mimetype || '',
    size: req.file.size || 0,
    verificationStatus: 'verified',
    verificationMessage: 'Uploaded (OCR bypassed)',
    verifiedAt: new Date(),
    status: 'verified',
    ocr: null,
  });

  const responsePayload = {
    _id: doc._id,
    id: doc._id,
    fileUrl: doc.fileUrl,
    status: doc.status,
    verificationStatus: doc.verificationStatus,
    verificationMessage: doc.verificationMessage,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
  };

  res.status(201).json(responsePayload);
};
