import { useNavigate, useLocation } from "react-router-dom";

const NAV_ROUTES = {
  Dashboard: "/dashboardAdmin",
  Salles: "/Gestionsalles",
  Reservations: "/GestionReservations",
  Utilisateurs: "/GestionUser",
};

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        Woorkly<span>,</span>
      </div>
      <nav className="sidebar-nav">
        {["Dashboard", "Salles", "Reservations", "Utilisateurs"].map((p) => (
          <button
            key={p}
            className={`snav-btn ${NAV_ROUTES[p] === pathname ? "active" : ""}`}
            onClick={() => navigate(NAV_ROUTES[p])}
          >
            {p}
          </button>
        ))}
      </nav>
    </aside>
  );
}
