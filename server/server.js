import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("DNS Servers:", dns.getServers());
// Note: Removed DNS override used for local debugging.
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
import { getOcrStatus } from './services/identityVerificationService.js';

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
  console.warn(
    'SMTP verification failed. Email features will be unavailable until SMTP is reachable.'
  );
} else {
  console.log('SMTP connection successful');
}

// Seed default admin and required collections if needed
try {
  await seedIfNeeded();
} catch (err) {
  console.error('Automatic seeding failed:', err.message || err);
}

const app = express();

app.use(helmet());

// Support multiple allowed origins (comma-separated in CLIENT_URL) and production-safe CORS
const allowedOrigins = (env.clientUrl || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server requests without Origin.
    if (!origin) return callback(null, true);

    // In development, allow localhost origins across common dev ports.
    if (env.nodeEnv !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }

    // Production and explicit allowlist handling.
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin not allowed (${origin})`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(apiLimiter);
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

const { ocrAvailable, tesseractPath, pdftoppmPath } = getOcrStatus();

if (!ocrAvailable) {
  console.warn('OCR binaries are not fully available. OCR features will be disabled.');
  if (!tesseractPath) {
    console.warn('Tesseract executable not found. Set TESSERACT_PATH if available.');
  }
  if (!pdftoppmPath) {
    console.warn('Poppler executable not found. Set PDFTOPPM_PATH if available.');
  }
}

if (process.env.NODE_ENV !== 'production') {
  console.log('Resolved Tesseract:', tesseractPath);
  console.log('Resolved Poppler:', pdftoppmPath);
}

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
