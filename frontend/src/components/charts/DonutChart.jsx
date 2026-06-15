/**
 * Graphe en anneau (Donut / Pie Chart) réutilisable.
 * Utilisé dans DashboardAdmin (usage par type de salle) et DashboardUser (usage par type de réunion).
 *
 * Props :
 *   data      {Array}   Items avec { [nameKey], [dataKey], color, [pctKey] }
 *   dataKey   {string}  Clé de valeur numérique — défaut : "total"
 *   nameKey   {string}  Clé du libellé — défaut : "type"
 *   pctKey    {string}  Clé du pourcentage affiché dans la légende — défaut : "percentage"
 *   emptyText {string}  Message si aucune donnée
 *   variant   {string}  "admin" (AdminStyle.css) | "user" (DashboardUser.css) — défaut : "admin"
 *
 * Usage (DashboardAdmin) :
 *   <DonutChart data={pieData} dataKey="total" nameKey="type" pctKey="percentage" />
 *
 * Usage (DashboardUser) :
 *   <DonutChart data={usageData} dataKey="percent" nameKey="label" pctKey="percent" variant="user" />
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

/* Classes CSS selon le contexte d'utilisation */
const CSS = {
  admin: {
    wrap:    'donut-wrap',
    shell:   'donut-chart-shell',
    legend:  'donut-legend',
    item:    'leg-item',
    dot:     'leg-dot',
    label:   'leg-label',
    pct:     'leg-pct',
  },
  user: {
    wrap:    'donut-wrapper',
    shell:   'donut-visual',
    legend:  'donut-legend',
    item:    'legend-item',
    dot:     'legend-dot',
    label:   'legend-label',
    pct:     'legend-pct',
  },
};

export default function DonutChart({
  data,
  dataKey = 'total',
  nameKey = 'type',
  pctKey = 'percentage',
  emptyText = 'Aucune donnée de réservation à afficher.',
  variant = 'admin',
}) {
  const cls = CSS[variant] || CSS.admin;
  const hasData = data.some((d) => Number(d[dataKey]) > 0);

  return (
    <div className={cls.wrap} style={{ alignItems: 'flex-start' }}>
      <div className={cls.shell}>
        {hasData ? (
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
                  props.payload[nameKey],
                ]}
                contentStyle={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          /* État vide : même style que l'original DashboardUser */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center',
          }}>
            Aucune donnée
          </div>
        )}
      </div>

      <div className={cls.legend} style={{ marginLeft: variant === 'admin' ? 8 : 0 }}>
        {data.length === 0 ? (
          <p className="empty-state">{emptyText}</p>
        ) : (
          data.map((item, index) => (
            <div key={index} className={cls.item}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={cls.dot} style={{ background: item.color }} />
                <span className={cls.label}>{item[nameKey]}</span>
              </div>
              <div className={cls.pct}>{item[pctKey]}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
