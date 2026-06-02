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

     // Vérifie s'il y a un chevauchement horaire pour une salle à une date donnée
    static async hasConflict(salleId, date, heureDebut, heureFin, excludeId = null) {
        let sql = `
            SELECT COUNT(*) as conflict
            FROM reservations
            WHERE salle_id = ?
            AND DATE(date) = ?
            AND statut != 'annulee'
            AND NOT (heure_fin <= ? OR heure_debut >= ?)
        `;
        const params = [salleId, date, heureDebut, heureFin];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const [result] = await db.execute(sql, params);
        return result[0].conflict > 0;
    }

     // Crée une réservation
    static async create(data) {
        const connection = await super.getConnection();
        try {
            const sql = `
                INSERT INTO reservations 
                (date, heure_debut, heure_fin, type_reservation, statut, prix_total, salle_id, utilisateur_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                data.date,
                data.heure_debut,
                data.heure_fin,
                data.type_reservation,
                data.statut || 'en-attente',
                data.prix_total,
                data.salle_id,
                data.utilisateur_id
            ];

            const [result] = await connection.execute(sql, params);
            return result.insertId;
        } finally {
            connection.release();
        }
    }

     // Annule une réservation
    static async cancel(id) {
        const sql = 'UPDATE reservations SET statut = ? WHERE id = ?';
        const [result] = await db.execute(sql, ['annulee', id]);
        return result.affectedRows > 0;
    }



   
}

module.exports = Reservation;
