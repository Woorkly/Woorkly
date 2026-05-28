import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import '../page/Dashboard/DashBoardAdmin/adminStyle.css';

const NAV_ITEMS = [
  { label: "Dashboard",    route: "/dashboardAdmin" },
  { label: "Salles",       route: "/Gestionsalles" },
  { label: "Réservations", route: "/GestionReservations" },
  { label: "Utilisateurs", route: "/GestionUser" },
];

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleNav = (route) => {
    navigate(route);
    setMenuOpen(false);
  };

  return (
    <div className="admin-wrap">
      {!isMobile && <AdminSidebar />}
      <main className="admin-main">

        {/* Header mobile — remplace la sidebar sur petit écran */}
        <header className="admin-header">
          <div className="admin-header__logo" onClick={() => navigate('/')}>
            Woorkly<span>,</span>
          </div>
          <button
            className={`admin-header__burger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(s => !s)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            <span /><span /><span />
          </button>
          {menuOpen && (
            <nav className="admin-header__dropdown">
              {NAV_ITEMS.map(({ label, route }) => (
                <button
                  key={label}
                  className={`admin-header__link${route === pathname ? ' active' : ''}`}
                  onClick={() => handleNav(route)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
        </header>

        <Outlet />
      </main>
    </div>
  );
}
