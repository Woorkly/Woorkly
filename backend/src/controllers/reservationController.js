// Controller pour les réservations
// Thin controller: délègue à reservationService
const reservationService = require('../services/reservationService');


// GET /api/reservations/me
// Retourne les réservations de l'utilisateur courant
const getMyReservations = (req, res) => {
    try {const userId = req.user.userId;
    const reservations = await reservationService.getUserReservations(userId);
    res.status(200).json(reservations);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

// GET /api/reservations (admin only)
// Retourne toutes les réservations
const getAllReservations = (req, res) => {
    try {
        const reservations = await reservationService.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reservations/:id
// Retourne une réservation spécifique
const getReservationDetails = (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await reservationService.getReservationById(id);
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/reservations
// Crée une nouvelle réservation
const createReservation = (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await reservationService.createReservation(req.body, userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





module.exports = {
    getMyReservations,
    getAllReservations,
    getReservationDetails,
    createReservation,
    cancelReservation
};
