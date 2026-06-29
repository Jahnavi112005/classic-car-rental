import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import { extract } from '../services/ocrService.js';
import { cloudinaryConfig } from '../config/cloudinary.js';

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

  // If cloudinary configured, try to upload there
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
      // remove local file
      fs.unlink(localPath, () => {});
    } catch (err) {
      console.warn('Cloudinary upload failed, keeping local copy', err.message || err);
    }
  }

  // Run OCR
  const ocrResult = await extract(fileUrl).catch(err => ({ error: err.message }));

  const doc = await Document.create({
    user: req.user?._id,
    type: req.body.type || 'other',
    fileUrl,
    ocr: ocrResult,
  });

  res.status(201).json(doc);
};
