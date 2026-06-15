const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authRequired, requireRole } = require('../middlewares/auth');
const { createReservationValidator, updateStatutValidator } = require('../validators/reservationValidator');
const validate = require('../middlewares/validate');

// GET /api/reservations/disponibilite?salle_id=X&date=Y
// Retourne la disponibilité des créneaux (accessible aux utilisateurs connectés)
router.get('/disponibilite', authRequired, reservationController.getDisponibilite);

// GET /api/reservations/me
// Retourne les réservations de l'utilisateur connecté
router.get('/me', authRequired, reservationController.getMyReservations);

// GET /api/reservations/me/stats
// Retourne les statistiques du dashboard (KPIs + graphes)
router.get('/me/stats', authRequired, reservationController.getMyDashboardStats);

// GET /api/reservations/me/upcoming
// Retourne les réservations à venir de l'utilisateur connecté
router.get('/me/upcoming', authRequired, reservationController.getMyUpcoming);

// GET /api/reservations/me/history
// Retourne l'historique des réservations de l'utilisateur connecté
router.get('/me/history', authRequired, reservationController.getMyHistory);

// GET /api/reservations (admin only)
// Retourne toutes les réservations
router.get('/', authRequired, requireRole('admin'), reservationController.getAllReservations);

// GET /api/reservations/filters-data (admin only)
// Retourne les listes salles + utilisateurs pour les menus déroulants de filtres
router.get('/filters-data', authRequired, requireRole('admin'), reservationController.getFiltersData);

// GET /api/reservations/user/:userId (admin only)
// Retourne les réservations d'un utilisateur spécifique
router.get('/user/:userId', authRequired, requireRole('admin'), reservationController.getUserReservationsAdmin);

// GET /api/reservations/:id
// Retourne les détails d'une réservation
router.get('/:id', authRequired, reservationController.getReservationDetails);

// POST /api/reservations
// Crée une nouvelle réservation
router.post('/', authRequired, createReservationValidator, validate, reservationController.createReservation);

// PATCH /api/reservations/:id/cancel
// Annule une réservation
router.patch('/:id/cancel', authRequired, reservationController.cancelReservation);

// PATCH /api/reservations/:id/statut (admin only)
// Met à jour le statut d'une réservation
router.patch('/:id/statut', authRequired, requireRole('admin'), updateStatutValidator, validate, reservationController.updateStatut);

module.exports = router;
