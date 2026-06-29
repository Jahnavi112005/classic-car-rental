import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { profileFor, sessionFor } from '../services/tokenService.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({ email, password, name, phone });
  res.status(201).json({ session: sessionFor(user), profile: profileFor(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({ session: sessionFor(user), profile: profileFor(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ session: sessionFor(req.user), profile: profileFor(req.user) });
});
