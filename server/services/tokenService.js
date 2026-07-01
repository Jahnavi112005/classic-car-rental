import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
}

export function sessionFor(user) {
  return {
    token: createToken(user),
    user: {
      id: String(user._id),
      email: user.email,
    },
  };
}

export function profileFor(user) {
  return {
    id: String(user._id),
    name: user.name,
    phone: user.phone || '',
    role: user.role,
    avatar_url: user.avatar_url || '',
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
