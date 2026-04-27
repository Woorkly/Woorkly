const db = require('../config/db');

class Room {
    // 1. On adapte le constructeur avec TOUS les champs de ta table 'salles'
    constructor(id, nom, statut, adresse, code_postal, ville, latitude, longitude, capacite, description, prix_heure, prix_demi_journee, prix_journee, image_principale, type_id) {
        this.id = id;
        this.nom = nom;
        this.statut = statut;
        this.adresse = adresse;
        this.code_postal = code_postal;
        this.ville = ville;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacite = capacite;
        this.description = description;
        this.prix_heure = prix_heure;
        this.prix_demi_journee = prix_demi_journee;
        this.prix_journee = prix_journee;
        this.image_principale = image_principale;
        this.type_id = type_id;
    }

    // 2. Récupérer toutes les salles (avec une jointure pour avoir le nom du type !)
    static async getAll() {
        const sql = `
            SELECT s.*, t.nom as type_nom 
            FROM salles s
            JOIN types t ON s.type_id = t.id
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    // 3. Récupérer une salle précise
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

    // 3.bis Récupérer uniquement la galerie d'une salle
static async getPhotos(salleId) {
    const sql = "SELECT url FROM salle_photos WHERE salle_id = ?";
    const [rows] = await db.execute(sql, [salleId]);
    return rows; // Retourne un tableau d'URLs
}

    // 4. Ajouter une méthode pour Créer une salle (indispensable pour l'Admin)
    static async create(data) {
        const sql = `
            INSERT INTO salles 
            (nom, statut, adresse, code_postal, ville, latitude, longitude, capacite, description, prix_heure, prix_demi_journee, prix_journee, type_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.nom, data.statut, data.adresse, data.code_postal, data.ville, 
            data.latitude, data.longitude, data.capacite, data.description, 
            data.prix_heure, data.prix_demi_journee, data.prix_journee, data.type_id
        ];
        const [result] = await db.execute(sql, params);
        return result.insertId; // Retourne l'ID de la salle créée
    }

    // 5. Récupérer les équipements d'une salle (Jointure Many-to-Many)
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
}

module.exports = Room;