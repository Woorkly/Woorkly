/**
 * Enveloppe générique pour les graphes des dashboards.
 * Fournit le header (titre + sous-titre + slot droit optionnel) et la carte CSS.
 * Extrait de DashboardAdmin pour être réutilisé dans DashboardUser.
 *
 * Props :
 *   title     {string}     Titre de la section
 *   subtitle  {string}     Sous-titre optionnel
 *   rightSlot {ReactNode}  Contenu optionnel en haut à droite
 *   children  {ReactNode}  Corps du graphe
 *
 * Usage :
 *   <ChartShell title="Tendance" subtitle="Réservations par mois">
 *     <AreaTrendChart data={data} />
 *   </ChartShell>
 */

export default function ChartShell({ title, subtitle, children, rightSlot }) {
  return (
    <section className="card chart-card">
      <div className="card-head">
        <div>
          <p className="card-title">{title}</p>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {rightSlot && <div className="card-head__meta">{rightSlot}</div>}
      </div>
      {children}
    </section>
  );
}
