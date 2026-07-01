import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  // Require a local MongoDB connection string via MONGO_URI only.
  // Do not fall back to any cloud or default URI.
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
