const rateLimit = require('express-rate-limit');

const createMessage = (windowMs) => {
    const minutes = Math.ceil(windowMs / 60 / 1000);
    return `Trop de requêtes détectées. Veuillez réessayer dans ${minutes} minutes.`;
};

const loginMessage = (windowMs) => {
    const minutes = Math.ceil(windowMs / 60 / 1000);
    return `Trop de tentatives de connexion. Veuillez réessayer dans ${minutes} minutes.`;
};

const WINDOW_MS = 15 * 60 * 1000;

// Limiteur global : 100 requêtes par IP toutes les 15 minutes
const globalLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS', // Ignorer les OPTIONS (preflight CORS)
    handler: (req, res) => {
        const retryAfter = req.rateLimit?.resetTime
            ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
            : Math.ceil(WINDOW_MS / 1000);

        res.status(429).json({
            status: 429,
            message: 'Trop de requêtes détectées. Votre adresse IP a dépassé la limite de requêtes.',
            retryAfter,
            hint: `Veuillez réessayer dans ${Math.ceil(retryAfter / 60)} minutes.`
        });
    }
});

// Limiteur strict pour le login : 10 tentatives par IP toutes les 15 minutes
const loginLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: (req) => req.method === 'OPTIONS', // Ignorer les OPTIONS (preflight CORS)
    handler: (req, res) => {
        const retryAfter = req.rateLimit?.resetTime
            ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
            : Math.ceil(WINDOW_MS / 1000);

        res.status(429).json({
            status: 429,
            message: 'Trop de tentatives de connexion échouées. Votre compte a été temporairement verrouillé pour des raisons de sécurité.',
            retryAfter,
            hint: `Veuillez réessayer dans ${Math.ceil(retryAfter / 60)} minutes.`
        });
    }
});

module.exports = { globalLimiter, loginLimiter };
