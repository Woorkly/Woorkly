// Middleware à placer après les chaînes de validators express-validator.
// Collecte toutes les erreurs de validation et renvoie un 422 si au moins une existe.
// Sinon, passe la main au handler de route suivant.
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Construire un message à partir du premier message d'erreur (pour le frontend)
        const firstError = errors.array()[0];
        const message = firstError?.msg || 'Erreur de validation';

        return res.status(422).json({
            message,
            errors: errors.array()
        });
    }
    next();
};

module.exports = validate;
