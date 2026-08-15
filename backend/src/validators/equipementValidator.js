const { body } = require('express-validator');

const createEquipementValidator = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom de l\'équipement est obligatoire.')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
];

const updateEquipementValidator = [
    body('nom')
        .optional()
        .trim()
        .notEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères.'),
];

module.exports = { createEquipementValidator, updateEquipementValidator };
