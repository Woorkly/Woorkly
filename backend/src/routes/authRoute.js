const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



// Route pour authentification (login)
// URL : POST http://localhost:3000/api/auth/login
router.post('/login', authController.login);



module.exports = router;