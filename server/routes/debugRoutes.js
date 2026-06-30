import express from 'express';
import multer from 'multer';
import { uploadPdfDebug } from '../controllers/debugController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/pdf', upload.single('file'), uploadPdfDebug);

export default router;
