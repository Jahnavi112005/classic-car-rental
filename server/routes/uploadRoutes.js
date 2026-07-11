import express from 'express';
import { uploadImage, uploadImageMiddleware } from '../controllers/uploadController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/image', protect, adminOnly, uploadImageMiddleware, uploadImage);

export default router;
