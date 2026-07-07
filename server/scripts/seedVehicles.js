import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Vehicle from '../models/Vehicle.js';
import { fleetCars } from '../utils/fleetSeed.js';

async function importFleetVehicles() {
  await mongoose.connect(env.mongoUri, { autoIndex: true });

  const seedIds = fleetCars.map(car => car.id);
  let insertedCount = 0;
  let updatedCount = 0;

  for (const car of fleetCars) {
    const existing = await Vehicle.findOne({ seedId: car.id });

    const vehicleData = {
      seedId: car.id,
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      yearRange: car.yearRange,
      category: car.category,
      seats: car.seats,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      price_per_day: car.price_per_day,
      images: car.images,
      description: car.description,
      features: car.features,
      security_deposit: car.security_deposit,
      rating: car.rating,
      reviews_count: car.reviews_count,
      featured: car.featured || false,
      isDeleted: false,
      updatedAt: new Date(car.created_at),
    };

    if (existing) {
      await Vehicle.findByIdAndUpdate(existing._id, vehicleData, {
        new: true,
        runValidators: true,
      });
      updatedCount += 1;
      continue;
    }

    await Vehicle.create({
      ...vehicleData,
      availability: car.availability,
      status: 'available',
      createdAt: new Date(car.created_at),
    });
    insertedCount += 1;
  }

  const cleanupResult = await Vehicle.updateMany(
    { seedId: { $nin: seedIds }, isDeleted: false },
    { isDeleted: true }
  );

  const totalCount = await Vehicle.countDocuments({ isDeleted: false });
  console.log(`Imported fleet vehicles into MongoDB.`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Marked old seeded vehicles deleted: ${cleanupResult.modifiedCount}`);
  console.log(`Total active vehicles now: ${totalCount}`);

  await mongoose.disconnect();
}

importFleetVehicles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed to import fleet vehicles:', error);
    process.exit(1);
  });
