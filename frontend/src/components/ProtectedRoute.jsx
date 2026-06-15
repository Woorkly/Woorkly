// Garde de route basé sur l'authentification et le rôle.
// - Pas de user       → redirige vers /login (ou redirectTo)
// - Rôle non autorisé → redirige vers le dashboard du rôle réel
// - Autorisé          → affiche le contenu via <Outlet />
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