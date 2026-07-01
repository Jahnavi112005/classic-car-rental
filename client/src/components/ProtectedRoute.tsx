import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roles';

type ProtectedRouteProps = {
  allowedRoles?: Array<'booking_staff' | 'owner'>;
  redirectTo?: string;
};

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-16 h-16 border-4 border-brown/20 border-t-brown rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(normalizeRole(profile?.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
