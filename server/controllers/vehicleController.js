import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import { fleetCars } from '../utils/fleetSeed.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';

function normalizeSeedCar(car) {
  return {
    ...car,
    id: String(car.id),
    _id: String(car.id),
    created_at: car.created_at,
  };
}

export const listVehicles = asyncHandler(async (_req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  res.json(vehicles.length ? listToClient(vehicles) : fleetCars.map(normalizeSeedCar));
});

export const getVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findById(req.params.id);
  }

  if (vehicle) return res.json(toClient(vehicle));

  const fallback = fleetCars.find(car => String(car.id) === String(req.params.id));
  if (!fallback) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  res.json(normalizeSeedCar(fallback));
});

export const updateVehicle = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Seed vehicles can be viewed but not modified until imported into MongoDB');
  }

  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  res.json(toClient(vehicle));
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Seed vehicles can be viewed but not deleted until imported into MongoDB');
  }

  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  res.status(204).end();
});
