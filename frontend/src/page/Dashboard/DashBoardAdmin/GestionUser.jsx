/**
 * Page Gestion Utilisateurs (admin).
 *
 * Affiche :
 *   - 3 KPI (total users, utilisateurs, admins)
 *   - Barre de recherche + filtre par rôle
 *   - Tableau de tous les utilisateurs (avatar, nom, email, rôle, nb réservations, actions)
 *   - Fiche détail d'un utilisateur avec ses réservations récentes
 *   - Modal de confirmation de suppression
 *   - Modal d'édition du rôle
 */

import { useState, useEffect } from 'react';
import './AdminStyle.css';

import useUsers     from '../../../hooks/useUsers';
import userService  from '../../../services/userService';

/* Composants partagés */
import Avatar      from '../../../components/common/Avatar';
import KPICard     from '../../../components/common/KPICard';
import RoleBadge   from '../../../components/common/RoleBadge';
import StatusBadge from '../../../components/common/StatusBadge';
import { IconEye, IconEdit, IconTrash, IconSearch } from '../../../components/icons/Icons';

/* Utilitaires */
import { formatDateShort } from '../../../utils/dateUtils';

/* ── Fiche détail utilisateur ───────────────────────────────── */

function UserDetail({ user, onClose, onEdit, onDelete }) {
  const [reservations, setReservations] = useState([]);
  const [loadingResa,  setLoadingResa]  = useState(true);
  const [resaError,    setResaError]    = useState(null);

  /* Chargement des réservations de cet utilisateur au montage */
  useEffect(() => {
    let cancelled = false;
    userService.getUserReservations(user.id)
      .then((data)  => { if (!cancelled) setReservations(data); })
      .catch((err)  => { if (!cancelled) setResaError(err.response?.data?.message || err.message); })
      .finally(()   => { if (!cancelled) setLoadingResa(false); });
    return () => { cancelled = true; };
  }, [user.id]);

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div className="ud-panel" onClick={(e) => e.stopPropagation()}>
        <button className="ud-close" onClick={onClose}>✕</button>

        {/* Header profil */}
        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={64} avatar_url={user.avatar_url} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
            <div className="ud-badges">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        {/* Méta-infos */}
        <div className="ud-meta">
          <div className="ud-meta-item">
            <span className="ud-meta-label">Réservations totales</span>
            <span className="ud-meta-val">{loadingResa ? '…' : reservations.length}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Rôle</span>
            <span className="ud-meta-val">{user.role}</span>
          </div>
        </div>

        {/* Réservations récentes */}
        <div className="ud-section">
          <h3 className="ud-section-title">Réservations récentes</h3>
          {loadingResa ? (
            <p className="ud-empty">Chargement…</p>
          ) : resaError ? (
            <p className="ud-empty" style={{ color: 'var(--danger, #ef4444)' }}>{resaError}</p>
          ) : reservations.length === 0 ? (
            <p className="ud-empty">Aucune réservation</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Salle</th><th>Horaire</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateShort(r.date)}</td>
                    <td>{r.salle_nom}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                      {r.heure_debut?.slice(0, 5)} – {r.heure_fin?.slice(0, 5)}
                    </td>
                    <td><StatusBadge status={r.statut} /></td>
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
            style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => { onClose(); onEdit(user); }}
          >
            <IconEdit /> Modifier
          </button>
          <button
            className="ud-btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => { onClose(); onDelete(user); }}
          >
            <IconTrash /> Supprimer
          </button>
          <button className="ud-btn-ghost" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal confirmation suppression ─────────────────────────── */

function DeleteConfirmModal({ user, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await userService.deleteUser(user.id);
      onDeleted(user.id);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div className="ud-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <button className="ud-close" onClick={onClose}>✕</button>

        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={52} avatar_url={user.avatar_url} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
          </div>
        </div>

        <p style={{ margin: '1.2rem 0 0.6rem', fontSize: '0.9rem' }}>
          Confirmer la suppression de cet utilisateur ? Cette action est irréversible.
        </p>

        {error && (
          <p style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px',
            padding: '0.6rem 0.8rem', color: '#b91c1c', fontSize: '0.82rem', margin: '0.8rem 0',
          }}>
            {error}
          </p>
        )}

        <div className="ud-actions" style={{ marginTop: '1.2rem' }}>
          <button
            className="ud-btn-danger"
            disabled={deleting || !!error}
            onClick={handleDelete}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <IconTrash /> {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
          <button className="ud-btn-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal édition du rôle ───────────────────────────────────── */

function EditRoleModal({ user, onClose, onSaved }) {
  /* Le backend attend "admin" ou "user" en minuscules */
  const backendRole = user.role === 'Admin' ? 'admin' : 'user';
  const [role,   setRole]   = useState(backendRole);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await userService.updateUserRole(user.id, role);
      onSaved(user.id, role === 'admin' ? 'Admin' : 'Utilisateur');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div className="ud-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <button className="ud-close" onClick={onClose}>✕</button>

        <div className="ud-header">
          <Avatar initiales={user.initiales} couleur={user.couleur} size={52} avatar_url={user.avatar_url} />
          <div className="ud-header-info">
            <h2 className="ud-name">{user.nom}</h2>
            <p className="ud-email">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
              Rôle
            </label>
            <select
              className="flt-select"
              style={{ width: '100%' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <p style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
              {error}
            </p>
          )}

          <div className="ud-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <IconEdit /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="ud-btn-ghost" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────── */

export default function GestionUtilisateurs() {
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selected,   setSelected]   = useState(null);
  const [editing,    setEditing]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const { users, loading, error, updateUserInList, removeUserFromList } = useUsers();

  /* Filtrage côté client : nom/email + rôle */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  return (
    <>
      <div className="topbar">Tableau de bord Admin</div>
      <div className="page-body">
        {/* ── Titre ── */}
        <div className="page-header">
          <h2 className="page-title">Gestion Utilisateurs</h2>
          <button className="btn-primary">+ Ajouter un utilisateur</button>
        </div>

        {/* ── Tuiles KPI ── */}
        <div className="kpi-row">
          <KPICard label="Total utilisateurs" value={users.length}
            unit="users" colorClass="c-blue" />
          <KPICard label="Utilisateurs"
            value={users.filter((u) => u.role === 'Utilisateur').length}
            unit="users" colorClass="c-green" />
          <KPICard label="Admins"
            value={users.filter((u) => u.role === 'Admin').length}
            unit="admins" colorClass="c-teal" />
        </div>

        {/* ── Filtres ── */}
        <div className="filters-row">
          <div className="search-wrap">
            <IconSearch />
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
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted)' }}>
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Tableau ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll">
            {error && (
              <p style={{ padding: '1rem', color: 'var(--danger, #ef4444)' }}>Erreur : {error}</p>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Avatar</th><th>Nom</th><th>Email</th>
                  <th>Rôle</th><th>Réservations</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Chargement…
                    </td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="u-row" onClick={() => setSelected(u)}>
                    <td>
                      <Avatar initiales={u.initiales} couleur={u.couleur} avatar_url={u.avatar_url} />
                    </td>
                    <td style={{ fontWeight: 500 }}>{u.nom}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><span className="u-resa-count">{u.totalReservations}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="act-btn act-view" onClick={() => setSelected(u)}>
                        <IconEye />
                      </button>
                      <button className="act-btn act-edit" onClick={() => setEditing(u)}>
                        <IconEdit />
                      </button>
                      <button className="act-btn act-del" onClick={() => setDeleting(u)}>
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

      {/* ── Modals ── */}
      {selected && (
        <UserDetail
          user={selected}
          onClose={() => setSelected(null)}
          onEdit={(u) => setEditing(u)}
          onDelete={(u) => setDeleting(u)}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => { removeUserFromList(id); setDeleting(null); }}
        />
      )}

      {editing && (
        <EditRoleModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(id, role) => { updateUserInList(id, role); setEditing(null); }}
        />
      )}
    </>
  );
}
