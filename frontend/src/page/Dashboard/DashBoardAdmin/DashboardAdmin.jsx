import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import useAdminDashboard from '../../../hooks/useAdminDashboard';
import './AdminStyle.css';

const MONTH_ORDER = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const KPI_META = [
  { key: 'total_salles', label: 'Salles totales', unit: 'salles', color: 'c-blue', tone: 'kpi-tile--blue' },
  { key: 'reservations_today', label: 'Réservations aujourd’hui', unit: 'réservations', color: 'c-teal', tone: 'kpi-tile--teal' },
  { key: 'total_utilisateurs', label: 'Utilisateurs totaux', unit: 'utilisateurs', color: 'c-green', tone: 'kpi-tile--green' },
  { key: 'taux_occupation', label: 'Taux d’occupation', unit: '%', color: 'c-orange', tone: 'kpi-tile--amber' },
];

const STATUS_LABELS = {
  'en-attente': 'En attente',
  confirmee: 'Confirmée',
  annulee: 'Annulée',
  terminee: 'Terminée',
  abandonne: 'Abandonnée',
};

const STATUS_CLASS = {
  'en-attente': 'b-pending',
  confirmee: 'b-confirm',
  annulee: 'b-cancel',
  terminee: 'b-done',
  abandonne: 'b-offline',
};

const PIE_COLORS = ['#1A56A0', '#38BDF8', '#10B981', '#F59E0B', '#7C3AED', '#EF4444'];

const MONTH_NAMES = {
  '01': 'janv.',
  '02': 'févr.',
  '03': 'mars',
  '04': 'avr.',
  '05': 'mai',
  '06': 'juin',
  '07': 'juil.',
  '08': 'août',
  '09': 'sept.',
  '10': 'oct.',
  '11': 'nov.',
  '12': 'déc.',
};

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  // If it's a Date object, normalize to ISO date
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10)
  }

  const rawValue = String(dateValue).trim();
  // If it's an ISO-like string, return YYYY-MM-DD
  const isoMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1]

  // Fallback: try to parse YYYY-MM-DD from the start
  const normalized = rawValue.split(' ')[0];
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;

  return rawValue || '-';
};

const formatTime = (timeValue) => {
  if (!timeValue) return '-';
  return String(timeValue).slice(0, 5);
};

function ChartShell({ title, subtitle, children, rightSlot }) {
  return (
    <section className="card chart-card">
      <div className="card-head">
        <div>
          <p className="card-title">{title}</p>
          {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div className="card-head__meta">{rightSlot}</div> : null}
      </div>
      {children}
    </section>
  );
}

function AreaTrendChart({ data }) {
  return (
    <div className="chart-viewport">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 48, bottom: 28 }}>
          <defs>
            <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gConfirmees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A56A0" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#1A56A0" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e6eef9" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            domain={[0, 10]}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}
            labelStyle={{ fontWeight: 600, color: '#0f172a' }}
          />
          <Legend verticalAlign="top" height={28} iconType="circle" />
          <Area type="monotone" dataKey="total_reservations" name="Total réservations" stroke="#38BDF8" fill="url(#gTotal)" strokeWidth={2} dot={{ r: 3.5 }} />
          <Area type="monotone" dataKey="confirmees" name="Réservations confirmées" stroke="#1A56A0" fill="url(#gConfirmees)" strokeWidth={2} dot={{ r: 3.5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutChart({ data }) {
  return (
    <div className="donut-wrap" style={{ alignItems: 'flex-start' }}>
      <div className="donut-chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="type" innerRadius={44} outerRadius={68} startAngle={90} endAngle={-270} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.type}-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`${value} réservations`, props.payload.type]}
              contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="donut-legend" style={{ marginLeft: 8 }}>
        {data.length === 0 ? (
          <p className="empty-state">Aucune donnée de réservation à afficher.</p>
        ) : (
          data.map((item, index) => (
            <div key={item.type} className="leg-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="leg-dot" style={{ background: item.color || PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="leg-label">{item.type}</span>
              </div>
              <div className="leg-pct">{item.percentage}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const badgeClass = STATUS_CLASS[status] || 'b-blue';
  return <span className={`badge ${badgeClass}`}>{label}</span>;
}

export default function DashboardAdmin() {
  const { dashboard, loading, error } = useAdminDashboard();

  const monthlyData = (dashboard?.monthly_trends || []).map((item) => ({
    ...item,
    month: item.month,
  }));

  const pieData = (dashboard?.type_usage || []).map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  const chartData = monthlyData.length > 0
    ? monthlyData
    : MONTH_ORDER.map((month) => ({ month, total_reservations: 0, confirmees: 0 }));

  return (
    <div className="dashboard-page">
      <div className="topbar dashboard-topbar">
        <div>
          <p className="topbar-kicker">Admin analytics</p>
          <h1 className="dashboard-title">Dashboard Admin</h1>
        </div>
        <p className="topbar-note">Vue globale des réservations, des salles et de l’activité.</p>
      </div>

      <div className="page-body dashboard-body">
        {error ? <div className="dashboard-alert">{error}</div> : null}

        {loading && !dashboard ? (
          <div className="card card-pad dashboard-loading">Chargement des statistiques...</div>
        ) : null}

        <section className="kpi-grid">
          {KPI_META.map((item) => {
            const value = dashboard?.kpis?.[item.key] ?? 0;
            const displayValue = item.key === 'taux_occupation' ? `${Number(value).toFixed(1)}%` : value;

            return (
              <article key={item.key} className={`kpi-tile ${item.tone}`}>
                <div className="kpi-tile__top">
                  <p className="kpi-tile__label">{item.label}</p>
                  <span className={`kpi-chip ${item.color}`}>{item.unit}</span>
                </div>
                <div className="kpi-tile__value-row">
                  <strong className="kpi-tile__value">{displayValue}</strong>
                </div>
              </article>
            );
          })}
        </section>

        <ChartShell
          title="Tendance des réservations"
          subtitle="Total des réservations et réservations confirmées par mois sur l’année en cours"
        >
          <AreaTrendChart data={chartData} />
        </ChartShell>

        <div className="dashboard-split">
          <ChartShell
            title="Usage des salles par type"
            subtitle="Répartition des réservations par type de salle"
          >
            <DonutChart data={pieData} />
          </ChartShell>

          <section className="card recent-card">
            <div className="card-head recent-card__head">
              <div>
                <p className="card-title">Dernières réservations</p>
                <p className="card-subtitle">Les 4 événements les plus récents</p>
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Salle</th>
                    <th>Utilisateur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.recent_reservations || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-cell">Aucune réservation récente.</td>
                    </tr>
                  ) : (
                    dashboard.recent_reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>{formatDate(reservation.date)}</td>
                        <td>{formatTime(reservation.heure_debut)} - {formatTime(reservation.heure_fin)}</td>
                        <td>{reservation.salle_nom}</td>
                        <td>{reservation.user_nom}</td>
                        <td><Badge status={reservation.statut} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}