import express from 'express';
import { listReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', listReviews);

export default router;
