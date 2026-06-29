import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classic-car-rental',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
