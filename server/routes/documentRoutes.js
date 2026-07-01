import express from 'express';
import { uploadMiddleware, uploadDocument } from '../controllers/documentController.js';

const router = express.Router();

router.post('/upload', uploadMiddleware, uploadDocument);

export default router;
