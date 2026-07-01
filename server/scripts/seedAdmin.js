import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../config/env.js';
import User from '../models/User.js';

dotenv.config();

async function seedAdminUsers() {
  await mongoose.connect(env.mongoUri, { autoIndex: true });

    const ownerEmail = 'owner@classiccarrentals.in';
    const bookingEmail = 'booking@classiccarrentals.in';

    const ownerPassword = process.env.OWNER_PASSWORD || 'OwnerPass123!';
    const bookingPassword = process.env.BOOKING_PASSWORD || 'BookingPass123!';

    const owner = await User.findOne({ email: ownerEmail });
    const bookingStaff = await User.findOne({ email: bookingEmail });

    if (owner) {
      owner.name = 'Owner';
      owner.role = 'owner';
      owner.password = ownerPassword;
      await owner.save();
      console.log(`Updated Owner account password: ${ownerEmail}`);
    } else {
      await User.create({
        name: 'Owner',
        email: ownerEmail,
        phone: '',
        password: ownerPassword,
        role: 'owner',
      });
      console.log(`Created Owner account: ${ownerEmail}`);
    }

    if (bookingStaff) {
      bookingStaff.name = 'Booking Staff';
      bookingStaff.role = 'booking_staff';
      bookingStaff.password = bookingPassword;
      await bookingStaff.save();
      console.log(`Updated Booking Staff account password: ${bookingEmail}`);
    } else {
      await User.create({
        name: 'Booking Staff',
        email: bookingEmail,
        phone: '',
        password: bookingPassword,
        role: 'booking_staff',
      });
      console.log(`Created Booking Staff account: ${bookingEmail}`);
    }

  await mongoose.disconnect();
}

seedAdminUsers()
  .then(() => {
    console.log('Seeding complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
