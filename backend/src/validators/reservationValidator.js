const { body } = require('express-validator');

const STATUTS_VALIDES = ['en_attente', 'confirmee', 'annulee'];
const TYPES_VALIDES = ['heure', 'demi-journee', 'journee'];

const createReservationValidator = [
    body('salle_id')
        .notEmpty().withMessage('L\'identifiant de la salle est obligatoire.')
        .isInt({ min: 1 }).withMessage('L\'identifiant de la salle doit être un entier valide.'),
    body('date')
        .notEmpty().withMessage('La date est obligatoire.')
        .isISO8601().withMessage('La date doit être au format ISO 8601 (ex: 2024-06-01).'),
    body('heure_debut')
        .notEmpty().withMessage('L\'heure de début est obligatoire.')
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('L\'heure de début doit être au format HH:MM.'),
    body('heure_fin')
        .notEmpty().withMessage('L\'heure de fin est obligatoire.')
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('L\'heure de fin doit être au format HH:MM.')
        .custom((heureFin, { req }) => {
            if (heureFin <= req.body.heure_debut) {
                throw new Error('L\'heure de fin doit être postérieure à l\'heure de début.');
            }
            return true;
        }),
    body('type_reservation')
        .notEmpty().withMessage('Le type de réservation est obligatoire.')
        .isIn(TYPES_VALIDES).withMessage(`Le type doit être l'un des suivants : ${TYPES_VALIDES.join(', ')}.`),
];

const updateStatutValidator = [
    body('statut')
        .notEmpty().withMessage('Le statut est obligatoire.')
        .isIn(STATUTS_VALIDES).withMessage(`Le statut doit être l'un des suivants : ${STATUTS_VALIDES.join(', ')}.`),
];

module.exports = { createReservationValidator, updateStatutValidator };
