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
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL,
};
