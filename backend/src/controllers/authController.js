const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const authService = require("../services/authService");
const jwt = require('jsonwebtoken');


// POST /api/auth/login
// Connexion d'un utilisateur
const login = async (req, res) => {
    const user = await authService.login(req.body);
    if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    const token = authService.generateToken(user);
    
    // Envoyer le token en HttpOnly Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
    });
    
    // Retourner user sans le token
    res.status(200).json({
        userId: user.id,
        email: user.email,
        nom: user.nom,
        role: user.role,        
    });
};

module.exports = {
    login
};      
