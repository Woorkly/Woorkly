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



module.exports = {
    getMyReservations,
    getAllReservations,
    getReservationDetails,
    createReservation,
    cancelReservation
};
