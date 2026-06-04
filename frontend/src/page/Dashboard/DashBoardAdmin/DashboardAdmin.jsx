import {
  ResponsiveContainer,
  LineChart,
  Line,
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

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
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

function TrendChart({ data }) {
  return (
    <div className="chart-viewport">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 12, bottom: 8 }}>
          <defs>
            <linearGradient id="gTotal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="gConfirmees" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1A56A0" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8eef7" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}
            labelStyle={{ fontWeight: 600, color: '#0f172a' }}
          />
          <Legend verticalAlign="top" height={28} iconType="circle" />
          <Line type="monotone" dataKey="total_reservations" name="Total réservations" stroke="url(#gTotal)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="confirmees" name="Réservations confirmées" stroke="url(#gConfirmees)" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function UsagePie({ data }) {
  return (
    <div className="usage-layout">
      <div className="usage-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="type" innerRadius={58} outerRadius={92} paddingAngle={4}>
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

      <div className="usage-list">
        {data.length === 0 ? (
          <p className="empty-state">Aucune donnée de réservation à afficher.</p>
        ) : (
          data.map((item, index) => (
            <div key={item.type} className="usage-item">
              <span className="leg-dot" style={{ background: item.color || PIE_COLORS[index % PIE_COLORS.length] }} />
              <div className="usage-item__content">
                <span className="usage-item__label">{item.type}</span>
                <span className="usage-item__meta">{item.total} réservations</span>
              </div>
              <span className="usage-item__pct">{item.percentage}%</span>
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
          <TrendChart data={chartData} />
        </ChartShell>

        <div className="dashboard-split">
          <ChartShell
            title="Usage des salles par type"
            subtitle="Répartition des réservations par type de salle"
          >
            <UsagePie data={pieData} />
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