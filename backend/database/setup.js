const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../src/.env.docker') });
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSetup() {
    let connection;
    let exitCode = 0;

    try {
        const connectionOptions = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true,
        };

        let lastError = null;
        for (let attempt = 1; attempt <= 10; attempt += 1) {
            try {
                // Connexion à MySQL (sans base précise d'abord pour pouvoir la créer)
                connection = await mysql.createConnection(connectionOptions);
                break;
            } catch (error) {
                lastError = error;
                if (attempt === 10) {
                    throw lastError;
                }
                await sleep(2000);
            }
        }

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
        exitCode = 1;
    } finally {
        if (connection) await connection.end();
        process.exit(exitCode);
    }
}

if (require.main === module) {
    runSetup();
}

module.exports = runSetup;