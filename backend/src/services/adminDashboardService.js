/**
 * Service analytique du dashboard admin
 *
 * Responsabilités:
 * - Orchestrer les appels au modèle adminDashboardModel
 * - Transformer les données brutes de la BD en format frontend
 * - Exécuter tous les calculs en parallèle (Promise.all) pour réduire la latence
 *
 * Note: Les requêtes SQL sont dans adminDashboardModel, pas ici
 */

const dashboardModel = require('../models/adminDashboardModel');

// Labels des mois en français pour le formatage de l'affichage
const MONTH_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];

// ============================================================================
// SECTION 1: Fonctions utilitaires d'extraction
// ============================================================================

/**
 * Extrait le premier résultat d'une requête BD
 * La BD retourne [[{result}]] donc on extrait [0][0]
 * @param {Array} dbResult - Résultat brut de la BD
 * @returns {Object} Le premier objet ou un objet vide {}
 */
const extractFirstResult = (dbResult) => dbResult[0]?.[0] || {};

// ============================================================================
// SECTION 2: Fonctions de transformation
// ============================================================================

/**
 * Transforme les résultats des 4 requêtes KPI en objet structuré
 * @param {Object} sallesResult - Résultat getTotalSalles()
 * @param {Object} todayResult - Résultat getReservationsToday()
 * @param {Object} utilisateursResult - Résultat getTotalUtilisateurs()
 * @param {Object} occupationResult - Résultat getOccupationRate()
 * @returns {Object} {total_salles, reservations_today, total_utilisateurs, taux_occupation}
 */
const transformKpis = (sallesResult, todayResult, utilisateursResult, occupationResult) => ({
  total_salles: Number(sallesResult.total_salles || 0),
  reservations_today: Number(todayResult.reservations_today || 0),
  total_utilisateurs: Number(utilisateursResult.total_utilisateurs || 0),
  taux_occupation: Number(occupationResult.taux_occupation || 0),
});

/**
 * Transforme les données mensuelles brutes en array complet de 12 mois
 * Si un mois n'a pas de données dans la BD, on retourne 0
 * Exemple BD: [{month_number: 1, total: 10}, {month_number: 3, total: 15}]
 * Retour: [{month: 'Jan', total_reservations: 10, confirmees: 0}, ..., {month: 'Déc', ...}]
 * @param {Array} monthlyResult - Tableau des résultats mensuels de la BD
 * @returns {Array} Array de 12 objets (un par mois)
 */
const transformMonthlyTrends = (monthlyResult) => {
  // Crée une Map pour accès rapide aux données par mois (month_number → données)
  const monthlyByMonth = new Map(
    monthlyResult.map(row => [Number(row.month_number), row])
  );

  // Génère un array de 12 mois, en remplissant les données existantes et 0 pour les vides
  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const row = monthlyByMonth.get(monthNumber);

    return {
      month: MONTH_LABELS[monthNumber - 1] || String(monthNumber),
      total_reservations: Number(row?.total_reservations || 0),
      confirmees: Number(row?.confirmees || 0),
    };
  });
};

/**
 * Transforme les données d'utilisation par type de salle en ajoutant les pourcentages
 * Exemple entrée: [{type_name: 'Conférence', total: 25}, {type_name: 'Atelier', total: 15}]
 * Retour: [{type: 'Conférence', total: 25, percentage: 62.5}, ...]
 * @param {Array} typeResult - Résultats bruts de getTypeUsage()
 * @returns {Array} Tableau avec type, total et percentage
 */
const transformTypeUsage = (typeResult) => {
  // Calcule le total global de toutes les réservations pour les pourcentages
  const totalTypeUsage = typeResult.reduce((sum, row) => sum + Number(row.total || 0), 0);

  return typeResult.map(row => ({
    type: row.type_name,
    total: Number(row.total || 0),
    // Calcul du pourcentage (0% si aucune donnée)
    percentage: totalTypeUsage > 0
      ? Math.round((Number(row.total || 0) / totalTypeUsage) * 100)
      : 0,
  }));
};

/**
 * Transforme les données brutes des réservations récentes en format API
 * Sélectionne uniquement les champs à retourner et les convertit en types corrects
 * @param {Array} recentResult - Résultats bruts de getRecentReservations()
 * @returns {Array} Tableau de réservations formatées
 */
const transformRecentReservations = (recentResult) =>
  recentResult.map(row => ({
    id: row.id,
    date: row.date,
    heure_debut: row.heure_debut,
    heure_fin: row.heure_fin,
    statut: row.statut,
    type_reservation: row.type_reservation,
    salle_nom: row.salle_nom,
    user_nom: row.user_nom,
  }));

// ============================================================================
// SECTION 3: Orchestration principale
// ============================================================================

/**
 * Récupère toutes les statistiques du dashboard admin
 *
 * Processus:
 * 1. Appelle 7 fonctions du modèle EN PARALLÈLE (Promise.all)
 * 2. Extrait les résultats de chaque requête
 * 3. Transforme chaque groupe de données dans le format frontend
 * 4. Retourne un objet structuré avec kpis, trends, usage, recent
 *
 * Performance: Toutes les requêtes sont en parallèle, pas en cascade
 *
 * @returns {Promise<Object>} Structure complète du dashboard:
 *   {
 *     kpis: {total_salles, reservations_today, total_utilisateurs, taux_occupation},
 *     monthly_trends: [...12 mois...],
 *     type_usage: [...types avec pourcentages...],
 *     recent_reservations: [...4 dernières réservations...]
 *   }
 */
const getAdminDashboardStats = async () => {
  // ÉTAPE 1: Exécuter toutes les requêtes BD en parallèle
  const [
    sallesResult,
    todayResult,
    utilisateursResult,
    occupationResult,
    monthlyResult,
    typeResult,
    recentResult,
  ] = await Promise.all([
    dashboardModel.getTotalSalles(),
    dashboardModel.getReservationsToday(),
    dashboardModel.getTotalUtilisateurs(),
    dashboardModel.getOccupationRate(),
    dashboardModel.getMonthlyTrends(),
    dashboardModel.getTypeUsage(),
    dashboardModel.getRecentReservations(),
  ]);

  // ÉTAPE 2: Assembler et retourner les données transformées
  return {
    // KPIs: 4 chiffres clés du dashboard
    kpis: transformKpis(
      extractFirstResult(sallesResult),
      extractFirstResult(todayResult),
      extractFirstResult(utilisateursResult),
      extractFirstResult(occupationResult)
    ),

    // Tendances mensuelles: graphique avec données par mois (Jan à Déc)
    monthly_trends: transformMonthlyTrends(monthlyResult[0]),

    // Utilisation par type: graphique camembert avec pourcentages
    type_usage: transformTypeUsage(typeResult[0]),

    // Réservations récentes: affichage des 4 dernières
    recent_reservations: transformRecentReservations(recentResult[0]),
  };
};

module.exports = {
  getAdminDashboardStats,
};