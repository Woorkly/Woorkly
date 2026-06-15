/**
 * Carte KPI générique pour les dashboards.
 * Utilisée dans DashboardAdmin (kpi-tile) et GestionUser (kpi-card).
 *
 * Props :
 *   label      {string}  Libellé de la métrique
 *   value      {string|number}  Valeur à afficher
 *   unit       {string}  Unité affichée en puce (ex: "salles", "%")
 *   colorClass {string}  Classe CSS de couleur (ex: "c-blue", "kpi-tile--teal")
 *   variant    {string}  "tile" (DashboardAdmin) | "card" (GestionUser) — défaut : "card"
 *
 * Usage (tile admin) :
 *   <KPICard label="Salles totales" value={12} unit="salles" colorClass="kpi-tile--blue" variant="tile" />
 *
 * Usage (card user) :
 *   <KPICard label="Total utilisateurs" value={42} unit="users" colorClass="c-blue" />
 */

export default function KPICard({ label, value, unit, colorClass, variant = 'card' }) {
  if (variant === 'tile') {
    return (
      <article className={`kpi-tile ${colorClass}`}>
        <div className="kpi-tile__top">
          <p className="kpi-tile__label">{label}</p>
          {unit && <span className={`kpi-chip`}>{unit}</span>}
        </div>
        <div className="kpi-tile__value-row">
          <strong className="kpi-tile__value">{value}</strong>
        </div>
      </article>
    );
  }

  /* Variante "card" — utilisée dans GestionUser */
  return (
    <div className={`kpi-card ${colorClass}`}>
      <p className="kpi-label">{label}</p>
      <div className="kpi-row-val">
        <span className="kpi-val">
          {value}
          {unit && <span className="kpi-unit"> {unit}</span>}
        </span>
      </div>
    </div>
  );
}
