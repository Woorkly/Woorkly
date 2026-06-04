const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });

async function runSetup() {
    let connection;

    try {
        // Connexion à MySQL (sans base précise d'abord pour pouvoir la créer)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true // Très important pour exécuter tout le fichier SQL d'un coup
        });

        console.log('--- Démarrage du Setup Workly ---');

        // 1. Lire et exécuter la Migration
        const migratePath = path.join(__dirname, 'migrate.sql');
        const migrateSql = await fs.readFile(migratePath, 'utf8');
        await connection.query(migrateSql);
        console.log('Migration terminée (Structure créée).');

        // 2. Lire et exécuter le Seed
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSql = await fs.readFile(seedPath, 'utf8');
        await connection.query(seedSql);
        console.log('Seeding terminé (Données insérées).');

        console.log('--- Base de données prête ! ---');

    } catch (error) {
        console.error('Erreur pendant le setup :', error.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

runSetup();