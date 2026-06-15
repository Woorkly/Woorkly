/**
 * Graphe en anneau (Donut / Pie Chart) réutilisable.
 * Utilisé dans DashboardAdmin (usage par type de salle) et DashboardUser (usage par type de réunion).
 *
 * Props :
 *   data        {Array}   Items avec { type|label, total|percent, color, percentage? }
 *   dataKey     {string}  Clé de valeur numérique — défaut : "total"
 *   nameKey     {string}  Clé du libellé — défaut : "type"
 *   legendKey   {string}  Clé à afficher dans la légende — défaut : nameKey
 *   pctKey      {string}  Clé du pourcentage affiché — défaut : "percentage"
 *   emptyText   {string}  Message si aucune donnée
 *
 * Usage (DashboardAdmin) :
 *   <DonutChart data={pieData} dataKey="total" nameKey="type" pctKey="percentage" />
 *
 * Usage (DashboardUser) :
 *   <DonutChart data={usageData} dataKey="percent" nameKey="label" legendKey="label" pctKey="percent" />
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function DonutChart({
  data,
  dataKey = 'total',
  nameKey = 'type',
  legendKey,
  pctKey = 'percentage',
  emptyText = 'Aucune donnée de réservation à afficher.',
}) {
  const resolvedLegendKey = legendKey || nameKey;

  return (
    <div className="donut-wrap" style={{ alignItems: 'flex-start' }}>
      <div className="donut-chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={44}
              outerRadius={68}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value} réservations`,
                props.payload[resolvedLegendKey],
              ]}
              contentStyle={{
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="donut-legend" style={{ marginLeft: 8 }}>
        {data.length === 0 ? (
          <p className="empty-state">{emptyText}</p>
        ) : (
          data.map((item, index) => (
            <div key={index} className="leg-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="leg-dot" style={{ background: item.color }} />
                <span className="leg-label">{item[resolvedLegendKey]}</span>
              </div>
              <div className="leg-pct">{item[pctKey]}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
