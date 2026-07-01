import express from 'express';
import { deleteVehicle, getVehicle, listVehicles, updateVehicle } from '../controllers/vehicleController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.patch('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

export default router;
