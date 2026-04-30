const BaseModel = require('./BaseModel');
const db = require('../config/db');

class Types extends BaseModel {
   

    constructor(data) {
        super('types'); // On dit à la classe mère qu'on gère la table 'types'
        Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
    } 

    // Création d'un types dans la table `typess`
    static async create(data) {
        const connection = await super.getConnection();

        try {
            const sql = `
                INSERT INTO types (nom)
                VALUES (?)
            `;          

            const [result] = await connection.execute(sql, [data.nom]);
            return result.insertId;
        } finally {
            connection.release();
        }
    }

    //modification d'un types
    static async update(id, data) {
        const connection = await super.getConnection();
        try {
            const sql = `
                UPDATE types
                SET nom = ?
                WHERE id = ?
            `;
            const params = [
                data.nom,               
                id
            ];

            const [result] = await connection.execute(sql, params);
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }


   

    
}

module.exports = Types;