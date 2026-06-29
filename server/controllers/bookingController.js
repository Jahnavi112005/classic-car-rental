import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { fleetCars } from '../utils/fleetSeed.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';
import { profileFor } from '../services/tokenService.js';

function normalizeBooking(booking) {
  const obj = toClient(booking);
  if (obj.user_id?._id) {
    obj.profiles = profileFor(obj.user_id);
    obj.user_id = String(obj.user_id._id);
  }
  if (obj.car_id?._id) {
    obj.cars = toClient(obj.car_id);
    obj.car_id = String(obj.car_id._id);
  }
  return obj;
}

async function resolveVehicleId(carId) {
  if (mongoose.Types.ObjectId.isValid(carId)) return carId;
  const seed = fleetCars.find(car => String(car.id) === String(carId));
  if (!seed) return carId;
  const vehicle = await Vehicle.findOneAndUpdate(
    { name: seed.name, model: seed.model, year: seed.year },
    seed,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return vehicle._id;
}

export const listBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.userId) filter.user_id = req.query.userId;
  if (req.user.role !== 'admin') filter.user_id = req.user._id;

  const bookings = await Booking.find(filter)
    .populate('car_id')
    .populate('user_id')
    .sort({ createdAt: -1 });

  res.json(bookings.map(normalizeBooking));
});

export const createBooking = asyncHandler(async (req, res) => {
  const carId = await resolveVehicleId(req.body.car_id);
  const booking = await Booking.create({
    ...req.body,
    user_id: req.user._id,
    car_id: carId,
  });
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id');
  res.status(201).json(normalizeBooking(populated));
});

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (req.user.role !== 'admin' && String(booking.user_id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed to update this booking');
  }

  Object.assign(booking, req.body);
  await booking.save();
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id');
  res.json(normalizeBooking(populated));
});
