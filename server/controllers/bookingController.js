import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Document from '../models/Document.js';
import { fleetCars } from '../utils/fleetSeed.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient, toClient } from '../utils/format.js';
import { profileFor } from '../services/tokenService.js';
import Customer from '../models/Customer.js';
import notificationService from '../services/notificationService.js';
import AuditLog from '../models/AuditLog.js';

function normalizeBooking(booking) {
  const obj = toClient(booking);
  if (obj.user_id?._id) {
    obj.profiles = profileFor(obj.user_id);
    obj.user_id = String(obj.user_id._id);
  }
  if (obj.customer_id?._id) {
    obj.customers = toClient(obj.customer_id);
    obj.customer_id = String(obj.customer_id._id);
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
  if (seed) {
    const vehicle = await Vehicle.findOneAndUpdate(
      { name: seed.name, model: seed.model, year: seed.year },
      seed,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return vehicle._id;
  }

  if (typeof carId === 'string') {
    const lowerId = carId.toLowerCase();
    const seedByName = fleetCars.find(car => car.name.toLowerCase() === lowerId);
    if (seedByName) {
      const vehicle = await Vehicle.findOneAndUpdate(
        { name: seedByName.name, model: seedByName.model, year: seedByName.year },
        seedByName,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return vehicle._id;
    }
    const seedByCategory = fleetCars.find(car => car.category.toLowerCase() === lowerId);
    if (seedByCategory) {
      const vehicle = await Vehicle.findOneAndUpdate(
        { name: seedByCategory.name, model: seedByCategory.model, year: seedByCategory.year },
        seedByCategory,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return vehicle._id;
    }
  }

  return carId;
}

export const listBookings = asyncHandler(async (req, res) => {
  const filter = {};
  // basic filters
  if (req.query.userId) filter.user_id = req.query.userId;
  if (req.query.status) filter.booking_status = req.query.status;
  if (req.query.verification) filter.verification_status = req.query.verification;
  if (req.query.vehicle) filter.car_id = req.query.vehicle;

  // non-admins only see own bookings
  if (!req.user || req.user.role !== 'admin') filter.user_id = req.user?._id;

  let bookings = await Booking.find(filter)
    .populate('car_id')
    .populate('user_id')
    .populate('customer_id')
    .populate('documents')
    .sort({ createdAt: -1 });

  // text search across bookingId, customer name, phone
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    bookings = bookings.filter(b => {
      if (b.bookingId && String(b.bookingId).toLowerCase().includes(q)) return true;
      if (b.customer_id && b.customer_id.name && String(b.customer_id.name).toLowerCase().includes(q)) return true;
      if (b.customer_id && b.customer_id.phone && String(b.customer_id.phone).toLowerCase().includes(q)) return true;
      if (b.user_id && b.user_id.name && String(b.user_id.name).toLowerCase().includes(q)) return true;
      return false;
    });
  }

  res.json(bookings.map(normalizeBooking));
});

export const addAdminNote = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  const { text } = req.body;
  booking.notes = booking.notes || [];
  booking.notes.push({ admin: req.user._id, text, createdAt: new Date() });
  booking.timeline = booking.timeline || [];
  booking.timeline.push({ event: 'admin_note', ts: new Date(), by: req.user._id, meta: { text } });
  await booking.save();
  await AuditLog.create({ admin: req.user._id, booking: booking._id, action: 'add_note', detail: { text }, ip: req.ip });
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('customer_id').populate('documents');
  res.json(normalizeBooking(populated));
});

export const assignVehicle = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  const booking = await Booking.findById(req.params.id).populate('car_id');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const { vehicleId } = req.body;
  const vId = await resolveVehicleId(vehicleId);
  const vehicle = await Vehicle.findById(vId);
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  if (!vehicle.availability) {
    res.status(400);
    throw new Error('Vehicle is not available');
  }
  booking.car_id = vId;
  booking.booking_status = 'assigned';
  booking.timeline.push({ event: 'vehicle_assigned', ts: new Date(), by: req.user._id, meta: { vehicle: vId } });
  booking.status_history.push({ from: booking.booking_status, to: 'assigned', by: req.user._id, note: req.body.note || '' });
  await booking.save();
  await Vehicle.findByIdAndUpdate(vId, { availability: false });
  await AuditLog.create({ admin: req.user._id, booking: booking._id, action: 'assign_vehicle', detail: { vehicle: vId }, ip: req.ip });
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('customer_id').populate('documents');
  res.json(normalizeBooking(populated));
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('car_id')
    .populate('user_id')
    .populate('customer_id')
    .populate('documents');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.json(normalizeBooking(booking));
});

export const changeBookingStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const { status, note } = req.body;
  const from = booking.booking_status;
  booking.booking_status = status;
  if (status === 'approved') {
    booking.verification_status = 'verified';
  }
  booking.status_history.push({ from, to: status, by: req.user._id, note: note || '' });
  booking.timeline.push({ event: `status_${status}`, ts: new Date(), by: req.user._id, meta: { note } });
  await booking.save();
  await AuditLog.create({ admin: req.user._id, booking: booking._id, action: 'change_status', detail: { from, to: status, note }, ip: req.ip });
  // if approved -> send notification
  if (status === 'approved') {
    try {
      const populated = await Booking.findById(booking._id).populate('user_id').populate('customer_id');
      const to = populated.user_id?.email || populated.customer_id?.email;
      if (to) notificationService.sendEmailNotification(to, 'Booking Status Updated', `Booking ${booking.bookingId} status changed to ${status}`);
    } catch (err) {
      console.warn('Notification failed', err.message || err);
    }
  }
  if (status === 'completed' && booking.car_id) {
    await Vehicle.findByIdAndUpdate(booking.car_id, { availability: true });
  }
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('customer_id').populate('documents');
  res.json(normalizeBooking(populated));
});

export const exportBookings = asyncHandler(async (req, res) => {
  // simple CSV export
  const filter = {};
  if (req.query.status) filter.booking_status = req.query.status;
  const bookings = await Booking.find(filter).populate('car_id').populate('customer_id');
  const rows = bookings.map(b => {
    return {
      bookingId: b.bookingId,
      customerId: b.customer_id?._id ? b.customer_id.customerId : '',
      customerName: b.customer_id?.name || '',
      phone: b.customer_id?.phone || '',
      email: b.customer_id?.email || '',
      pickup: b.pickup_location,
      drop: b.drop_location,
      pickup_date: b.pickup_date,
      drop_date: b.drop_date,
      vehicle: b.car_id?.name || '',
      status: b.booking_status,
      verification: b.verification_status,
    };
  });
  const header = Object.keys(rows[0] || {}).join(',') + '\n';
  const csv = header + rows.map(r => Object.values(r).map(v => `"${String(v || '')}"`).join(',')).join('\n');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed');
  }
  const logs = await AuditLog.find({ booking: req.params.id }).populate('admin').sort({ createdAt: -1 });
  res.json(logs.map(l => ({ admin: l.admin ? { id: l.admin._id, name: l.admin.name, email: l.admin.email } : null, action: l.action, detail: l.detail, ts: l.createdAt, id: l._id })));
});

export const createBooking = asyncHandler(async (req, res) => {
  const carId = await resolveVehicleId(req.body.car_id);

  // availability check: overlapping bookings for same car
  const pickup = new Date(req.body.pickup_date);
  const drop = new Date(req.body.drop_date);
  const overlapping = await Booking.findOne({
    car_id: carId,
    booking_status: { $in: ['pending', 'approved'] },
    $or: [
      { $and: [{ pickup_date: { $lte: req.body.pickup_date } }, { drop_date: { $gte: req.body.pickup_date } }] },
      { $and: [{ pickup_date: { $lte: req.body.drop_date } }, { drop_date: { $gte: req.body.drop_date } }] },
      { $and: [{ pickup_date: { $gte: req.body.pickup_date } }, { drop_date: { $lte: req.body.drop_date } }] },
    ],
  });
  if (overlapping) {
    res.status(400);
    throw new Error('This vehicle is not available for the selected dates.');
  }

  // generate bookingId
  const year = new Date().getFullYear();
  const count = (await Booking.countDocuments()) + 1;
  const bookingId = `CCR-${year}-${String(count).padStart(6, '0')}`;

  const bookingData = {
    ...req.body,
    user_id: req.user?._id,
    car_id: carId,
    bookingId,
    notes: req.body.notes ? [{ text: req.body.notes, createdAt: new Date() }] : [],
  };

  const booking = await Booking.create(bookingData);

  // link document if provided
  if (req.body.document) {
    try {
      await Document.findByIdAndUpdate(req.body.document, { booking: booking._id });
      booking.documents = [req.body.document];
      await booking.save();
    } catch (err) {
      // ignore document linking errors
      console.warn('Failed to link document to booking', err.message || err);
    }
  }

  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('documents');
  res.status(201).json(normalizeBooking(populated));
});

export const createGuestBooking = asyncHandler(async (req, res) => {
  // Expect customer data in req.body.customer
  const customerPayload = req.body.customer || {
    name: req.body.fullName || req.body.name || 'Guest',
    email: req.body.email || '',
    phone: req.body.mobileNumber || req.body.phone || '',
    address: req.body.address || '',
  };

  // create customer
  const year = new Date().getFullYear();
  const count = (await Customer.countDocuments()) + 1;
  const customerId = `CUST-${year}-${String(count).padStart(6, '0')}`;
  const customer = await Customer.create({ ...customerPayload, customerId });

  const carId = await resolveVehicleId(req.body.car_id);

  // availability check
  const overlapping = await Booking.findOne({
    car_id: carId,
    booking_status: { $in: ['pending', 'approved'] },
    $or: [
      { $and: [{ pickup_date: { $lte: req.body.pickup_date } }, { drop_date: { $gte: req.body.pickup_date } }] },
      { $and: [{ pickup_date: { $lte: req.body.drop_date } }, { drop_date: { $gte: req.body.drop_date } }] },
      { $and: [{ pickup_date: { $gte: req.body.pickup_date } }, { drop_date: { $lte: req.body.drop_date } }] },
    ],
  });
  if (overlapping) {
    res.status(400);
    throw new Error('This vehicle is not available for the selected dates.');
  }

  // booking id
  const bcount = (await Booking.countDocuments()) + 1;
  const bookingId = `CCR-${year}-${String(bcount).padStart(6, '0')}`;

  const bookingData = {
    ...req.body,
    customer_id: customer._id,
    car_id: carId,
    bookingId,
    verification_status: 'pending',
    booking_status: 'pending',
    notes: req.body.notes ? [{ text: req.body.notes, createdAt: new Date() }] : [],
  };

  const booking = await Booking.create(bookingData);

  if (req.body.document) {
    try {
      await Document.findByIdAndUpdate(req.body.document, { booking: booking._id, user: customer._id });
      booking.documents = [req.body.document];
      await booking.save();
    } catch (err) {
      console.warn('Failed to link document to booking', err.message || err);
    }
  }

  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('documents').populate('customer_id');
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

export const actionBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('car_id');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { action, vehicleId, note } = req.body;

  if (action === 'approve') {
    booking.booking_status = 'approved';
    // mark vehicle unavailable
    if (booking.car_id) {
      await Vehicle.findByIdAndUpdate(booking.car_id._id, { availability: false });
    }
    // send notification to customer/user if email exists
    try {
      const to = booking.user_id?.email || booking.customer_id?.email;
      if (to) {
        notificationService.sendEmailNotification(
          to,
          'Booking Approved',
          `Your booking ${booking.bookingId} has been approved.`
        );
      }
    } catch (err) {
      console.warn('Notification failed', err.message || err);
    }
  } else if (action === 'reject') {
    booking.booking_status = 'rejected';
  } else if (action === 'request_reupload') {
    booking.verification_status = 'partial';
  } else if (action === 'assign_vehicle' && vehicleId) {
    const vId = await resolveVehicleId(vehicleId);
    booking.car_id = vId;
    booking.booking_status = 'approved';
    await Vehicle.findByIdAndUpdate(vId, { availability: false });
  } else if (action === 'mark_vehicle_booked') {
    if (booking.car_id) await Vehicle.findByIdAndUpdate(booking.car_id._id, { availability: false });
  } else if (action === 'mark_vehicle_available') {
    if (booking.car_id) await Vehicle.findByIdAndUpdate(booking.car_id._id, { availability: true });
  }

  if (note) {
    booking.notes = booking.notes || [];
    booking.notes.push({ admin: req.user._id, text: note, createdAt: new Date() });
  }

  await booking.save();
  const populated = await Booking.findById(booking._id).populate('car_id').populate('user_id').populate('documents');
  res.json(normalizeBooking(populated));
});
