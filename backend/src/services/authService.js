const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require("../models/User");


// Fonction pour générer un token JWT
const generateToken = (user) => {   
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            nom: user.nom,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Fonction pour vérifier un token JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}
// connexion d'un utilisateur
  const login = async (data) => {
    
    const user = await User.findByEmail(data.email);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error("Mot de passe incorrect");
    }
    return user;
  }


  module.exports = {    
    login,
    generateToken   
};