import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowRoles, redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    const userRole = String(user.role || '').toLowerCase();
    const normalizedRoles = allowRoles.map((role) => String(role).toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      const fallbackPath = userRole === 'admin' ? '/dashboardAdmin' : '/dashboardUser';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <Outlet />;
}