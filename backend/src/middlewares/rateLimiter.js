const rateLimit = require('express-rate-limit');

// Limiteur global : 100 requêtes par IP toutes les 15 minutes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.'
    }
});

// Limiteur strict pour le login : 10 tentatives par IP toutes les 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
    }
});

module.exports = { globalLimiter, loginLimiter };
