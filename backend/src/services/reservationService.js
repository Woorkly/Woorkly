// Services pour les réservations
// Centralisent la logique de validation, calcul de prix, et anti-chevauchement
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');


// Calcule le prix total selon le type de réservation
const calculatePrice = (room, typeReservation, heureDebut, heureFin) => {
    switch (typeReservation) {
        case 'heure': {
            const [startHour, startMinute] = heureDebut.split(':').map(Number);
            const [endHour, endMinute] = heureFin.split(':').map(Number);
            const startInMinutes = (startHour * 60) + startMinute;
            const endInMinutes = (endHour * 60) + endMinute;
            const durationInHours = (endInMinutes - startInMinutes) / 60;

            return (room.prix_heure || 0) * durationInHours;
        }
        case 'demi-journee':
            return room.prix_demi_journee || 0;
        case 'journee':
            return room.prix_journee || 0;
        default:
            return 0;
    }
};

// Récupère les réservations de l'utilisateur courant
const getUserReservations = async (userId) => {
    return Reservation.getByUserId(userId);
};

// Récupère toutes les réservations (admin)
const getAllReservations = async () => {
    return Reservation.getAll();
};


// Récupère une réservation spécifique
const getReservationById = async (id) => {
    const reservation = await Reservation.getById(id);
    if (!reservation) {
        throw new Error('Réservation introuvable', 404);
    }
    return reservation;
};

// Crée une nouvelle réservation
const createReservation = async (data, userId) => {
    const { salle_id, date, heure_debut, heure_fin, type_reservation } = data;

    // Vérifier que la salle existe
    const room = await Room.getById(salle_id);
    if (!room) {
        throw new Error('Salle introuvable', 404);
    }

    // Vérifier qu'il n'y a pas de chevauchement
    const hasConflict = await Reservation.hasConflict(salle_id, date, heure_debut, heure_fin);
    if (hasConflict) {
        throw new Error('Cette salle est déjà réservée à cet horaire', 409);
    }

    // Calculer le prix total
    const prix_total = calculatePrice(room, type_reservation, heure_debut, heure_fin);

    // Créer la réservation
    const reservationId = await Reservation.create({
        date,
        heure_debut,
        heure_fin,
        type_reservation,
        statut: 'en-attente',
        prix_total,
        salle_id,
        utilisateur_id: userId
    });

    return {
        id: reservationId,
        date,
        heure_debut,
        heure_fin,
        type_reservation,
        statut: 'en-attente',
        prix_total,
        salle_id,
        utilisateur_id: userId
    };
};





module.exports = {
    getUserReservations,
    getAllReservations,
    getReservationById,
    createReservation,
    cancelReservation,
    calculatePrice
};
