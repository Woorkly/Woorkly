import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./adminStyle.css";

const NAV_ROUTES = {
  Dashboard: "/dashboardAdmin",
  Salles: "/Gestionsalles",
  Reservations: "/GestionReservations",
  Utilisateurs: "/GestionUser",
};

// ── Icônes SVG ────────────────────────────────────────────
const IconEye = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const usersData = [
  {
    id: 1,
    nom: "Sarah Dupont",
    email: "sarah.dupont@woorkly.com",
    role: "Admin",
    statut: "Actif",
    inscription: "12 Jan 2024",
    initiales: "SD",
    couleur: "#1A56A0",
    reservations: [
      { date: "Oct 15 14:00", salle: "Innovation Hub", statut: "Confirmé" },
      { date: "Oct 12 10:00", salle: "Boardroom A", statut: "Terminé" },
      { date: "Oct 08 09:00", salle: "Creativity Suite", statut: "Terminé" },
    ],
  },
  {
    id: 2,
    nom: "Marc Lemoine",
    email: "marc.lemoine@woorkly.com",
    role: "Utilisateur",
    statut: "Actif",
    inscription: "03 Mar 2024",
    initiales: "ML",
    couleur: "#10B981",
    reservations: [
      { date: "Oct 15 11:30", salle: "Boardroom A", statut: "Annulé" },
      { date: "Oct 14 14:00", salle: "Boardroom B", statut: "Terminé" },
    ],
  },
  {
    id: 3,
    nom: "Julie Martin",
    email: "julie.martin@woorkly.com",
    role: "Utilisateur",
    statut: "Inactif",
    inscription: "18 Fév 2024",
    initiales: "JM",
    couleur: "#F59E0B",
    reservations: [
      { date: "Sep 30 09:00", salle: "Creativity Suite B", statut: "Terminé" },
    ],
  },
  {
    id: 4,
    nom: "Thomas Renard",
    email: "thomas.renard@woorkly.com",
    role: "Utilisateur",
    statut: "Actif",
    inscription: "27 Avr 2024",
    initiales: "TR",
    couleur: "#8B5CF6",
    reservations: [
      { date: "Oct 16 13:00", salle: "Innovation Hub", statut: "Confirmé" },
      { date: "Oct 10 11:00", salle: "Boardroom B", statut: "Terminé" },
      { date: "Oct 05 15:00", salle: "Boardroom A", statut: "Terminé" },
    ],
  },
  {
    id: 5,
    nom: "Camille Faure",
    email: "camille.faure@woorkly.com",
    role: "Utilisateur",
    statut: "Actif",
    inscription: "09 Jun 2024",
    initiales: "CF",
    couleur: "#EF4444",
    reservations: [],
  },
  {
    id: 6,
    nom: "Nicolas Blanc",
    email: "nicolas.blanc@woorkly.com",
    role: "Admin",
    statut: "Actif",
    inscription: "01 Jan 2024",
    initiales: "NB",
    couleur: "#0EA5E9",
    reservations: [
      { date: "Oct 17 10:00", salle: "Innovation Hub", statut: "Confirmé" },
      { date: "Oct 13 16:00", salle: "Creativity Suite", statut: "Terminé" },
    ],
  },
];

function BadgeRole({ role }) {
  return (
    <span className={`badge ${role === "Admin" ? "b-confirm" : "b-role-user"}`}>
      {role}
    </span>
  );
}

function BadgeStatut({ statut }) {
  return (
    <span
      className={`badge ${statut === "Actif" ? "b-available" : "b-offline"}`}
    >
      {statut}
    </span>
  );
}

function BadgeResa({ statut }) {
  const m = { Confirmé: "b-confirm", Terminé: "b-done", Annulé: "b-cancel" };
  return <span className={`badge ${m[statut] || ""}`}>{statut}</span>;
}

function Avatar({ initiales, couleur, size = 36 }) {
  return (
    <div
      className="u-avatar"
      style={{
        width: size,
        height: size,
        background: couleur,
        fontSize: size * 0.35,
      }}
    >
      {initiales}
    </div>
  );
}

// ── Fiche utilisateur ──────────────────────────────────────
function UserDetail({ user, onClose }) {
  return (
    <div className="ud-overlay" onClick={onClose}>
      <div className="ud-panel" onClick={(e) => e.stopPropagation()}>
        <button className="ud-close" onClick={onClose}>
          ✕
        </button>

        {/* Header profil */}
        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={64} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
            <div className="ud-badges">
              <BadgeRole role={user.role} />
              <BadgeStatut statut={user.statut} />
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="ud-meta">
          <div className="ud-meta-item">
            <span className="ud-meta-label">Date d'inscription</span>
            <span className="ud-meta-val">{user.inscription}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Réservations totales</span>
            <span className="ud-meta-val">{user.reservations.length}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Rôle</span>
            <span className="ud-meta-val">{user.role}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Statut</span>
            <span className="ud-meta-val">{user.statut}</span>
          </div>
        </div>

        {/* Réservations récentes */}
        <div className="ud-section">
          <h3 className="ud-section-title">Réservations récentes</h3>
          {user.reservations.length === 0 ? (
            <p className="ud-empty">Aucune réservation</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Salle</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {user.reservations.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.salle}</td>
                    <td>
                      <BadgeResa statut={r.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Actions */}
        <div className="ud-actions">
          <button
            className="btn-primary"
            style={{
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <IconEdit /> Modifier
          </button>
          <button
            className="ud-btn-danger"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <IconTrash /> Supprimer
          </button>
          <button className="ud-btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────
export default function GestionUtilisateurs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statFilter, setStatFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = usersData.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchStat = statFilter ? u.statut === statFilter : true;
    return matchSearch && matchRole && matchStat;
  });

  return (
    <>
      <div className="topbar">Tableau de bord Admin</div>
      <div className="page-body">
        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">Gestion Utilisateurs</h2>
          <button className="btn-primary">+ Ajouter un utilisateur</button>
        </div>

        {/* Stats rapides */}
        <div className="kpi-row">
          <div className="kpi-card c-blue">
            <p className="kpi-label">Total utilisateurs</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {usersData.length}
                <span className="kpi-unit"> users</span>
              </span>
            </div>
          </div>
          <div className="kpi-card c-green">
            <p className="kpi-label">Actifs</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {usersData.filter((u) => u.statut === "Actif").length}
                <span className="kpi-unit"> users</span>
              </span>
            </div>
          </div>
          <div className="kpi-card c-orange">
            <p className="kpi-label">Inactifs</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {usersData.filter((u) => u.statut === "Inactif").length}
                <span className="kpi-unit"> users</span>
              </span>
            </div>
          </div>
          <div className="kpi-card c-teal">
            <p className="kpi-label">Admins</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {usersData.filter((u) => u.role === "Admin").length}
                <span className="kpi-unit"> admins</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="filters-row">
          <div className="search-wrap">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-box"
              placeholder="Rechercher un utilisateur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="flt-label">Filtres :</span>
          <select
            className="flt-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Rôle ▾</option>
            <option value="Admin">Admin</option>
            <option value="Utilisateur">Utilisateur</option>
          </select>
          <select
            className="flt-select"
            value={statFilter}
            onChange={(e) => setStatFilter(e.target.value)}
          >
            <option value="">Statut ▾</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.8rem",
              color: "var(--muted)",
            }}
          >
            {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Tableau */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Réservations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="u-row" onClick={() => setSelected(u)}>
                  <td>
                    <Avatar initiales={u.initiales} couleur={u.couleur} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.nom}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                    {u.email}
                  </td>
                  <td>
                    <BadgeRole role={u.role} />
                  </td>
                  <td>
                    <BadgeStatut statut={u.statut} />
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                    {u.inscription}
                  </td>
                  <td>
                    <span className="u-resa-count">
                      {u.reservations.length}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="act-btn act-view"
                      onClick={() => setSelected(u)}
                    >
                      <IconEye />
                    </button>
                    <button className="act-btn act-edit">
                      <IconEdit />
                    </button>
                    <button className="act-btn act-del">
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fiche détaillée */}
      {selected && (
        <UserDetail user={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
