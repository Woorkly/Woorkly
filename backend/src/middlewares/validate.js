// Middleware à placer après les chaînes de validators express-validator.
// Collecte toutes les erreurs de validation et renvoie un 422 si au moins une existe.
// Sinon, passe la main au handler de route suivant.
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};

module.exports = validate;
