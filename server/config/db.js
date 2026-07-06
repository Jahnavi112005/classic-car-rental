import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  console.log("Mongo URI:", env.mongoUri);

  if (!env.mongoUri) {
    console.error("MONGO_URI is not set.");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB Connected");
    try {
      const dbName = mongoose.connection.name;
      console.log(`Database connected: ${dbName}`);
    } catch (e) {
      console.log('Database connected');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
