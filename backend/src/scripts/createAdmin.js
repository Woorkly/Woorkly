// Script pour créer un utilisateur administrateur s'il n'existe pas
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../models/User');
const db = require('../config/db');

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Administrateur';

    // Vérifier que les variables d'environnement sont définies
    if (!adminEmail || !adminPassword) {
      console.error('Erreur : ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le .env');
      process.exit(1);
    }

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('Admin existe déjà :', adminEmail);
      process.exit(0);
    }

    // Créer l'admin
    const userId = await User.create({
      nom: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin créé avec succès !');
    console.log('Email :', adminEmail);
    console.log('ID :', userId);
    process.exit(0);

  } catch (error) {
    console.error('Erreur lors de la création de l\'admin :', error.message);
    process.exit(1);
  }
}

// Lancer le script
createAdminUser();
