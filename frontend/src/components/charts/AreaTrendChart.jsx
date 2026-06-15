/**
 * Graphe de tendance en aires (Area Chart) pour DashboardAdmin.
 * Affiche "Total réservations" et "Réservations confirmées" par mois.
 *
 * Props :
 *   data {Array<{ month, total_reservations, confirmees }>}
 *
 * Usage :
 *   <AreaTrendChart data={monthlyData} />
 */

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function AreaTrendChart({ data }) {
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
          <XAxis dataKey="month" tickLine={false} axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            domain={[0, 10]} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.12)' }}
            labelStyle={{ fontWeight: 600, color: '#0f172a' }}
          />
          <Legend verticalAlign="top" height={28} iconType="circle" />
          <Area type="monotone" dataKey="total_reservations" name="Total réservations"
            stroke="#38BDF8" fill="url(#gTotal)" strokeWidth={2} dot={{ r: 3.5 }} />
          <Area type="monotone" dataKey="confirmees" name="Réservations confirmées"
            stroke="#1A56A0" fill="url(#gConfirmees)" strokeWidth={2} dot={{ r: 3.5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
