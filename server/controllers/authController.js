import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { profileFor, sessionFor } from '../services/tokenService.js';

// Registration disabled for public customers. Staff users must be created via seed or owner panel.
export const register = asyncHandler(async (req, res) => {
  res.status(404);
  throw new Error('Registration is disabled');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const validRoles = ['owner', 'booking_staff'];
  if (!validRoles.includes(user.role)) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ session: sessionFor(user), profile: profileFor(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ session: sessionFor(req.user), profile: profileFor(req.user) });
});
