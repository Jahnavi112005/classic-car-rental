import express from 'express';
import { createVehicle, deleteVehicle, getVehicle, hardDeleteVehicle, listVehicles, restoreVehicle, updateVehicle } from '../controllers/vehicleController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.post('/', protect, adminOnly, createVehicle);
router.patch('/:id/restore', protect, adminOnly, restoreVehicle);
router.delete('/:id/hard', protect, adminOnly, hardDeleteVehicle);
router.patch('/:id', protect, adminOnly, updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

export default router;
