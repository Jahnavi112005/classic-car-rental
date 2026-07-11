import multer from 'multer';
import { cloudinaryConfig } from '../config/cloudinary.js';

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

export const uploadImageMiddleware = (req, res, next) => {
  upload.single('file')(req, res, err => {
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  const localPath = req.file.path;
  let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const cloudinary = await import('cloudinary').then(m => m.v2 || m);
      cloudinary.config({
        cloud_name: cloudinaryConfig.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const uploaded = await cloudinary.uploader.upload(localPath, {
        resource_type: 'image',
        folder: req.body.folder || 'owner-dashboard',
      });
      fileUrl = uploaded.secure_url;
    } catch (err) {
      console.warn('Cloudinary image upload failed, keeping local copy', err.message || err);
    }
  }

  res.status(201).json({
    url: fileUrl,
    originalName: req.file.originalname || '',
    mimeType: req.file.mimetype || '',
    size: req.file.size || 0,
  });
};
