const { body } = require('express-validator');

const STATUTS_VALIDES = ['en_attente', 'confirmee', 'annulee'];
const TYPES_VALIDES = ['presentiel', 'hybride', 'distanciel'];

const createReservationValidator = [
    body('salle_id')
        .notEmpty().withMessage('L\'identifiant de la salle est obligatoire.')
        .isInt({ min: 1 }).withMessage('L\'identifiant de la salle doit être un entier valide.'),
    body('date_debut')
        .notEmpty().withMessage('La date de début est obligatoire.')
        .isISO8601().withMessage('La date de début doit être au format ISO 8601 (ex: 2024-06-01T09:00:00).'),
    body('date_fin')
        .notEmpty().withMessage('La date de fin est obligatoire.')
        .isISO8601().withMessage('La date de fin doit être au format ISO 8601.')
        .custom((dateFin, { req }) => {
            if (new Date(dateFin) <= new Date(req.body.date_debut)) {
                throw new Error('La date de fin doit être postérieure à la date de début.');
            }
            return true;
        }),
    body('type_reservation')
        .optional()
        .isIn(TYPES_VALIDES).withMessage(`Le type doit être l'un des suivants : ${TYPES_VALIDES.join(', ')}.`),
];

const updateStatutValidator = [
    body('statut')
        .notEmpty().withMessage('Le statut est obligatoire.')
        .isIn(STATUTS_VALIDES).withMessage(`Le statut doit être l'un des suivants : ${STATUTS_VALIDES.join(', ')}.`),
];

module.exports = { createReservationValidator, updateStatutValidator };
