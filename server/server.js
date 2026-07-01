import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
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

await connectDB();

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
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
  console.log('Resolved Tesseract:', resolvedTesseract);
  console.log('Resolved Poppler:', resolvedPoppler);
} catch (error) {
  console.error('Executable resolution failed:', error.message);
  process.exit(1);
}

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
