import express from 'express';
import { createBooking, listBookings, updateBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listBookings);
router.post('/', protect, createBooking);
router.patch('/:id', protect, updateBooking);

export default router;
