import User from '../models/User.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function ensureCollections(db, names = []) {
  const existing = await db.listCollections().toArray();
  const existingNames = existing.map(c => c.name);
  for (const name of names) {
    if (!existingNames.includes(name)) {
      try {
        await db.createCollection(name);
        console.log(`Created collection: ${name}`);
      } catch (err) {
        console.error(`Failed to create collection ${name}:`, err.message || err);
      }
    } else {
      console.log(`Collection exists: ${name}`);
    }
  }
}

export async function seedIfNeeded() {
  if (!mongoose.connection || !mongoose.connection.db) {
    console.warn('Database connection not available for seeding.');
    return;
  }

  const db = mongoose.connection.db;

  try {
    const userCount = await User.countDocuments();
    console.log('Users found:', userCount);

    if (userCount === 0) {
      const bookingEmail = process.env.BOOKING_EMAIL || 'bookings@classiccarrentals.in';
      const bookingPassword = process.env.BOOKING_PASSWORD || 'Login@2026';

      const ownerEmail = process.env.OWNER_EMAIL || 'owner@classiccarrentals.in';
      const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@2026';

      try {
        await User.create({
          name: 'Booking Staff',
          email: bookingEmail,
          phone: '',
          password: bookingPassword,
          role: 'booking_staff',
        });
        console.log(`Admin booking staff created: ${bookingEmail}`);
      } catch (err) {
        console.error('Failed creating booking staff user:', err.message || err);
      }

      try {
        await User.create({
          name: 'Owner',
          email: ownerEmail,
          phone: '',
          password: ownerPassword,
          role: 'owner',
        });
        console.log(`Owner account created: ${ownerEmail}`);
      } catch (err) {
        console.error('Failed creating owner user:', err.message || err);
      }
    } else {
      console.log('Skipping seeding users - users already exist');
    }

    // Ensure essential collections exist
    await ensureCollections(db, ['users', 'vehicles', 'bookings', 'inquiries', 'reviews']);
  } catch (err) {
    console.error('Seeding check failed:', err.message || err);
  }
}

export default { seedIfNeeded };
