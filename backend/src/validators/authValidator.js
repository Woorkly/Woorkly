const { body } = require('express-validator');

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('L\'email est obligatoire.')
        .isEmail().withMessage('L\'email n\'est pas valide.'),
    body('password')
        .notEmpty().withMessage('Le mot de passe est obligatoire.')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

module.exports = { loginValidator };
