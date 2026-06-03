import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminStyle.css";
import useUsers from "../../../hooks/useUsers";
import userService from "../../../services/userService";

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


function BadgeRole({ role }) {
  return (
    <span className={`badge ${role === "Admin" ? "b-confirm" : "b-role-user"}`}>
      {role}
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
            </div>
          </div>
        </div>

        {/* Infos */}
        <div className="ud-meta">
          <div className="ud-meta-item">
            <span className="ud-meta-label">Réservations totales</span>
            <span className="ud-meta-val">{user.reservations.length}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Rôle</span>
            <span className="ud-meta-val">{user.role}</span>
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

// ── Modal confirmation suppression ───────────────────────
function DeleteConfirmModal({ user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await userService.deleteUser(user.id);
      onDeleted(user.id);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div
        className="ud-panel"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-close" onClick={onClose}>✕</button>

        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={52} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
          </div>
        </div>

        <p style={{ margin: "1.2rem 0 0.6rem", fontSize: "0.9rem" }}>
          Confirmer la suppression de cet utilisateur ? Cette action est irréversible.
        </p>

        {error && (
          <p
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "0.6rem 0.8rem",
              color: "#b91c1c",
              fontSize: "0.82rem",
              margin: "0.8rem 0",
            }}
          >
            {error}
          </p>
        )}

        <div className="ud-actions" style={{ marginTop: "1.2rem" }}>
          <button
            className="ud-btn-danger"
            disabled={deleting || !!error}
            onClick={handleDelete}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <IconTrash /> {deleting ? "Suppression…" : "Supprimer"}
          </button>
          <button className="ud-btn-ghost" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal édition du rôle ─────────────────────────────────
function EditRoleModal({ user, onClose, onSaved }) {
  const backendRole = user.role === "Admin" ? "admin" : "user";
  const [role, setRole] = useState(backendRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await userService.updateUserRole(user.id, role);
      onSaved(user.id, role === "admin" ? "Admin" : "Utilisateur");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div
        className="ud-panel"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-close" onClick={onClose}>✕</button>

        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={52} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.82rem",
                color: "var(--muted)",
              }}
            >
              Rôle
            </label>
            <select
              className="flt-select"
              style={{ width: "100%" }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.8rem", marginBottom: "0.8rem" }}>
              {error}
            </p>
          )}

          <div className="ud-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <IconEdit /> {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" className="ud-btn-ghost" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
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
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { users, loading, error, updateUserInList, removeUserFromList } = useUsers();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
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
                {users.length}
                <span className="kpi-unit"> users</span>
              </span>
            </div>
          </div>
          <div className="kpi-card c-green">
            <p className="kpi-label">Utilisateurs</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {users.filter((u) => u.role === "Utilisateur").length}
                <span className="kpi-unit"> users</span>
              </span>
            </div>
          </div>
          <div className="kpi-card c-teal">
            <p className="kpi-label">Admins</p>
            <div className="kpi-row-val">
              <span className="kpi-val">
                {users.filter((u) => u.role === "Admin").length}
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
          <div className="table-scroll">
          {error && (
            <p style={{ padding: "1rem", color: "var(--danger, #ef4444)" }}>
              Erreur : {error}
            </p>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Réservations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
                    Chargement…
                  </td>
                </tr>
              ) : filtered.map((u) => (
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
                    <button
                      className="act-btn act-edit"
                      onClick={() => setEditing(u)}
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="act-btn act-del"
                      onClick={() => setDeleting(u)}
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Fiche détaillée */}
      {selected && (
        <UserDetail user={selected} onClose={() => setSelected(null)} />
      )}

      {/* Modal suppression */}
      {deleting && (
        <DeleteConfirmModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            removeUserFromList(id);
            setDeleting(null);
          }}
        />
      )}

      {/* Modal édition du rôle */}
      {editing && (
        <EditRoleModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(id, role) => {
            updateUserInList(id, role);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
