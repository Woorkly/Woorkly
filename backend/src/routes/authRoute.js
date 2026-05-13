const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



// Route pour authentification (login)
// URL : POST http://localhost:3000/api/auth/login
router.post('/login', authController.login);

// Récupère l'utilisateur courant (via cookie HttpOnly)
router.get('/me', authController.me);

// Logout: efface le cookie
router.post('/logout', authController.logout);



module.exports = router;