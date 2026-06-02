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

   
}

module.exports = Reservation;
