import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongoUri) {
    console.error('MONGO_URI is not set. Please add MONGO_URI=mongodb://127.0.0.1:27017/classic-car-rental to server/.env');
    process.exit(1);
  }
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Exit immediately — do not attempt any fallback.
    process.exit(1);
  }
}
