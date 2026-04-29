const BaseModel = require('./BaseModel');
const db = require('../config/db');

class User extends BaseModel {
    static table = 'utilisateurs';

    constructor(data) {
        super('utilisateurs'); // On dit à la classe mère qu'on gère la table 'utilisateurs'
        Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
    }

    

    static async delete(id) {
        return super.delete(id, 'utilisateurs');
    }

    // Création d'un utilisateur dans la table `utilisateurs`
    static async create(data) {
        const connection = await super.getConnection();

        try {
            const sql = `
                INSERT INTO utilisateurs (nom, email, password, avatar_url, role)
                VALUES (?, ?, ?, ?, ?)
            `;

            const params = [
                data.nom,
                data.email,
                data.password,
                data.avatar_url || 'default-avatar.png',
                data.role || 'user'
            ];

            const [result] = await connection.execute(sql, params);
            return result.insertId;
        } finally {
            connection.release();
        }
    }

   

    
}

module.exports = User;