// Note: Removed DNS override used for local debugging.
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { verifySmtpConnection } from './services/notificationService.js';
import { seedIfNeeded } from './services/seedService.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import placeholderRoutes from './routes/placeholderRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import { resolveExecutable } from './services/identityVerificationService.js';

if (process.env.NODE_ENV === 'production') {
  if (!env.clientUrl) {
    console.error('CLIENT_URL is required in production. Set CLIENT_URL to your frontend URL.');
    process.exit(1);
  }
  if (!env.jwtSecret || env.jwtSecret === 'change-this-secret-in-production') {
    console.error('JWT_SECRET must be set to a strong secret in production.');
    process.exit(1);
  }
}

await connectDB();

const smtpStatus = await verifySmtpConnection();
if (!smtpStatus.success) {
  console.error('SMTP startup verification failed:', smtpStatus.error);
  process.exit(1);
}

// Seed default admin and required collections if needed
try {
  await seedIfNeeded();
} catch (err) {
  console.error('Automatic seeding failed:', err.message || err);
}

const app = express();

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(apiLimiter);

// Support multiple allowed origins (comma-separated in CLIENT_URL) and production-safe CORS
const allowedOrigins = (env.clientUrl || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser server-to-server requests
      if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
      return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/customers', placeholderRoutes);
app.use('/api/payments', placeholderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/notifications', placeholderRoutes);
app.use('/api/branches', placeholderRoutes);
app.use('/api/admins', placeholderRoutes);

try {
  const resolvedTesseract = resolveExecutable('tesseract', 'TESSERACT_PATH');
  const resolvedPoppler = resolveExecutable('pdftoppm', 'PDFTOPPM_PATH');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Resolved Tesseract:', resolvedTesseract);
    console.log('Resolved Poppler:', resolvedPoppler);
  }
} catch (error) {
  console.error('Executable resolution failed:', error.message);
  process.exit(1);
}

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
