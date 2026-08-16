const { body } = require('express-validator');

const createRoomValidator = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom de la salle est obligatoire.')
        .isLength({ max: 150 }).withMessage('Le nom ne peut pas dépasser 150 caractères.'),
    body('adresse')
        .trim()
        .notEmpty().withMessage('L\'adresse est obligatoire.'),
    body('code_postal')
        .trim()
        .notEmpty().withMessage('Le code postal est obligatoire.')
        .matches(/^\d{5}$/).withMessage('Le code postal doit contenir exactement 5 chiffres.'),
    body('ville')
        .trim()
        .notEmpty().withMessage('La ville est obligatoire.'),
    body('capacite')
        .notEmpty().withMessage('La capacité est obligatoire.')
        .isInt({ min: 1 }).withMessage('La capacité doit être un entier supérieur à 0.'),
    body('prix_heure')
        .notEmpty().withMessage('Le prix par heure est obligatoire.')
        .isFloat({ min: 0 }).withMessage('Le prix par heure doit être un nombre positif.'),
    body('prix_demi_journee')
        .notEmpty().withMessage('Le prix demi-journée est obligatoire.')
        .isFloat({ min: 0 }).withMessage('Le prix demi-journée doit être un nombre positif.'),
    body('prix_journee')
        .notEmpty().withMessage('Le prix journée est obligatoire.')
        .isFloat({ min: 0 }).withMessage('Le prix journée doit être un nombre positif.'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La description ne peut pas dépasser 1000 caractères.'),
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90.'),
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180.'),
];

const updateRoomValidator = [
    body('nom')
        .optional()
        .trim()
        .notEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({ max: 150 }).withMessage('Le nom ne peut pas dépasser 150 caractères.'),
    body('adresse')
        .optional()
        .trim()
        .notEmpty().withMessage('L\'adresse ne peut pas être vide.'),
    body('code_postal')
        .optional()
        .trim()
        .matches(/^\d{5}$/).withMessage('Le code postal doit contenir exactement 5 chiffres.'),
    body('ville')
        .optional()
        .trim()
        .notEmpty().withMessage('La ville ne peut pas être vide.'),
    body('capacite')
        .optional()
        .isInt({ min: 1 }).withMessage('La capacité doit être un entier supérieur à 0.'),
    body('prix_heure')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix par heure doit être un nombre positif.'),
    body('prix_demi_journee')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix demi-journée doit être un nombre positif.'),
    body('prix_journee')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix journée doit être un nombre positif.'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('La description ne peut pas dépasser 1000 caractères.'),
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90.'),
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180.'),
];

module.exports = { createRoomValidator, updateRoomValidator };
