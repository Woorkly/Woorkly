import { useState, useEffect } from "react";
import { useAuth } from '../../../hooks/useAuth';
import reservationService from '../../../services/reservationService';
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
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
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

// ─── Page principale ──────────────────────────────────────────────────────────

const DEFAULT_MONTHLY = MONTHS_FR.map(month => ({ month, reservations: 0, annulations: 0 }));
const DEFAULT_USAGE   = Object.entries(TYPE_CONFIG).map(([, cfg]) => ({ label: cfg.label, percent: 0, color: cfg.color }));

export default function DashboardUser() {
  const { user } = useAuth();

  const [upcoming,      setUpcoming]      = useState([]);
  const [history,       setHistory]       = useState([]);
  const [monthlyData,   setMonthlyData]   = useState(DEFAULT_MONTHLY);
  const [usageData,     setUsageData]     = useState(DEFAULT_USAGE);
  const [heuresMois,    setHeuresMois]    = useState(null);
  const [tauxPresence,  setTauxPresence]  = useState(null);
  const [loading,       setLoading]       = useState(true);

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
        <div className="dash-avatar">
          <span>{avatarLabel || 'U'}</span>
        </div>
      </header>

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
          <div className="card table-card">
            <h3 className="card-title">Réservations — À Venir</h3>
            {loading ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Chargement…</p>
            ) : upcoming.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Aucune réservation à venir.</p>
            ) : (
              <table className="resa-table">
                <thead>
                  <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {upcoming.map(r => (
                    <tr key={r.id}>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.salle_nom}</td>
                      <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                      <td><StatutBadge statut={r.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card table-card">
            <h3 className="card-title">Historique Complet</h3>
            {loading ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Chargement…</p>
            ) : history.length === 0 ? (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', padding:'1rem 0' }}>Aucun historique de réservation.</p>
            ) : (
              <table className="resa-table">
                <thead>
                  <tr><th>Date</th><th>Salle</th><th>Heure</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {history.map(r => (
                    <tr key={r.id}>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.salle_nom}</td>
                      <td>{formatTime(r.heure_debut)} – {formatTime(r.heure_fin)}</td>
                      <td><StatutBadge statut={r.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
