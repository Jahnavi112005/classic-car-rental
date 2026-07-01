export const ROLE_OPTIONS = ['booking_staff', 'owner'] as const;

export function normalizeRole(role?: string | null): 'booking_staff' | 'owner' {
  if (!role) return 'booking_staff';
  const r = String(role).toLowerCase();
  if (r === 'owner') return 'owner';
  return 'booking_staff';
}

export function isOwner(role?: string | null) {
  return normalizeRole(role) === 'owner';
}

export function getDashboardPath(role?: string | null) {
  return isOwner(role) ? '/owner/dashboard' : '/booking/dashboard';
}
