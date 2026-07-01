import mongoose from 'mongoose';
import { env } from '../config/env.js';
import Vehicle from '../models/Vehicle.js';
import { fleetCars } from '../utils/fleetSeed.js';

async function importFleetVehicles() {
  await mongoose.connect(env.mongoUri, { autoIndex: true });

  let insertedCount = 0;
  let skippedCount = 0;

  for (const car of fleetCars) {
    const existing = await Vehicle.findOne({ seedId: car.id });

    if (existing) {
      skippedCount += 1;
      continue;
    }

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
      availability: car.availability,
      security_deposit: car.security_deposit,
      rating: car.rating,
      reviews_count: car.reviews_count,
      featured: car.featured || false,
      status: 'available',
      isDeleted: false,
      createdAt: new Date(car.created_at),
      updatedAt: new Date(car.created_at),
    };

    await Vehicle.create(vehicleData);
    insertedCount += 1;
  }

  const totalCount = await Vehicle.countDocuments({ isDeleted: false });
  console.log(`Imported fleet vehicles into MongoDB.`);
  console.log(`Inserted: ${insertedCount}`);
  console.log(`Skipped existing: ${skippedCount}`);
  console.log(`Total active vehicles now: ${totalCount}`);

  await mongoose.disconnect();
}

importFleetVehicles()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed to import fleet vehicles:', error);
    process.exit(1);
  });
