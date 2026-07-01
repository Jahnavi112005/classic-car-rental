import express from 'express';
import { emptyList } from '../controllers/placeholderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, emptyList);

export default router;
