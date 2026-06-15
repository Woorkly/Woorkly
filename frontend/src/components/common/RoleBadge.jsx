/**
 * Badge de rôle utilisateur (Admin / Utilisateur).
 * Utilisé dans GestionUser pour la colonne rôle et la fiche détail.
 *
 * Usage : <RoleBadge role="Admin" />
 */

export default function RoleBadge({ role }) {
  const cls = role === 'Admin' ? 'b-confirm' : 'b-role-user';
  return <span className={`badge ${cls}`}>{role}</span>;
}
