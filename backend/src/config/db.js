// Pool de connexions MySQL partagé par tous les modèles.
// mysql2/promise expose directement les API async/await sans callback.
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// connectionLimit: 10 → max 10 connexions simultanées, les suivantes attendent (waitForConnections)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;