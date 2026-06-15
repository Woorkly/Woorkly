/**
 * Page Dashboard Utilisateur.
 *
 * Affiche :
 *   - Header avec avatar cliquable (édition de profil)
 *   - 3 KPI (réservations à venir, heures ce mois, taux de présence)
 *   - Graphe d'activité mensuelle (BarChartCard)
 *   - Répartition par type de réunion (DonutChart)
 *   - Tableau des réservations à venir (paginé)
 *   - Tableau de l'historique complet (paginé)
 *   - Modal d'édition du profil
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import reservationService from '../../../services/reservationService';
import userService from '../../../services/userService';

/* Composants partagés */
import StatusBadge  from '../../../components/common/StatusBadge';
import Pagination   from '../../../components/common/Pagination';
import DonutChart   from '../../../components/charts/DonutChart';
import BarChartCard from '../../../components/charts/BarChartCard';

/* Utilitaires de date */
import { formatDateLong, formatTime } from '../../../utils/dateUtils';

import './DashboardUser.css';

/* ── Constantes ─────────────────────────────────────────────── */

const PAGE_SIZE = 5;

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

/* Mapping type de réservation → libellé + couleur pour le donut */
const TYPE_CONFIG = {
  'heure':        { label: "À l'heure",       color: '#1A56A0' },
  'demi-journee': { label: 'Demi-journée',     color: '#38BDF8' },
  'journee':      { label: 'Journée entière',  color: '#10B981' },
};

/* ── Helpers ─────────────────────────────────────────────────── */

/** Remplit les 12 mois à partir des données API (mois manquants = 0). */
function buildMonthlyData(monthly) {
  const byMonth = {};
  monthly.forEach((m) => { byMonth[m.mois] = m; });
  return MONTHS_FR.map((month, i) => ({
    month,
    reservations: Number(byMonth[i + 1]?.reservations) || 0,
    annulations:  Number(byMonth[i + 1]?.annulations)  || 0,
  }));
}

/** Transforme type_usage en tableau pour DonutChart (percent arrondi). */
function buildUsageData(typeUsage) {
  const total = typeUsage.reduce((s, t) => s + Number(t.total), 0);
  if (total === 0) {
    return Object.entries(TYPE_CONFIG).map(([, cfg]) => ({
      label: cfg.label, percent: 0, color: cfg.color,
    }));
  }
  return typeUsage.map((t) => ({
    label:   TYPE_CONFIG[t.type_reservation]?.label || t.type_reservation,
    percent: Math.round((Number(t.total) / total) * 100),
    color:   TYPE_CONFIG[t.type_reservation]?.color || '#888',
  }));
}

/* ── Valeurs par défaut avant chargement ─────────────────────── */

const DEFAULT_MONTHLY = MONTHS_FR.map((month) => ({ month, reservations: 0, annulations: 0 }));
const DEFAULT_USAGE   = Object.entries(TYPE_CONFIG).map(([, cfg]) => ({
  label: cfg.label, percent: 0, color: cfg.color,
}));

/* ── Modal d'édition du profil ───────────────────────────────── */

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    nom:      user?.nom   || '',
    email:    user?.email || '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { nom: form.nom, email: form.email };
      if (form.password) payload.password = form.password;
      if (avatarFile) payload.avatar_url = await userService.uploadAvatar(avatarFile);
      await onSave(payload);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
      setSaving(false);
    }
  };

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div className="ep-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ep-header">
          <h2 className="ep-title">Modifier mon profil</h2>
          <button className="ep-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="ep-form" onSubmit={handleSubmit} noValidate>
          <div className="ep-field">
            <label htmlFor="ep-nom">Nom complet</label>
            <input id="ep-nom" type="text" name="nom"
              value={form.nom} onChange={handleChange} required autoFocus />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-email">Adresse e-mail</label>
            <input id="ep-email" type="email" name="email"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-password">
              Nouveau mot de passe
              <span className="ep-optional"> — laisser vide pour ne pas changer</span>
            </label>
            <input id="ep-password" type="password" name="password"
              value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-avatar">
              Photo de profil (Avatar)
              <span className="ep-optional"> — optionnel</span>
            </label>
            <input id="ep-avatar" type="file" name="avatar"
              accept="image/*" onChange={handleFileChange} />
          </div>

          {error && <p className="ep-error">{error}</p>}

          <div className="ep-actions">
            <button type="button" className="ep-btn-ghost" onClick={onClose} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="ep-btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────── */

export default function DashboardUser() {
  const { user, updateUser } = useAuth();

  const [upcoming,         setUpcoming]         = useState([]);
  const [history,          setHistory]          = useState([]);
  const [monthlyData,      setMonthlyData]      = useState(DEFAULT_MONTHLY);
  const [usageData,        setUsageData]        = useState(DEFAULT_USAGE);
  const [heuresMois,       setHeuresMois]       = useState(null);
  const [tauxPresence,     setTauxPresence]     = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [upcomingPage,     setUpcomingPage]     = useState(1);
  const [historyPage,      setHistoryPage]      = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSaveProfile = async (payload) => {
    const result = await userService.updateMyProfile(user.userId, payload);
    updateUser(result?.user || payload);
    setShowProfileModal(false);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [upcomingData, historyData, statsData] = await Promise.all([
          reservationService.getMyUpcoming(),
          reservationService.getMyHistory(),
          reservationService.getMyStats(),
        ]);
        setUpcoming(upcomingData);
        setHistory(historyData);
        setHeuresMois(statsData.kpis.heures_ce_mois);
        setTauxPresence(statsData.kpis.taux_presence);
        setMonthlyData(buildMonthlyData(statsData.monthly));
        setUsageData(buildUsageData(statsData.type_usage));
      } catch (err) {
        console.error('Erreur chargement dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* Calcul des initiales pour l'avatar */
  const dashboardName  = user?.nom || user?.email || 'Utilisateur';
  const dashboardEmail = user?.email || '';
  const avatarLabel = dashboardName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="dashboard">
      {/* ── Header avec avatar cliquable ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-logo">Woorkly</span>
          <span className="dash-title">Dashboard de {dashboardName}</span>
        </div>
        <div
          className="dash-avatar dash-avatar--clickable"
          onClick={() => setShowProfileModal(true)}
          title="Modifier mon profil"
        >
          {user?.avatar_url && user.avatar_url !== 'default-avatar.png' ? (
            <img src={user.avatar_url} alt={avatarLabel} className="dash-avatar__img" />
          ) : (
            <span>{avatarLabel || 'U'}</span>
          )}
        </div>
      </header>

      {showProfileModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      <div className="dashboard-subtitle">
        {dashboardEmail ? `Connecté en tant que ${dashboardEmail}` : 'Compte connecté'}
      </div>

      <main className="dash-main">
        {/* ── KPIs ── */}
        <section className="kpi-row">
          <div className="kpi-card kpi-accent">
            <p className="kpi-label">Mes Réservations à Venir</p>
            <p style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {loading ? '—' : upcoming.length}{' '}
              <span className="kpi-unit">{upcoming.length <= 1 ? 'salle' : 'salles'}</span>
            </p>
          </div>

          <div className="kpi-card kpi-blue">
            <p className="kpi-label">Heures en Réunion</p>
            <p style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {loading || heuresMois === null ? '—' : `${heuresMois}h`}{' '}
              <span className="kpi-unit">ce mois</span>
            </p>
          </div>

          <div className="kpi-card kpi-green">
            <p className="kpi-label">Taux de Présence</p>
            <p style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {loading || tauxPresence === null ? '—' : `${tauxPresence}%`}
            </p>
          </div>
        </section>

        {/* ── Graphes ── */}
        <section className="charts-row">
          <div className="card chart-card">
            <h3 className="card-title">Mon Activité de Réservation (Annuel)</h3>
            <BarChartCard data={monthlyData} />
            <div className="chart-legend">
              <span className="legend-line reservations" />
              <span className="legend-label">Total Réservations</span>
              <span className="legend-line annulations" />
              <span className="legend-label">Annulations</span>
            </div>
          </div>

          <div className="card donut-card">
            <h3 className="card-title">Mon Usage par Type de Réunion</h3>
            {/* variant="user" utilise les classes CSS de DashboardUser.css */}
            <DonutChart
              data={usageData}
              dataKey="percent"
              nameKey="label"
              pctKey="percent"
              variant="user"
            />
          </div>
        </section>

        {/* ── Tableaux paginés ── */}
        <section className="tables-row">
          {/* Réservations à venir */}
          <div className="card table-card">
            <h3 className="card-title">Réservations — À Venir</h3>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>Chargement…</p>
            ) : upcoming.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>Aucune réservation à venir.</p>
            ) : (
              <>
                <table className="resa-table">
                  <thead>
                    <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {upcoming
                      .slice((upcomingPage - 1) * PAGE_SIZE, upcomingPage * PAGE_SIZE)
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{formatDateLong(r.date)}</td>
                          <td>{r.salle_nom}</td>
                          <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                          <td><StatusBadge status={r.statut} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <Pagination
                  page={upcomingPage}
                  total={upcoming.length}
                  pageSize={PAGE_SIZE}
                  onChange={setUpcomingPage}
                />
              </>
            )}
          </div>

          {/* Historique complet */}
          <div className="card table-card">
            <h3 className="card-title">Historique Complet</h3>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>Chargement…</p>
            ) : history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>Aucun historique de réservation.</p>
            ) : (
              <>
                <table className="resa-table">
                  <thead>
                    <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {history
                      .slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE)
                      .map((r) => (
                        <tr key={r.id}>
                          <td>{formatDateLong(r.date)}</td>
                          <td>{r.salle_nom}</td>
                          <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                          <td><StatusBadge status={r.statut} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <Pagination
                  page={historyPage}
                  total={history.length}
                  pageSize={PAGE_SIZE}
                  onChange={setHistoryPage}
                />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
