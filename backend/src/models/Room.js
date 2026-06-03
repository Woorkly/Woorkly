const BaseModel = require("./BaseModel");
const db = require("../config/db");

class Room extends BaseModel {
    static table='salles';
    constructor(data) {
        super('salles'); // On dit à la classe mère qu'on gère la table 'salles'
        Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
    }

  // On réécrit getAll car on a une jointure spécifique (Polymorphisme)
  static async getAll(filters = {}) {
    const where = [];
    const params = [];

    if (filters.ville) {
      where.push('LOWER(s.ville) LIKE ?');
      params.push(`%${String(filters.ville).trim().toLowerCase()}%`);
    }

    if (filters.capacite_min) {
      where.push('s.capacite >= ?');
      params.push(Number(filters.capacite_min));
    }

    if (filters.type_id) {
      where.push('s.type_id = ?');
      params.push(Number(filters.type_id));
    }

    const sql = `
            SELECT s.*, t.nom as type_nom 
            FROM salles s
            JOIN types t ON s.type_id = t.id
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        `;
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async getAvailable(filters = {}) {
    const where = ["s.statut = 'disponible'"];
    const params = [];

    if (filters.ville) {
      where.push('LOWER(s.ville) LIKE ?');
      params.push(`%${String(filters.ville).trim().toLowerCase()}%`);
    }

    if (filters.capacite_min) {
      where.push('s.capacite >= ?');
      params.push(Number(filters.capacite_min));
    }

    if (filters.type_id) {
      where.push('s.type_id = ?');
      params.push(Number(filters.type_id));
    }

    const sql = `
            SELECT s.*, t.nom as type_nom 
            FROM salles s
            JOIN types t ON s.type_id = t.id
            WHERE ${where.join(' AND ')}
        `;
    const [rows] = await db.execute(sql, params);
    return rows;
  }
  // On réécrit getById car on a une jointure spécifique (type de salle)
  static async getById(id) {
    const sql = `
            SELECT s.*, t.nom as type_nom 
            FROM salles s
            JOIN types t ON s.type_id = t.id
            WHERE s.id = ?
        `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  // recuperer les photos d'une salle
  static async getPhotos(salleId) {
    const [rows] = await db.execute(
      "SELECT url FROM salle_photos WHERE salle_id = ?",
      [salleId],
    );
    return rows;
  }

  // La création utilise l'outil getConnection de la classe mère
  static async create(data, photos = []) {
    const connection = await super.getConnection();
    try {
      await connection.beginTransaction();

      const sql = `
                INSERT INTO salles 
                (nom, statut, adresse, code_postal, ville, latitude, longitude, capacite, description, prix_heure, prix_demi_journee, prix_journee, image_principale, type_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
      const params = [
        data.nom,
        data.statut,
        data.adresse,
        data.code_postal,
        data.ville,
        data.latitude,
        data.longitude,
        data.capacite,
        data.description,
        data.prix_heure,
        data.prix_demi_journee,
        data.prix_journee,
        data.image_principale,
        data.type_id,
      ];

      const [result] = await connection.execute(sql, params);
      const newId = result.insertId;

      if (photos.length > 0) {
        const photoSql =
          "INSERT INTO salle_photos (salle_id, url) VALUES (?, ?)";
        for (const url of photos) {
          await connection.execute(photoSql, [newId, url]);
        }
      }

      await connection.commit();
      return newId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getEquipments(roomId) {
    const sql = `
            SELECT e.nom 
            FROM equipements e
            JOIN salle_equipements se ON e.id = se.equipement_id
            WHERE se.salle_id = ?
        `;
    const [rows] = await db.execute(sql, [roomId]);
    return rows;
  }

  static async update(id, data) {
    const sql = `
            UPDATE salles
            SET nom = ?,
                statut = ?,
                adresse = ?,
                code_postal = ?,
                ville = ?,
                latitude = ?,
                longitude = ?,
                capacite = ?,
                description = ?,
                prix_heure = ?,
                prix_demi_journee = ?,
                prix_journee = ?,
                image_principale = ?,
                type_id = ?
            WHERE id = ?
        `;
    const params = [
      data.nom,
      data.statut,
      data.adresse,
      data.code_postal,
      data.ville,
      data.latitude,
      data.longitude,
      data.capacite,
      data.description,
      data.prix_heure,
      data.prix_demi_journee,
      data.prix_journee,
      data.image_principale,
      data.type_id,
      id,
    ];

    const [result] = await db.execute(sql, params);
    return result.affectedRows;
  }
}

module.exports = Room;
