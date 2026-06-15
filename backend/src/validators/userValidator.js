const { body } = require('express-validator');

const ROLES_VALIDES = ['user', 'admin'];

const createUserValidator = [
    body('nom')
        .trim()
        .notEmpty().withMessage('Le nom est obligatoire.')
        .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est obligatoire.')
        .isEmail().withMessage('L\'email n\'est pas valide.'),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire.')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('role')
        .optional()
        .isIn(ROLES_VALIDES).withMessage(`Le rôle doit être l'un des suivants : ${ROLES_VALIDES.join(', ')}.`),
];

const updateUserValidator = [
    body('nom')
        .optional()
        .trim()
        .notEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('L\'email n\'est pas valide.'),
    body('role')
        .optional()
        .isIn(ROLES_VALIDES).withMessage(`Le rôle doit être l'un des suivants : ${ROLES_VALIDES.join(', ')}.`),
];

const patchUserValidator = [
    body('nom')
        .optional()
        .trim()
        .notEmpty().withMessage('Le nom ne peut pas être vide.')
        .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères.'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('L\'email n\'est pas valide.'),
    body('role')
        .optional()
        .isIn(ROLES_VALIDES).withMessage(`Le rôle doit être l'un des suivants : ${ROLES_VALIDES.join(', ')}.`),
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

module.exports = { createUserValidator, updateUserValidator, patchUserValidator };
