// Middlewares pour l'authentification et l'autorisation
const authService = require('../services/authService');


// Middleware pour vérifier si l'utilisateur est authentifié
const authRequired = (req, res, next) => {
    // Priorité: token stocké en HttpOnly cookie (nom: "token").
    // Fallback: Authorization header Bearer <token> pour compatibilité.
    const tokenFromCookie = req.cookies && req.cookies.token;
    let token = tokenFromCookie || null;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return next(new Error('Token manquant ou invalide', 401));
    }

    try {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};

// Middleware pour vérifier le rôle de l'utilisateur
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new Error('Utilisateur non authentifié', 401));
        }

        if (req.user.role !== role) {
            return next(new Error('Accès refusé: rôle insuffisant', 403));
        }

        next();
    };
};

module.exports = {
    authRequired,
    requireRole
};
