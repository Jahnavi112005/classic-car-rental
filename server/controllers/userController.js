import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { profileFor } from '../services/tokenService.js';

export const updateUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) !== req.params.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed to update this profile');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(profileFor(user));
});
