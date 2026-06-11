import { useState, useEffect } from "react";
import { useAuth } from '../../../hooks/useAuth';
import reservationService from '../../../services/reservationService';
import userService from '../../../services/userService';
import "./DashboardUser.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const TYPE_CONFIG = {
  'heure':        { label: "À l'heure",       color: '#1A56A0' },
  'demi-journee': { label: 'Demi-journée',     color: '#38BDF8' },
  'journee':      { label: 'Journée entière',  color: '#10B981' },
};

// Remplit les 12 mois à partir des données API (months manquants = 0)
function buildMonthlyData(monthly) {
  const byMonth = {};
  monthly.forEach(m => { byMonth[m.mois] = m; });
  return MONTHS_FR.map((month, i) => ({
    month,
    reservations: Number(byMonth[i + 1]?.reservations) || 0,
    annulations:  Number(byMonth[i + 1]?.annulations)  || 0,
  }));
}

// Transforme type_usage en format donut (percent arrondi)
function buildUsageData(typeUsage) {
  const total = typeUsage.reduce((s, t) => s + Number(t.total), 0);
  if (total === 0) {
    return Object.entries(TYPE_CONFIG).map(([, cfg]) => ({
      label: cfg.label, percent: 0, color: cfg.color,
    }));
  }
  return typeUsage.map(t => ({
    label:   TYPE_CONFIG[t.type_reservation]?.label || t.type_reservation,
    percent: Math.round((Number(t.total) / total) * 100),
    color:   TYPE_CONFIG[t.type_reservation]?.color || '#888',
  }));
}

const STATUT_MAP = {
  'en-attente': { cls: 'badge-pending', label: 'En attente' },
  'confirmee':  { cls: 'badge-confirm', label: 'Confirmé'  },
  'annulee':    { cls: 'badge-cancel',  label: 'Annulé'    },
  'terminee':   { cls: 'badge-done',    label: 'Terminé'   },
  'abandonne':  { cls: 'badge-abandon', label: 'Abandonné' },
};

function StatutBadge({ statut }) {
  const entry = STATUT_MAP[statut] || { cls: '', label: statut };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // On extrait la partie date (YYYY-MM-DD) au cas où dateStr est déjà un format ISO complet
  const datePart = String(dateStr).split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return String(timeStr).substring(0, 5);
}

// ─── Composants graphes ───────────────────────────────────────────────────────

function DonutChart({ data }) {
  const hasData = data.some(d => d.percent > 0);
  return (
    <div className="donut-wrapper">
      <div className="donut-visual">
        {hasData ? (
          <PieChart width={180} height={180}>
            <Pie
              data={data}
              dataKey="percent"
              nameKey="label"
              innerRadius={48}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
            Aucune donnée
          </div>
        )}
      </div>
      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-label">{item.label}</span>
            <span className="legend-pct">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationsBarChart({ data }) {
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 20, left: 8, bottom: 12 }}>
          <defs>
            <linearGradient id="barGradReservations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60A5FA" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="barGradAnnulations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1A56A0" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#1A56A0" stopOpacity={0.12} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
          <Tooltip formatter={(value) => [value, '']} />
          <Bar dataKey="reservations" name="Total réservations" barSize={18} fill="url(#barGradReservations)" />
          <Bar dataKey="annulations"  name="Annulations"        barSize={18} fill="url(#barGradAnnulations)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

function Pagination({ page, total, onChange }) {
  const pageCount = Math.ceil(total / PAGE_SIZE);
  if (pageCount <= 1) return null;
  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        ‹ Précédent
      </button>
      <span className="page-info">{page} / {pageCount}</span>
      <button
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
      >
        Suivant ›
      </button>
    </div>
  );
}

// ─── Modal édition profil ─────────────────────────────────────────────────────

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    nom:        user?.nom        || '',
    email:      user?.email      || '',
    password:   '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('email', form.email);
      if (form.password) formData.append('password', form.password);
      if (avatarFile) formData.append('avatar', avatarFile);

      await onSave(formData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
      setSaving(false);
    }
  };

  return (
    <div className="ep-overlay" onClick={onClose}>
      <div className="ep-panel" onClick={e => e.stopPropagation()}>
        <div className="ep-header">
          <h2 className="ep-title">Modifier mon profil</h2>
          <button className="ep-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <form className="ep-form" onSubmit={handleSubmit} noValidate>
          <div className="ep-field">
            <label htmlFor="ep-nom">Nom complet</label>
            <input
              id="ep-nom"
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-email">Adresse e-mail</label>
            <input
              id="ep-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-password">
              Nouveau mot de passe
              <span className="ep-optional"> — laisser vide pour ne pas changer</span>
            </label>
            <input
              id="ep-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <div className="ep-field">
            <label htmlFor="ep-avatar">
              Photo de profil (Avatar)
              <span className="ep-optional"> — optionnel</span>
            </label>
            <input
              id="ep-avatar"
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
            />
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

// ─── Page principale ──────────────────────────────────────────────────────────

const DEFAULT_MONTHLY = MONTHS_FR.map(month => ({ month, reservations: 0, annulations: 0 }));
const DEFAULT_USAGE   = Object.entries(TYPE_CONFIG).map(([, cfg]) => ({ label: cfg.label, percent: 0, color: cfg.color }));

export default function DashboardUser() {
  const { user, refreshUser } = useAuth();

  const [upcoming,          setUpcoming]          = useState([]);
  const [history,           setHistory]           = useState([]);
  const [monthlyData,       setMonthlyData]       = useState(DEFAULT_MONTHLY);
  const [usageData,         setUsageData]         = useState(DEFAULT_USAGE);
  const [heuresMois,        setHeuresMois]        = useState(null);
  const [tauxPresence,      setTauxPresence]      = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [upcomingPage,      setUpcomingPage]      = useState(1);
  const [historyPage,       setHistoryPage]       = useState(1);
  const [showProfileModal,  setShowProfileModal]  = useState(false);

  const handleSaveProfile = async (payload) => {
    await userService.updateMyProfile(user.userId, payload);
    await refreshUser();
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
        console.error('Erreur lors du chargement des données du dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const dashboardName  = user?.nom || user?.email || 'Utilisateur';
  const dashboardEmail = user?.email || '';
  const avatarLabel = dashboardName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="dashboard">
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
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>
              {loading ? '—' : upcoming.length}{' '}
              <span className="kpi-unit">{upcoming.length <= 1 ? 'salle' : 'salles'}</span>
            </p>
          </div>

          <div className="kpi-card kpi-blue">
            <p className="kpi-label">Heures en Réunion</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>
              {loading || heuresMois === null ? '—' : `${heuresMois}h`}{' '}
              <span className="kpi-unit">ce mois</span>
            </p>
          </div>

          <div className="kpi-card kpi-green">
            <p className="kpi-label">Taux de Présence</p>
            <p style={{ fontSize:"1.55rem", fontWeight:700, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>
              {loading || tauxPresence === null ? '—' : `${tauxPresence}%`}
            </p>
          </div>
        </section>

        {/* ── Graphes ── */}
        <section className="charts-row">
          <div className="card chart-card">
            <h3 className="card-title">Mon Activité de Réservation (Annuel)</h3>
            <ReservationsBarChart data={monthlyData} />
            <div className="chart-legend">
              <span className="legend-line reservations" />
              <span className="legend-label">Total Réservations</span>
              <span className="legend-line annulations" />
              <span className="legend-label">Annulations</span>
            </div>
          </div>

          <div className="card donut-card">
            <h3 className="card-title">Mon Usage par Type de Réunion</h3>
            <DonutChart data={usageData} />
          </div>
        </section>

        {/* ── Tableaux ── */}
        <section className="tables-row">
          {/* Card Réservations à venir */}
          <div className="card table-card">
            <h3 className="card-title">Réservations — À Venir</h3>
            {loading ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Chargement…</p>
            ) : upcoming.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Aucune réservation à venir.</p>
            ) : (
              <>
                <table className="resa-table">
                  <thead>
                    <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {upcoming
                      .slice((upcomingPage - 1) * PAGE_SIZE, upcomingPage * PAGE_SIZE)
                      .map(r => (
                        <tr key={r.id}>
                          <td>{formatDate(r.date)}</td>
                          <td>{r.salle_nom}</td>
                          <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                          <td><StatutBadge statut={r.statut} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <Pagination
                  page={upcomingPage}
                  total={upcoming.length}
                  onChange={setUpcomingPage}
                />
              </>
            )}
          </div>

          {/* Card Historique */}
          <div className="card table-card">
            <h3 className="card-title">Historique Complet</h3>
            {loading ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Chargement…</p>
            ) : history.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Aucun historique de réservation.</p>
            ) : (
              <>
                <table className="resa-table">
                  <thead>
                    <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {history
                      .slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE)
                      .map(r => (
                        <tr key={r.id}>
                          <td>{formatDate(r.date)}</td>
                          <td>{r.salle_nom}</td>
                          <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                          <td><StatutBadge statut={r.statut} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <Pagination
                  page={historyPage}
                  total={history.length}
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
