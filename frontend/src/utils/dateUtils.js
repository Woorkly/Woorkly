/**
 * Utilitaires de formatage de dates et d'heures.
 * Centralise les helpers partagés entre DashboardAdmin, DashboardUser,
 * GestionUser et GestionReservations pour éviter la duplication.
 */

/**
 * Formate une valeur date en "YYYY-MM-DD".
 * Accepte : Date, chaîne ISO, chaîne "YYYY-MM-DD HH:mm:ss".
 */
export function formatDate(dateValue) {
  if (!dateValue) return '-';

  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10);
  }

  const raw = String(dateValue).trim();
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  return raw || '-';
}

/**
 * Formate une valeur date en format lisible fr-FR : "15 juin 2025".
 * Utilisé dans DashboardUser pour les tableaux de réservations.
 */
export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  // Extraire la partie date pour éviter les décalages UTC
  const datePart = String(dateStr).split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Formate une valeur date en format court fr-FR : "15/06/2025".
 * Utilisé dans GestionUser et GestionReservations.
 */
export function formatDateShort(raw) {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString('fr-FR');
}

/**
 * Retourne les 5 premiers caractères d'une heure "HH:mm:ss" → "HH:mm".
 */
export function formatTime(timeValue) {
  if (!timeValue) return '-';
  return String(timeValue).slice(0, 5);
}

/**
 * Alias pour formatTime — utilisé dans GestionReservations sous ce nom.
 */
export const formatHeure = formatTime;
