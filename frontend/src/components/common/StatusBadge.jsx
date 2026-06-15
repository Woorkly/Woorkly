/**
 * Badge de statut de réservation.
 * Utilisé dans DashboardAdmin, DashboardUser, GestionUser et GestionReservations.
 *
 * Styles attendus dans AdminStyle.css / DashboardUser.css :
 *   .badge, .b-pending, .b-confirm, .b-cancel, .b-done, .b-offline
 *
 * Usage : <StatusBadge status="confirmee" />
 */

/* Mapping statut → libellé français et classe CSS */
const STATUS_CONFIG = {
  'en-attente': { label: 'En attente', cls: 'b-pending' },
  confirmee:    { label: 'Confirmée',  cls: 'b-confirm' },
  annulee:      { label: 'Annulée',   cls: 'b-cancel'  },
  terminee:     { label: 'Terminée',  cls: 'b-done'    },
  abandonne:    { label: 'Abandonnée',cls: 'b-offline'  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: '' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
