const BaseModel = require('./BaseModel');
const db = require('../config/db');

class Reservation extends BaseModel {
    static table = 'reservations';

    constructor(data) {
        super('reservations');
        Object.assign(this, data);
    }

    // Récupère toutes les réservations d'un utilisateur
    static async getByUserId(userId) {
        const sql = `
            SELECT r.*, s.nom as salle_nom, s.prix_heure, s.prix_demi_journee, s.prix_journee
            FROM reservations r
            JOIN salles s ON r.salle_id = s.id
            WHERE r.utilisateur_id = ?
            ORDER BY r.date DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // Récupère toutes les réservations (admin)
    static async getAll() {
        const sql = `
            SELECT r.*, s.nom as salle_nom, u.email as user_email
            FROM reservations r
            JOIN salles s ON r.salle_id = s.id
            JOIN utilisateurs u ON r.utilisateur_id = u.id
            ORDER BY r.date DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

     // Récupère une réservation par ID
    static async getById(id) {
        const sql = `
            SELECT r.*, s.nom as salle_nom, u.nom as user_nom
            FROM reservations r
            JOIN salles s ON r.salle_id = s.id
            JOIN utilisateurs u ON r.utilisateur_id = u.id
            WHERE r.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

   
}

module.exports = Reservation;
