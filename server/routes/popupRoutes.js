import express from 'express';
import { createPopup, getActivePopup, listPopups, removePopup, updatePopup } from '../controllers/popupController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/active', getActivePopup);
router.get('/', protect, adminOnly, listPopups);
router.post('/', protect, adminOnly, createPopup);
router.patch('/:id', protect, adminOnly, updatePopup);
router.delete('/:id', protect, adminOnly, removePopup);

export default router;
