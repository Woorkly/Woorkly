const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });

async function runMigration() {
    let connection;

    try {
        // Connexion à MySQL (sans base précise d'abord pour pouvoir la créer)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        });

        console.log('--- Démarrage de la Migration ---');

        // Exécuter seulement la migration
        const migratePath = path.join(__dirname, 'migrate.sql');
        const migrateSql = await fs.readFile(migratePath, 'utf8');
        await connection.query(migrateSql);
        console.log('✓ Migration terminée (Structure créée).');

        console.log('--- Migration terminée ! ---');

    } catch (error) {
        console.error('Erreur pendant la migration :', error.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

runMigration();
