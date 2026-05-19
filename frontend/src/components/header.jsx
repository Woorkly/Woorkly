import "./header.css";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = ({ isDashboardUser = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div>
      <section className="header-hero">
        {/* NAV */}
        <nav className={`header-nav ${isDashboardUser ? 'header-nav--dashboard-user' : ''}`}>
          <div className="header-nav__links">
            <a href="#">SALLES</a>
            <a href="#">MON ESPACE</a>
            {user?.role?.toLowerCase() === "admin" && (
              <a
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/dashboardAdmin")}
              >
                ADMIN
              </a>
            )}
          </div>
          <div
            className="header-nav__logo"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            woorkly.
          </div>
          <div className="header-nav__actions">
            <button className="header-nav__btn-outline">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Voir nos espaces
            </button>
            {user ? (
              <div className="header-user-menu">
                <span>{user.nom || user.email}</span>
                <button className="header-nav__btn-dark" onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                className="header-nav__btn-dark"
                onClick={() => navigate("/login")}
              >
                Connexion
              </button>
            )}
          </div>
        </nav>
      </section>
    </div>
  );
};

export default Header;
