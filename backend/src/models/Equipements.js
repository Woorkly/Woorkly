const BaseModel = require("./BaseModel");
const db = require("../config/db");

class Equipements extends BaseModel {
  static table = "equipements";
  constructor(data) {
    super("equipements"); // On dit à la classe mère qu'on gère la table 'equipements'
    Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
  }

  // Création d'un equipment dans la table `equipements`
  static async create(data) {
    const connection = await super.getConnection();

    try {
      const sql = `
                INSERT INTO equipements (nom) 
                VALUES (?)
            `;

      const params = [data.nom];

      const [result] = await connection.execute(sql, params);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  //modification d'un equipement
  static async update(id, data) {
    const connection = await super.getConnection();
    try {
      const sql = `
                UPDATE equipements 
                SET nom = ?  WHERE id = ?
            `;
      const params = [data.nom, id];

      const [result] = await connection.execute(sql, params);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Equipements;
