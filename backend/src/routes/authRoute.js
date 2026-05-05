const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



// Route pour récupérer tous les types
// URL : GET http://localhost:3000/api/auth/login
router.post('/login', authController.login);



module.exports = router;