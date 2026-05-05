const BaseModel = require("./BaseModel");
const bcrypt = require('bcrypt');
const db = require("../config/db");

class User extends BaseModel {
    static table='utilisateurs';
   

  constructor(data) {
    super("utilisateurs"); // On dit à la classe mère qu'on gère la table 'utilisateurs'
    Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
  }

  // Création d'un utilisateur dans la table `utilisateurs`
  static async create(data) {
    const connection = await super.getConnection();

    try {
      const sql = `
                INSERT INTO utilisateurs (nom, email, password, avatar_url, role)
                VALUES (?, ?, ?, ?, ?)
            `;

      const hashedPassword = await bcrypt.hash(data.password, 10); // Hash du mot de passe

      const params = [
        data.nom,
        data.email,
        hashedPassword,
        data.avatar_url || "default-avatar.png",
        data.role || "user",
      ];

      const [result] = await connection.execute(sql, params);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  //modification d'un utilisateur
  static async update(id, data) {
    const connection = await super.getConnection();
    try {
      const sql = `
                UPDATE utilisateurs 
                SET nom = ?, email = ?, password = ?, avatar_url = ?, role = ?
                WHERE id = ?
            `;
      const params = [
        data.nom,
        data.email,
        data.password,
        data.avatar_url,
        data.role,
        id,
      ];

      const [result] = await connection.execute(sql, params);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Récupérer un utilisateur par son email (pour l'authentification)
  static async findByEmail(email) {
    const sql = "SELECT * FROM utilisateurs WHERE email = ?";
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }

  

}


module.exports = User;
