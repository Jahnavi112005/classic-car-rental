import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { profileFor, sessionFor } from '../services/tokenService.js';
import { sendEmailNotification } from '../services/notificationService.js';
import { env } from '../config/env.js';

// Registration disabled for public customers. Staff users must be created via seed or owner panel.
export const register = asyncHandler(async (req, res) => {
  res.status(404);
  throw new Error('Registration is disabled');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (process.env.NODE_ENV !== 'production') console.log('Login request received for:', email);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    if (process.env.NODE_ENV !== 'production') console.log('User not found for email:', email);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const matched = await user.matchPassword(password);
  if (!matched) {
    if (process.env.NODE_ENV !== 'production') console.log('Password did not match for:', email);
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (process.env.NODE_ENV !== 'production') console.log('Password matched for:', email);

  if (user.role !== 'booking_staff' && user.role !== 'owner') {
    console.log('Unauthorized role for login attempt:', user.role);
    return res.status(403).json({ success: false, message: 'Access denied for this account.' });
  }

  return res.json({ session: sessionFor(user), profile: profileFor(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (process.env.NODE_ENV !== 'production') console.log('ForgotPassword received email:', email);
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'Booking Staff account not found.' });
  }

  if (user.role !== 'booking_staff') {
    return res.status(403).json({ success: false, message: 'Unauthorized account.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password/${token}`;
  const message = `You requested a password reset for your Booking Staff account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, please ignore this email.`;

  try {
    await sendEmailNotification(user.email, 'Classic Car Rental Password Reset', message);
  } catch (error) {
    console.error('Password reset email failed:', error);
    return res.status(500).json({ success: false, message: 'Failed to send password reset email.' });
  }

  return res.status(200).json({ success: true, message: 'Password reset link sent successfully.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('Invalid token');
  }
  if (!password || !confirmPassword) {
    res.status(400);
    throw new Error('Password and confirm password are required');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  if (user.role !== 'booking_staff') {
    res.status(403);
    throw new Error('Access denied');
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: 'Password updated successfully. Please login again.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ session: sessionFor(req.user), profile: profileFor(req.user) });
});
