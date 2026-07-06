import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    const raw = String(env.mongoUri || '');
    const masked = raw.replace(/(mongodb(?:\+srv)?:\/\/)(.*@)/i, '$1***@');
    console.log('Connecting to MongoDB:', masked || '(not set)');
  } catch (e) {
    console.log('Connecting to MongoDB');
  }

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
    console.error('Failed to connect to MongoDB:', error.message || error);
    if (error && (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || String(error).includes('querySrv'))) {
      console.error('DNS/SRV lookup failed. If you are using MongoDB Atlas (srv) URI, ensure the server has network/DNS access to resolve the SRV record.');
      console.error('As a temporary workaround for restricted environments, set MONGO_URI to a standard (non+srv) connection string or allow outbound DNS.');
    }
    process.exit(1);
  }
}
