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
        const error = new Error('Token manquant ou invalide');
        error.statusCode = 401;
        return next(error);
    }

    try {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        err.statusCode = 401;
        next(err);
    }
};

// Middleware pour vérifier le rôle de l'utilisateur
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            const error = new Error('Utilisateur non authentifié');
            error.statusCode = 401;
            return next(error);
        }

        if (req.user.role !== role) {
            const error = new Error('Accès refusé: rôle insuffisant');
            error.statusCode = 403;
            return next(error);
        }

        next();
    };
};

module.exports = {
    authRequired,
    requireRole
};
