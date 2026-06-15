/**
 * Pagination générique.
 * Extrait de DashboardUser et réutilisable dans n'importe quel tableau paginé.
 *
 * Props :
 *   page      {number}    Page courante (commence à 1)
 *   total     {number}    Nombre total d'éléments
 *   pageSize  {number}    Éléments par page (défaut : 5)
 *   onChange  {function}  Callback appelé avec le nouveau numéro de page
 *
 * Usage : <Pagination page={page} total={items.length} onChange={setPage} />
 */

export default function Pagination({ page, total, pageSize = 5, onChange }) {
  const pageCount = Math.ceil(total / pageSize);

  /* Pas de rendu si une seule page */
  if (pageCount <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        ‹ Précédent
      </button>
      <span className="page-info">{page} / {pageCount}</span>
      <button
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
      >
        Suivant ›
      </button>
    </div>
  );
}
