// Controller pour les réservations
// Thin controller: délègue à reservationService
const reservationService = require('../services/reservationService');

const sendError = (res, error) => {
    const statusCode = error.statusCode || error.status || 500;
    return res.status(statusCode).json({ message: error.message });
};


// GET /api/reservations/disponibilite?salle_id=X&date=Y
// Retourne la disponibilité des créneaux pour une salle et une date
const getDisponibilite = async (req, res) => {
    try {
        const { salle_id, date } = req.query;
        const result = await reservationService.getDisponibilite(salle_id, date);
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/me
// Retourne les réservations de l'utilisateur courant
const getMyReservations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reservations = await reservationService.getUserReservations(userId);
        res.status(200).json(reservations);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations (admin only)
// Retourne toutes les réservations, filtrées par query params optionnels
const getAllReservations = async (req, res) => {
    try {
        const { salle_id, utilisateur_id, statut, type_reservation } = req.query;
        const reservations = await reservationService.getAllReservations({
            salle_id, utilisateur_id, statut, type_reservation
        });
        res.status(200).json(reservations);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/filters-data (admin only)
// Retourne les listes de salles et utilisateurs pour alimenter les filtres
const getFiltersData = async (req, res) => {
    try {
        const data = await reservationService.getFiltersData();
        res.status(200).json(data);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/:id
// Retourne une réservation spécifique
const getReservationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await reservationService.getReservationById(id);
        res.status(200).json(reservation);
    } catch (error) {
        sendError(res, error);
    }
};

// POST /api/reservations
// Crée une nouvelle réservation
const createReservation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await reservationService.createReservation(req.body, userId);
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
};

// PATCH /api/reservations/:id/cancel
// Annule une réservation
const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        await reservationService.cancelReservation(id, userId, isAdmin);
        res.status(200).json({ message: 'Réservation annulée avec succès' });
    } catch (error) {
        sendError(res, error);
    }
};





// GET /api/reservations/me/stats
// Retourne les statistiques du dashboard pour l'utilisateur courant
const getMyDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const stats = await reservationService.getDashboardStats(userId);
        res.status(200).json(stats);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/me/upcoming
// Retourne les réservations à venir de l'utilisateur courant
const getMyUpcoming = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reservations = await reservationService.getUpcomingReservations(userId);
        res.status(200).json(reservations);
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/me/history
// Retourne l'historique des réservations de l'utilisateur courant
const getMyHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const reservations = await reservationService.getHistoryReservations(userId);
        res.status(200).json(reservations);
    } catch (error) {
        sendError(res, error);
    }
};

// PATCH /api/reservations/:id/statut (admin uniquement)
// Met à jour le statut d'une réservation
const updateStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const isAdmin = req.user.role === 'admin';

        await reservationService.updateReservationStatut(id, statut, isAdmin);
        res.status(200).json({ message: 'Statut mis à jour avec succès' });
    } catch (error) {
        sendError(res, error);
    }
};

// GET /api/reservations/user/:userId (admin only)
// Retourne les réservations d'un utilisateur spécifique
const getUserReservationsAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const reservations = await reservationService.getUserReservations(userId);
        res.status(200).json(reservations);
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    getMyReservations,
    getMyDashboardStats,
    getMyUpcoming,
    getMyHistory,
    getAllReservations,
    getFiltersData,
    getReservationDetails,
    createReservation,
    cancelReservation,
    updateStatut,
    getUserReservationsAdmin,
    getDisponibilite,
};
