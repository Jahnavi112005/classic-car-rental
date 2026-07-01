import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized'));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    // Ensure the user's role is one of the allowed internal roles
    const validRoles = ['owner', 'booking_staff'];
    if (!validRoles.includes(user.role)) {
      res.status(403);
      return next(new Error('Access denied'));
    }

    req.user = user;
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorized'));
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    if (allowedRoles.includes(req.user.role)) return next();

    res.status(403);
    next(new Error('Access denied'));
  };
}

export function adminOnly(req, res, next) {
  return authorizeRoles('owner', 'booking_staff')(req, res, next);
}
