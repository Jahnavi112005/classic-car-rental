import express from 'express';
import { createInquiry, listInquiries, updateInquiry } from '../controllers/inquiryController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/', protect, adminOnly, listInquiries);
router.patch('/:id', protect, adminOnly, updateInquiry);

export default router;
