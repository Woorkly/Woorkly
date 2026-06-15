/**
 * Page Dashboard Admin — analytics globaux.
 *
 * Affiche :
 *   - 4 tuiles KPI (salles, réservations du jour, utilisateurs, taux occupation)
 *   - Graphe de tendance mensuelle (AreaTrendChart)
 *   - Répartition par type de salle (DonutChart)
 *   - Tableau des dernières réservations
 *
 * Données : hook useAdminDashboard (appel API /admin/dashboard)
 */

import useAdminDashboard from '../../../hooks/useAdminDashboard';

/* Composants partagés */
import KPICard      from '../../../components/common/KPICard';
import StatusBadge  from '../../../components/common/StatusBadge';
import ChartShell   from '../../../components/charts/ChartShell';
import AreaTrendChart from '../../../components/charts/AreaTrendChart';
import DonutChart   from '../../../components/charts/DonutChart';

/* Utilitaires */
import { formatDate, formatTime } from '../../../utils/dateUtils';

import './AdminStyle.css';

/* Ordre d'affichage des mois sur l'axe X du graphe de tendance */
const MONTH_ORDER = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

/* Couleurs attribuées aux tranches du donut (une par type de salle) */
const PIE_COLORS = ['#1A56A0', '#38BDF8', '#10B981', '#F59E0B', '#7C3AED', '#EF4444'];

/* Configuration des 4 tuiles KPI */
const KPI_META = [
  { key: 'total_salles',        label: 'Salles totales',           unit: 'salles',       colorClass: 'kpi-tile--blue'  },
  { key: 'reservations_today',  label: "Réservations aujourd'hui", unit: 'réservations', colorClass: 'kpi-tile--teal'  },
  { key: 'total_utilisateurs',  label: 'Utilisateurs totaux',      unit: 'utilisateurs', colorClass: 'kpi-tile--green' },
  { key: 'taux_occupation',     label: "Taux d'occupation",        unit: '%',            colorClass: 'kpi-tile--amber' },
];

export default function DashboardAdmin() {
  const { dashboard, loading, error } = useAdminDashboard();

  /* Données graphe tendance : fallback sur les 12 mois à zéro si pas encore chargé */
  const chartData = (dashboard?.monthly_trends || []).length > 0
    ? dashboard.monthly_trends
    : MONTH_ORDER.map((month) => ({ month, total_reservations: 0, confirmees: 0 }));

  /* Données donut : ajout de la couleur par index */
  const pieData = (dashboard?.type_usage || []).map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="dashboard-page">
      <div className="topbar dashboard-topbar">
        <div>
          <p className="topbar-kicker">Admin analytics</p>
          <h1 className="dashboard-title">Dashboard Admin</h1>
        </div>
        <p className="topbar-note">Vue globale des réservations, des salles et de l'activité.</p>
      </div>

      <div className="page-body dashboard-body">
        {error && <div className="dashboard-alert">{error}</div>}

        {loading && !dashboard && (
          <div className="card card-pad dashboard-loading">Chargement des statistiques...</div>
        )}

        {/* ── Tuiles KPI ── */}
        <section className="kpi-grid">
          {KPI_META.map((item) => {
            const raw = dashboard?.kpis?.[item.key] ?? 0;
            const value = item.key === 'taux_occupation'
              ? `${Number(raw).toFixed(1)}%`
              : raw;

            return (
              <KPICard
                key={item.key}
                label={item.label}
                value={value}
                unit={item.unit}
                colorClass={item.colorClass}
                variant="tile"
              />
            );
          })}
        </section>

        {/* ── Graphe de tendance mensuelle ── */}
        <ChartShell
          title="Tendance des réservations"
          subtitle="Total des réservations et réservations confirmées par mois sur l'année en cours"
        >
          <AreaTrendChart data={chartData} />
        </ChartShell>

        <div className="dashboard-split">
          {/* ── Donut répartition par type ── */}
          <ChartShell
            title="Usage des salles par type"
            subtitle="Répartition des réservations par type de salle"
          >
            <DonutChart
              data={pieData}
              dataKey="total"
              nameKey="type"
              legendKey="type"
              pctKey="percentage"
            />
          </ChartShell>

          {/* ── Dernières réservations ── */}
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
                    dashboard.recent_reservations.map((r) => (
                      <tr key={r.id}>
                        <td>{formatDate(r.date)}</td>
                        <td>{formatTime(r.heure_debut)} - {formatTime(r.heure_fin)}</td>
                        <td>{r.salle_nom}</td>
                        <td>{r.user_nom}</td>
                        <td><StatusBadge status={r.statut} /></td>
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
