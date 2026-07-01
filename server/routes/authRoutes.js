import express from 'express';
import { login, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public login for internal staff only. Registration is disabled for public.
router.post('/login', login);
router.get('/me', protect, me);

export default router;
