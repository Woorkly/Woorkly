// Modèle pour le dashboard analytique admin
// Responsabilité: Contenir UNIQUEMENT les requêtes SQL d'analytics
// Ces fonctions sont réutilisables par d'autres services

const db = require('../config/db');

// Hypothèse métier: 10 heures disponibles par salle par jour (08h00–18h00)
const DAILY_AVAILABLE_HOURS = 10;

/**
 * Récupère le nombre total de salles dans la plateforme
 * @returns {Promise<Array>} Résultat de la requête: [{total_salles: number}]
 */
const getTotalSalles = () =>
  db.execute('SELECT COUNT(*) AS total_salles FROM salles');

/**
 * Récupère le nombre de réservations pour aujourd'hui (non annulées)
 * @returns {Promise<Array>} Résultat: [{reservations_today: number}]
 */
const getReservationsToday = () =>
  db.execute("SELECT COUNT(*) AS reservations_today FROM reservations WHERE date = CURDATE() AND statut <> 'annulee'");

/**
 * Récupère le nombre total d'utilisateurs inscrits
 * @returns {Promise<Array>} Résultat: [{total_utilisateurs: number}]
 */
const getTotalUtilisateurs = () =>
  db.execute('SELECT COUNT(*) AS total_utilisateurs FROM utilisateurs');

/**
 * Calcule le taux d'occupation global du mois courant
 * Formule: (heures réservées confirmées du mois) / (capacité totale disponible) * 100
 * Exemple: Si 3 salles × 10h/jour × 24 jours = 720h disponibles
 *          Et 150h réservées = 20.8% d'occupation
 * @returns {Promise<Array>} Résultat: [{taux_occupation: number}]
 */
const getOccupationRate = () =>
  db.execute(`
    SELECT COALESCE(
      ROUND(
        (
          SELECT COALESCE(
            SUM(TIME_TO_SEC(TIMEDIFF(heure_fin, heure_debut)) / 3600),
            0
          )
          FROM reservations
          WHERE YEAR(date) = YEAR(CURDATE())
            AND MONTH(date) = MONTH(CURDATE())
            AND date <= CURDATE()
            AND statut <> 'annulee'
        )
        /
        NULLIF(
          (SELECT COUNT(*) FROM salles) * ${DAILY_AVAILABLE_HOURS} * DAY(CURDATE()),
          0
        ) * 100,
        1
      ),
      0
    ) AS taux_occupation
  `);

/**
 * Récupère les statistiques mensuelles pour l'année courante
 * Retourne: nombre total de réservations et confirmées par mois
 * Les mois sans données ne sont pas retournés (à gérer au service)
 * @returns {Promise<Array>} Résultat: [
 *   {month_number: 1, total_reservations: 10, confirmees: 8},
 *   {month_number: 2, total_reservations: 15, confirmees: 12},
 *   ...
 * ]
 */
const getMonthlyTrends = () =>
  db.execute(`
    SELECT
      MONTH(r.date) AS month_number,
      COUNT(*) AS total_reservations,
      SUM(CASE WHEN r.statut = 'confirmee' THEN 1 ELSE 0 END) AS confirmees
    FROM reservations r
    WHERE YEAR(r.date) = YEAR(CURDATE())
    GROUP BY MONTH(r.date)
    ORDER BY MONTH(r.date)
  `);

/**
 * Récupère l'utilisation des types de salle (Conférence, Atelier, etc.)
 * Trie par nombre de réservations décroissant
 * @returns {Promise<Array>} Résultat: [
 *   {type_name: 'Conférence', total: 25},
 *   {type_name: 'Atelier', total: 18},
 *   ...
 * ]
 */
const getTypeUsage = () =>
  db.execute(`
    SELECT
      t.nom AS type_name,
      COUNT(*) AS total
    FROM reservations r
    JOIN salles s ON r.salle_id = s.id
    JOIN types t ON s.type_id = t.id
    WHERE r.statut <> 'annulee'
    GROUP BY t.id, t.nom
    ORDER BY total DESC, t.nom ASC
  `);

/**
 * Récupère les 4 dernières réservations (pour affichage dans le dashboard)
 * Inclut les informations de la salle et de l'utilisateur
 * @returns {Promise<Array>} Résultat: [
 *   {id: 1, date: '2024-08-24', heure_debut: '10:00', heure_fin: '11:00', ...},
 *   ...
 * ]
 */
const getRecentReservations = () =>
  db.execute(`
    SELECT
      r.id,
      r.date,
      r.heure_debut,
      r.heure_fin,
      r.statut,
      r.type_reservation,
      s.nom AS salle_nom,
      u.nom AS user_nom
    FROM reservations r
    JOIN salles s ON r.salle_id = s.id
    JOIN utilisateurs u ON r.utilisateur_id = u.id
    ORDER BY r.date DESC, r.heure_debut DESC, r.id DESC
    LIMIT 4
  `);

module.exports = {
  getTotalSalles,
  getReservationsToday,
  getTotalUtilisateurs,
  getOccupationRate,
  getMonthlyTrends,
  getTypeUsage,
  getRecentReservations,
};
