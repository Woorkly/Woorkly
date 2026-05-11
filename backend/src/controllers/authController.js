const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const authService = require("../services/authService");
const jwt = require('jsonwebtoken');


// POST /api/auth/login
// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    const token = authService.generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      userId: user.id,
      email: user.email,
      nom: user.nom,
      role: user.role,
    });
  } catch (error) {
    if (error.message === "Utilisateur non trouvé" || error.message === "Mot de passe incorrect") {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
    login
};      
