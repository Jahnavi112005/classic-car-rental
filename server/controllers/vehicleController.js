import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import { fleetCars } from '../utils/fleetSeed.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';

const ORDER_STEP = 1000;
const seedOrder = new Map(fleetCars.map((car, index) => [String(car.id), (index + 1) * ORDER_STEP]));

function normalizeSeedCar(car) {
  return {
    ...car,
    id: String(car.id),
    _id: String(car.id),
    displayOrder: seedOrder.get(String(car.id)) || ORDER_STEP,
    created_at: car.created_at,
  };
}

function seedVehicleData(fallback) {
  return {
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
    displayOrder: seedOrder.get(String(fallback.id)) || ORDER_STEP,
    createdAt: new Date(fallback.created_at),
    updatedAt: new Date(fallback.created_at),
  };
}

async function importSeedVehicleById(id) {
  const fallback = fleetCars.find(car => String(car.id) === String(id) && !car.isDeleted);
  if (!fallback) return null;

  let vehicle = await Vehicle.findOne({ seedId: fallback.id, isDeleted: false });
  if (vehicle) return vehicle;

  vehicle = await Vehicle.create(seedVehicleData(fallback));
  return vehicle;
}

function getOrderValue(vehicle) {
  if (typeof vehicle.displayOrder === 'number') return vehicle.displayOrder;
  if (vehicle.seedId != null) return seedOrder.get(String(vehicle.seedId)) || Number.MAX_SAFE_INTEGER;
  return Number.MAX_SAFE_INTEGER;
}

function sortByFleetOrder(a, b) {
  const orderDiff = getOrderValue(a) - getOrderValue(b);
  if (orderDiff !== 0) return orderDiff;
  return new Date(a.createdAt || a.created_at || 0) - new Date(b.createdAt || b.created_at || 0);
}

async function ensurePersistedFleetOrder() {
  const seededRecords = await Vehicle.find({ seedId: { $ne: null } }).select('seedId');
  const importedSeedIds = new Set(seededRecords.map(vehicle => String(vehicle.seedId)));

  const seedsToCreate = fleetCars
    .filter(car => !car.isDeleted && !importedSeedIds.has(String(car.id)))
    .map(seedVehicleData);

  if (seedsToCreate.length) {
    await Vehicle.insertMany(seedsToCreate, { ordered: false });
  }

  const vehicles = await Vehicle.find({ hardDeleted: { $ne: true }, isDeleted: false });
  const sorted = vehicles.sort(sortByFleetOrder);
  const writes = sorted.map((vehicle, index) => ({
    updateOne: {
      filter: { _id: vehicle._id },
      update: { displayOrder: (index + 1) * ORDER_STEP },
    },
  }));

  if (writes.length) {
    await Vehicle.bulkWrite(writes);
  }

  return Vehicle.find({ hardDeleted: { $ne: true }, isDeleted: false }).sort({ displayOrder: 1, createdAt: 1 });
}

async function moveVehicleAfter(vehicleId, insertAfterId) {
  if (!insertAfterId) return;

  const vehicles = await ensurePersistedFleetOrder();
  const moving = vehicles.find(vehicle => String(vehicle._id) === String(vehicleId));
  if (!moving) return;

  const remaining = vehicles.filter(vehicle => String(vehicle._id) !== String(vehicleId));
  const targetIndex = remaining.findIndex(vehicle => (
    String(vehicle._id) === String(insertAfterId) || String(vehicle.seedId) === String(insertAfterId)
  ));

  const nextOrder = [...remaining];
  if (targetIndex >= 0) {
    nextOrder.splice(targetIndex + 1, 0, moving);
  } else {
    nextOrder.push(moving);
  }

  await Vehicle.bulkWrite(nextOrder.map((vehicle, index) => ({
    updateOne: {
      filter: { _id: vehicle._id },
      update: { displayOrder: (index + 1) * ORDER_STEP },
    },
  })));
}

export const listVehicles = asyncHandler(async (req, res) => {
  const deletedOnly = req.query.deletedOnly === 'true';
  const includeDeleted = req.query.includeDeleted === 'true';

  const baseFilter = { hardDeleted: { $ne: true } };
  let filter = { ...baseFilter, isDeleted: false };
  if (deletedOnly) filter = { ...baseFilter, isDeleted: true };
  else if (includeDeleted) filter = { ...baseFilter };

  const vehicles = await Vehicle.find(filter);

  const seededRecords = await Vehicle.find({ seedId: { $ne: null } }).select('seedId');
  const importedSeedIds = new Set(
    seededRecords
      .filter(vehicle => vehicle.seedId != null)
      .map(vehicle => String(vehicle.seedId))
  );

  const seedVehicles = deletedOnly
    ? []
    : fleetCars
      .filter(car => !car.isDeleted && !importedSeedIds.has(String(car.id)))
      .map(normalizeSeedCar)
      .map(car => ({ ...car, status: 'available' }));

  const combinedVehicles = [...listToClient(vehicles), ...seedVehicles].sort(sortByFleetOrder);
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

  const { insertAfterId, position, ...updates } = req.body;
  if (updates.status && updates.availability === undefined) {
    updates.availability = updates.status === 'available';
  }
  if (updates.availability === true && updates.status === undefined) {
    updates.status = 'available';
  }

  await Vehicle.findByIdAndUpdate(vehicle._id, updates, {
    new: true,
    runValidators: true,
  });

  if (position === 'after' && insertAfterId) {
    await moveVehicleAfter(vehicle._id, insertAfterId);
  }

  const updatedVehicle = await Vehicle.findById(vehicle._id);
  res.json(toClient(updatedVehicle));
});

export const createVehicle = asyncHandler(async (req, res) => {
  const { insertAfterId, position, ...payload } = req.body;
  if (payload.status && payload.availability === undefined) {
    payload.availability = payload.status === 'available';
  }

  const maxOrder = await Vehicle.findOne({ hardDeleted: { $ne: true } }).sort({ displayOrder: -1 }).select('displayOrder');
  payload.displayOrder = (maxOrder?.displayOrder || 0) + ORDER_STEP;

  const created = await Vehicle.create(payload);
  if (position === 'after' && insertAfterId) {
    await moveVehicleAfter(created._id, insertAfterId);
  }

  res.status(201).json(toClient(await Vehicle.findById(created._id)));
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

export const restoreVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findById(req.params.id);
  } else {
    vehicle = await Vehicle.findOne({ seedId: Number(req.params.id) });
  }

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  const restored = await Vehicle.findByIdAndUpdate(
    vehicle._id,
    { isDeleted: false, hardDeleted: false },
    { new: true, runValidators: true }
  );

  res.json(toClient(restored));
});

export const hardDeleteVehicle = asyncHandler(async (req, res) => {
  let vehicle = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    vehicle = await Vehicle.findById(req.params.id);
  } else {
    vehicle = await Vehicle.findOne({ seedId: Number(req.params.id) });
  }

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  if (vehicle.seedId != null) {
    await Vehicle.findByIdAndUpdate(
      vehicle._id,
      { isDeleted: true, hardDeleted: true },
      { new: true, runValidators: true }
    );
  } else {
    await Vehicle.findByIdAndDelete(vehicle._id);
  }

  res.status(204).end();
});
