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

async function importSeedVehicleById(id) {
  const fallback = fleetCars.find(car => String(car.id) === String(id) && !car.isDeleted);
  if (!fallback) return null;

  let vehicle = await Vehicle.findOne({ seedId: fallback.id, isDeleted: false });
  if (vehicle) return vehicle;

  const vehicleData = {
    seedId: fallback.id,
    name: fallback.name,
    brand: fallback.brand,
    model: fallback.model,
    year: fallback.year,
    yearRange: fallback.yearRange,
    category: fallback.category,
    seats: fallback.seats,
    transmission: fallback.transmission,
    fuel_type: fallback.fuel_type,
    price_per_day: fallback.price_per_day,
    images: fallback.images,
    description: fallback.description,
    features: fallback.features,
    availability: fallback.availability,
    security_deposit: fallback.security_deposit,
    rating: fallback.rating,
    reviews_count: fallback.reviews_count,
    featured: fallback.featured || false,
    status: 'available',
    isDeleted: false,
    createdAt: new Date(fallback.created_at),
    updatedAt: new Date(fallback.created_at),
  };

  vehicle = await Vehicle.create(vehicleData);
  return vehicle;
}

export const listVehicles = asyncHandler(async (_req, res) => {
  const vehicles = await Vehicle.find({ isDeleted: false }).sort({ createdAt: -1 });

  const importedSeedIds = new Set(
    vehicles
      .filter(vehicle => vehicle.seedId != null)
      .map(vehicle => String(vehicle.seedId))
  );

  const seedVehicles = fleetCars
    .filter(car => !car.isDeleted && !importedSeedIds.has(String(car.id)))
    .map(normalizeSeedCar)
    .map(car => ({ ...car, status: 'available' }));

  const combinedVehicles = [...listToClient(vehicles), ...seedVehicles];
  const uniqueVehicles = removeDuplicateVehicles(combinedVehicles);
  res.json(uniqueVehicles);
});

function removeDuplicateVehicles(vehicles) {
  const seen = new Set();
  return vehicles.filter(vehicle => {
    const key = `${vehicle.name}|${vehicle.yearRange || vehicle.year}|${vehicle.transmission}|${vehicle.fuel_type}|${vehicle.price_per_day}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const getVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });
  }

  if (vehicle) return res.json(toClient(vehicle));

  const fallback = fleetCars.find(car => String(car.id) === String(req.params.id) && !car.isDeleted);
  if (!fallback) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  res.json({ ...normalizeSeedCar(fallback), status: 'available' });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findById(req.params.id);
  } else {
    vehicle = await importSeedVehicleById(req.params.id);
  }

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicle._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(toClient(updatedVehicle));
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findById(req.params.id);
  } else {
    vehicle = await importSeedVehicleById(req.params.id);
  }

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  await Vehicle.findByIdAndUpdate(vehicle._id, { isDeleted: true }, { new: true });
  res.status(204).end();
});
