import express from 'express';
import {
	createBooking,
	listBookings,
	updateBooking,
	actionBooking,
	createGuestBooking,
	addAdminNote,
	assignVehicle,
	changeBookingStatus,
	exportBookings,
	getAuditLogs,
	getBookingById,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);
router.post('/guest', createGuestBooking);
router.post('/:id/notes', protect, addAdminNote);
router.post('/:id/assign', protect, assignVehicle);
router.post('/:id/status', protect, changeBookingStatus);
router.get('/export/csv', protect, exportBookings);
router.get('/:id/audit', protect, getAuditLogs);
router.patch('/:id', protect, updateBooking);
router.post('/:id/action', protect, actionBooking);

export default router;
