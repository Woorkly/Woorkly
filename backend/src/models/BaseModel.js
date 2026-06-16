// Classe abstraite partagée par tous les modèles.
// Fournit les opérations génériques (findAll, findById, delete) et getConnection
// pour les transactions dans les classes filles.
const db = require('../config/db');

class BaseModel {

    constructor(table) {
        this.table = table;
    }

    // Méthode générique pour récupérer tout d'une table
    static async findAll(table = this.table) {
        const [rows] = await db.execute(`SELECT * FROM ${table}`);
        return rows;
    }

    // Méthode générique pour récupérer par ID
    static async findById(id, table = this.table) {
        const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [id]);
        return rows[0];
    }

    // Méthode générique pour supprimer
    static async delete(id, table = this.table) {
        const [result] = await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Utilitaire pour obtenir une connexion (pour les transactions dans les classes filles)
    static async getConnection() {
        return await db.getConnection();
    }
}

module.exports = BaseModel;