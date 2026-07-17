const BaseModel = require("./BaseModel");
const db = require("../config/db");

class Room extends BaseModel {
  static table = "salles";
  constructor(data) {
    super("salles"); // On dit à la classe mère qu'on gère la table 'salles'
    Object.assign(this, data); // Astuce pour assigner tous les champs d'un coup
  }

  // Transforme "1,2,3" (ou un id seul) en tableau d'entiers valides
  static _parseEquipementIds(value) {
    if (!value) return [];
    return String(value)
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  // On réécrit getAll car on a une jointure spécifique (Polymorphisme)
  static async getAll(filters = {}) {
    const where = [];
    const params = [];

    if (filters.ville) {
      where.push("LOWER(s.ville) LIKE ?");
      params.push(`%${String(filters.ville).trim().toLowerCase()}%`);
    }

    if (filters.capacite_min) {
      where.push("s.capacite >= ?");
      params.push(Number(filters.capacite_min));
    }

    if (filters.capacite_max) {
      where.push("s.capacite <= ?");
      params.push(Number(filters.capacite_max));
    }

    if (filters.type_id) {
      where.push("s.type_id = ?");
      params.push(Number(filters.type_id));
    }

    const equipementIds = Room._parseEquipementIds(filters.equipement_id);
    if (equipementIds.length > 0) {
      where.push(`
        (
          SELECT COUNT(DISTINCT filter_se.equipement_id)
          FROM salle_equipements filter_se
          WHERE filter_se.salle_id = s.id
          AND filter_se.equipement_id IN (${equipementIds.map(() => "?").join(",")})
        ) = ?
      `);
      params.push(...equipementIds, equipementIds.length);
    }

    const sql = `
    SELECT
        s.*,
        t.nom as type_nom,
        GROUP_CONCAT(e.nom SEPARATOR ', ') as equipements
    FROM salles s
    JOIN types t ON s.type_id = t.id
    LEFT JOIN salle_equipements se ON s.id = se.salle_id
    LEFT JOIN equipements e ON se.equipement_id = e.id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    GROUP BY s.id
`;
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async getAvailable(filters = {}) {
    const where = ["s.statut = 'disponible'"];
    const params = [];

    if (filters.ville) {
      where.push("LOWER(s.ville) LIKE ?");
      params.push(`%${String(filters.ville).trim().toLowerCase()}%`);
    }

    if (filters.capacite_min) {
      where.push("s.capacite >= ?");
      params.push(Number(filters.capacite_min));
    }

    if (filters.type_id) {
      where.push("s.type_id = ?");
      params.push(Number(filters.type_id));
    }

    const equipementIds = Room._parseEquipementIds(filters.equipement_id);
    if (equipementIds.length > 0) {
      where.push(`
        (
          SELECT COUNT(DISTINCT filter_se.equipement_id)
          FROM salle_equipements filter_se
          WHERE filter_se.salle_id = s.id
          AND filter_se.equipement_id IN (${equipementIds.map(() => "?").join(",")})
        ) = ?
      `);
      params.push(...equipementIds, equipementIds.length);
    }

    const sql = `
            SELECT s.*, t.nom as type_nom
            FROM salles s
            JOIN types t ON s.type_id = t.id
            WHERE ${where.join(" AND ")}
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
  static async create(data, photos = [], equipmentIds = []) {
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

      if (equipmentIds.length > 0) {
        const equipmentSql =
          "INSERT INTO salle_equipements (salle_id, equipement_id) VALUES (?, ?)";
        for (const equipmentId of equipmentIds) {
          await connection.execute(equipmentSql, [newId, equipmentId]);
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
            SELECT e.id, e.nom 
            FROM equipements e
            JOIN salle_equipements se ON e.id = se.equipement_id
            WHERE se.salle_id = ?
        `;
    const [rows] = await db.execute(sql, [roomId]);
    return rows;
  }

  static async update(id, data, equipmentIds = [], photos = []) {
    const connection = await super.getConnection();
    try {
      await connection.beginTransaction();

      const [existingRows] = await connection.execute(
        "SELECT id FROM salles WHERE id = ?",
        [id],
      );
      if (existingRows.length === 0) {
        await connection.rollback();
        return 0;
      }

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

      const [result] = await connection.execute(sql, params);

      // --- Mise à jour des tables liées (photos et équipements) ---

      // 1. Photos de la galerie (supprimer puis réinsérer)
      await connection.execute(
        "DELETE FROM salle_photos WHERE salle_id = ?",
        [id],
      );
      if (photos && photos.length > 0) {
        const photoSql = "INSERT INTO salle_photos (salle_id, url) VALUES (?, ?)";
        for (const url of photos) {
          await connection.execute(photoSql, [id, url]);
        }
      }

      await connection.execute(
        "DELETE FROM salle_equipements WHERE salle_id = ?",
        [id],
      );

      if (equipmentIds.length > 0) {
        const equipmentSql =
          "INSERT INTO salle_equipements (salle_id, equipement_id) VALUES (?, ?)";
        for (const equipmentId of equipmentIds) {
          await connection.execute(equipmentSql, [id, equipmentId]);
        }
      }

      await connection.commit();
      return result.affectedRows || 1;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Room;
