/**
 * Graphe en barres pour l'activité mensuelle de DashboardUser.
 * Affiche "Total réservations" et "Annulations" par mois.
 *
 * Props :
 *   data {Array<{ month, reservations, annulations }>}
 *
 * Usage :
 *   <BarChartCard data={monthlyData} />
 */

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function BarChartCard({ data }) {
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
          <Bar dataKey="reservations" name="Total réservations"
            barSize={18} fill="url(#barGradReservations)" />
          <Bar dataKey="annulations" name="Annulations"
            barSize={18} fill="url(#barGradAnnulations)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
