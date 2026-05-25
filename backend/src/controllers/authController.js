const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const authService = require("../services/authService");
const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};


// POST /api/auth/login
// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    const token = authService.generateToken(user);

    res.cookie('token', token, cookieOptions);

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

// GET /api/auth/me
const me = (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Non authentifié' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contient userId, email, nom, role
    return res.status(200).json({
      userId: decoded.userId,
      email: decoded.email,
      nom: decoded.nom,
      role: decoded.role,
    });
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({ message: 'Déconnecté' });
}

module.exports = {
  login,
  me,
  logout
};      
