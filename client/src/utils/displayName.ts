import { Profile } from '../types';

export function normalizeRepeatedName(name?: string | null) {
  const raw = (name || '').trim();
  if (!raw) return '';

  if (
    raw.length % 2 === 0
    && raw.slice(0, raw.length / 2).toLowerCase() === raw.slice(raw.length / 2).toLowerCase()
  ) {
    return raw.slice(0, raw.length / 2);
  }

  return raw;
}

export function getRoleLabel(role?: string | null) {
  if (role === 'booking_staff') return 'Booking Staff';
  if (role === 'owner') return 'Owner';
  return 'Account';
}

export function getAccountDisplayName(profile?: Pick<Profile, 'name' | 'role'> | null) {
  if (!profile) return 'Account';

  if (profile.role === 'booking_staff' || profile.role === 'owner') {
    return getRoleLabel(profile.role);
  }

  const cleaned = normalizeRepeatedName(profile.name);
  return cleaned.split(/\s+/)[0] || 'Account';
}
