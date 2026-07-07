import mongoose from "mongoose";
import Vehicle from "./models/Vehicle.js";
import { env } from "./config/env.js";

async function main() {
  if (!env.mongoUri) {
    console.error("No MONGO_URI");
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri, { autoIndex: true });
  const items = await Vehicle.find({ name: /Swift/i, isDeleted: false }).lean();
  console.log("Found", items.length, "Swift vehicles");
  for (const v of items) {
    console.log('---');
    console.log('id', v._id?.toString());
    console.log('seedId', v.seedId);
    console.log('name', v.name);
    console.log('brand', v.brand);
    console.log('year', v.year);
    console.log('yearRange', v.yearRange);
    console.log('fuel_type', v.fuel_type);
    console.log('price_per_day', v.price_per_day);
    console.log('transmission', v.transmission);
    console.log('isDeleted', v.isDeleted);
    console.log('status', v.status);
  }
  await mongoose.disconnect();
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
