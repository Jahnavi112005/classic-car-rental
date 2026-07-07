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
	approveBooking,
	rejectBooking,
	completeBooking,
	exportBookings,
	getAuditLogs,
	getBookingById,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listBookings);
router.get('/:id', protect, getBookingById);
router.get('/pending', protect, (req, res, next) => { req.query.status = 'pending'; next(); }, listBookings);
router.get('/verified', protect, (req, res, next) => { req.query.status = 'approved'; next(); }, listBookings);
router.get('/rejected', protect, (req, res, next) => { req.query.status = 'rejected'; next(); }, listBookings);
router.get('/completed', protect, (req, res, next) => { req.query.status = 'completed'; next(); }, listBookings);
router.post('/', protect, createBooking);
router.post('/guest', createGuestBooking);
router.post('/:id/notes', protect, addAdminNote);
router.post('/:id/assign', protect, assignVehicle);
router.patch('/:id/approve', protect, approveBooking);
router.patch('/:id/reject', protect, rejectBooking);
router.patch('/:id/complete', protect, completeBooking);
router.post('/:id/status', protect, changeBookingStatus);
router.get('/export/csv', protect, exportBookings);
router.get('/:id/audit', protect, getAuditLogs);
router.patch('/:id', protect, updateBooking);
router.post('/:id/action', protect, actionBooking);

export default router;
