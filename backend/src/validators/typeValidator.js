const { body } = require('express-validator');

const createTypeValidator = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom du type est obligatoire.')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
];

const updateTypeValidator = [
    body('nom')
        .optional()
        .trim()
        .notEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
];

module.exports = { createTypeValidator, updateTypeValidator };
