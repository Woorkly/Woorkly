const BaseModel = require("./BaseModel");
const bcrypt = require('bcrypt');
const db = require("../config/db");

class User extends BaseModel {
    static table='utilisateurs';

  static normalizeFields(fields) {
    const normalized = { ...fields };

    if (normalized.avatar !== undefined && normalized.avatar_url === undefined) {
      normalized.avatar_url = normalized.avatar;
    }

    delete normalized.avatar;
    
    if (typeof normalized.avatar_url === 'object' || normalized.avatar_url === '[object Object]' || normalized.avatar_url === '{}') {
      delete normalized.avatar_url;
    }

    return Object.fromEntries(
      Object.entries(normalized).filter(([key, value]) =>
        ['nom', 'email', 'password', 'avatar_url', 'role'].includes(key) && value !== undefined
      )
    );
  }
   

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
      const normalizedData = User.normalizeFields(data);
      const sql = `
                UPDATE utilisateurs 
                SET nom = ?, email = ?, password = ?, avatar_url = ?, role = ?
                WHERE id = ?
            `;
      const params = [
        normalizedData.nom !== undefined ? normalizedData.nom : data.nom,
        normalizedData.email !== undefined ? normalizedData.email : data.email,
        normalizedData.password !== undefined ? normalizedData.password : data.password,
        normalizedData.avatar_url !== undefined ? normalizedData.avatar_url : data.avatar_url,
        normalizedData.role !== undefined ? normalizedData.role : data.role,
        id,
      ];

      const [result] = await connection.execute(sql, params);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async patch(id, fields) {
    const connection = await super.getConnection();
    try {
      const entries = Object.entries(User.normalizeFields(fields));
      const processedEntries = await Promise.all(
        entries.map(async ([col, val]) => {
          if (col === 'password' && val) {
            return [col, await bcrypt.hash(val, 10)];
          }
          return [col, val];
        })
      );
      const set = processedEntries.map(([col]) => `${col} = ?`).join(', ');
      const params = [...processedEntries.map(([, val]) => val), id];
      const [result] = await connection.execute(
        `UPDATE utilisateurs SET ${set} WHERE id = ?`,
        params
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const sql = `
      SELECT u.id, u.nom, u.email, u.avatar_url, u.role,
             (SELECT COUNT(*) FROM reservations r WHERE r.utilisateur_id = u.id) AS total_reservations
      FROM utilisateurs u
      ORDER BY u.id
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // Récupérer un utilisateur par son email (pour l'authentification)
  static async findByEmail(email) {
    const sql = "SELECT * FROM utilisateurs WHERE email = ?";
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  }

  

}


module.exports = User;
