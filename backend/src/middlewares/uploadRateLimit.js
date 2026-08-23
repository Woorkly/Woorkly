const rateLimit = require('express-rate-limit');

// Rate limiting pour les uploads: max 10 uploads par utilisateur par heure
// Prévient les attaques par déni de service (DOS) et la saturation du stockage
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // Max 10 uploads par heure
    keyGenerator: (req, res) => {
        // Utiliser l'ID utilisateur comme clé (nécessite authRequired)
        return req.user?.userId || req.ip;
    },
    message: 'Trop d\'uploads en peu de temps. Limite: 10 uploads par heure.',
    standardHeaders: false, // Désactiver les headers RateLimit
    legacyHeaders: false,
    skip: (req, res) => {
        // Appliquer le rate limiting uniquement aux routes d'upload
        return !req.file;
    }
});

module.exports = uploadLimiter;
