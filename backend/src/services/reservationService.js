// Services pour les réservations
// Centralisent la logique de validation, calcul de prix, et anti-chevauchement
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getTodayIsoDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
};


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

    if (!salle_id || !date || !heure_debut || !heure_fin || !type_reservation) {
        throw createHttpError('Les informations de réservation sont incomplètes', 400);
    }

    if (String(date) < getTodayIsoDate()) {
        throw createHttpError('Vous ne pouvez pas réserver une date antérieure à aujourd\'hui', 400);
    }

    // Vérifier que la salle existe
    const room = await Room.getById(salle_id);
    if (!room) {
        throw createHttpError('Salle introuvable', 404);
    }

    // Vérifier qu'il n'y a pas de chevauchement
    const hasConflict = await Reservation.hasConflict(salle_id, date, heure_debut, heure_fin);
    if (hasConflict) {
        throw createHttpError('Cette salle est déjà réservée à cet horaire', 409);
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


const VALID_STATUTS = ['en-attente', 'confirmee', 'annulee', 'terminee', 'abandonne'];

// Agrège toutes les stats du dashboard utilisateur en un seul appel
const getDashboardStats = async (userId) => {
    const now = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const [monthly, typeUsage, heures_ce_mois, taux_presence] = await Promise.all([
        Reservation.getMonthlyStats(userId, year),
        Reservation.getTypeUsage(userId),
        Reservation.getMonthlyHours(userId, month, year),
        Reservation.getPresenceRate(userId),
    ]);

    return {
        kpis: {
            heures_ce_mois: Math.round(heures_ce_mois * 10) / 10,
            taux_presence,
        },
        monthly,
        type_usage: typeUsage,
    };
};

// Réservations à venir de l'utilisateur (auto-mise à jour des statuts expirés avant)
const getUpcomingReservations = async (userId) => {
    await Reservation.autoUpdateExpiredStatuses();
    return Reservation.getUpcoming(userId);
};

// Historique des réservations de l'utilisateur
const getHistoryReservations = async (userId) => {
    await Reservation.autoUpdateExpiredStatuses();
    return Reservation.getHistory(userId);
};

// Met à jour le statut d'une réservation (admin uniquement)
const updateReservationStatut = async (reservationId, statut, isAdmin) => {
    if (!VALID_STATUTS.includes(statut)) {
        throw createHttpError(`Statut invalide: ${statut}`, 400);
    }

    const reservation = await Reservation.getById(reservationId);
    if (!reservation) {
        throw createHttpError('Réservation introuvable', 404);
    }

    if (!isAdmin) {
        throw createHttpError('Accès refusé — modification de statut réservée aux administrateurs', 403);
    }

    const updated = await Reservation.updateStatut(reservationId, statut);
    if (!updated) {
        throw createHttpError('Erreur lors de la mise à jour du statut', 500);
    }
};

// Annule une réservation
const cancelReservation = async (reservationId, userId, isAdmin = false) => {
    const reservation = await Reservation.getById(reservationId);
    if (!reservation) {
        throw createHttpError('Réservation introuvable', 404);
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (!isAdmin && reservation.utilisateur_id !== userId) {
        throw createHttpError('Accès refusé', 403);
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (reservation.statut === 'annulee') {
        throw createHttpError('Cette réservation est déjà annulée', 400);
    }

    const cancelled = await Reservation.cancel(reservationId);
    if (!cancelled) {
        throw createHttpError('Erreur lors de l\'annulation', 500);
    }
};





module.exports = {
    getUserReservations,
    getAllReservations,
    getReservationById,
    getUpcomingReservations,
    getHistoryReservations,
    getDashboardStats,
    createReservation,
    cancelReservation,
    updateReservationStatut,
    calculatePrice
};
