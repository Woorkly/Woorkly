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
            SELECT r.*, s.nom as salle_nom, u.nom as utilisateur_nom, u.email as utilisateur_email
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

    // Retourne les réservations actives d'une salle pour une date donnée (pour le calcul de disponibilité)
    // en-attente ET confirmée bloquent le créneau ; annulée et abandonnée le libèrent
    static async getByRoomAndDate(salleId, date) {
        const sql = `
            SELECT heure_debut, heure_fin, type_reservation
            FROM reservations
            WHERE salle_id = ?
            AND DATE(date) = ?
            AND statut IN ('en-attente', 'confirmee')
        `;
        const [rows] = await db.execute(sql, [salleId, date]);
        return rows;
    }

     // Vérifie s'il y a un chevauchement horaire pour une salle à une date donnée
    // en-attente ET confirmée génèrent un conflit ; annulée et abandonnée sont ignorées
    static async hasConflict(salleId, date, heureDebut, heureFin, excludeId = null) {
        let sql = `
            SELECT COUNT(*) as conflict
            FROM reservations
            WHERE salle_id = ?
            AND DATE(date) = ?
            AND statut IN ('en-attente', 'confirmee')
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

    // Compte les réservations à venir (non annulées) d'un utilisateur
    static async countUpcoming(userId) {
        const sql = `
            SELECT COUNT(*) as total
            FROM reservations
            WHERE utilisateur_id = ?
            AND date >= CURDATE()
            AND statut NOT IN ('annulee', 'terminee')
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows[0].total;
    }

     // Annule une réservation
    static async cancel(id) {
        const sql = 'UPDATE reservations SET statut = ? WHERE id = ?';
        const [result] = await db.execute(sql, ['annulee', id]);
        return result.affectedRows > 0;
    }

    // Met à jour le statut d'une réservation
    static async updateStatut(id, statut) {
        const sql = 'UPDATE reservations SET statut = ? WHERE id = ?';
        const [result] = await db.execute(sql, [statut, id]);
        return result.affectedRows > 0;
    }

    // Transitions automatiques des statuts expirés :
    // en-attente expiré → abandonne (personne non présentée)
    // confirmee expirée → terminee (créneau passé)
    static async autoUpdateExpiredStatuses() {
        const sql = `
            UPDATE reservations
            SET statut = CASE
                WHEN statut = 'en-attente' THEN 'abandonne'
                WHEN statut = 'confirmee'  THEN 'terminee'
                ELSE statut
            END
            WHERE statut IN ('en-attente', 'confirmee')
              AND (date < CURDATE() OR (date = CURDATE() AND heure_fin < CURTIME()))
        `;
        await db.execute(sql);
    }

    // Réservations à venir de l'utilisateur (date >= aujourd'hui, statut actif)
    static async getUpcoming(userId) {
        const sql = `
            SELECT r.*, s.nom as salle_nom
            FROM reservations r
            JOIN salles s ON r.salle_id = s.id
            WHERE r.utilisateur_id = ?
              AND r.date >= CURDATE()
              AND r.statut IN ('en-attente', 'confirmee')
            ORDER BY r.date ASC, r.heure_debut ASC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // Historique des réservations de l'utilisateur (annulé, terminé, abandonné)
    static async getHistory(userId) {
        const sql = `
            SELECT r.*, s.nom as salle_nom
            FROM reservations r
            JOIN salles s ON r.salle_id = s.id
            WHERE r.utilisateur_id = ?
              AND r.statut IN ('annulee', 'terminee', 'abandonne')
            ORDER BY r.date DESC, r.heure_debut DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // Réservations + annulations par mois pour une année donnée
    static async getMonthlyStats(userId, year) {
        const sql = `
            SELECT
                MONTH(date) AS mois,
                COUNT(*) AS reservations,
                SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) AS annulations
            FROM reservations
            WHERE utilisateur_id = ?
              AND YEAR(date) = ?
            GROUP BY MONTH(date)
            ORDER BY MONTH(date)
        `;
        const [rows] = await db.execute(sql, [userId, year]);
        return rows;
    }

    // Nombre de réservations non annulées par type (heure, demi-journee, journee)
    static async getTypeUsage(userId) {
        const sql = `
            SELECT type_reservation, COUNT(*) AS total
            FROM reservations
            WHERE utilisateur_id = ?
              AND statut != 'annulee'
            GROUP BY type_reservation
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    // Total d'heures de réunion pour le mois/année courants (confirmee + terminee)
    static async getMonthlyHours(userId, month, year) {
        const sql = `
            SELECT COALESCE(
                SUM(TIME_TO_SEC(TIMEDIFF(heure_fin, heure_debut)) / 3600),
                0
            ) AS total_heures
            FROM reservations
            WHERE utilisateur_id = ?
              AND MONTH(date) = ?
              AND YEAR(date) = ?
              AND statut IN ('confirmee', 'terminee')
        `;
        const [rows] = await db.execute(sql, [userId, month, year]);
        return parseFloat(rows[0].total_heures) || 0;
    }

    // Taux de présence : (confirmee + terminee) / (confirmee + terminee + abandonne)
    static async getPresenceRate(userId) {
        const sql = `
            SELECT
                COUNT(CASE WHEN statut IN ('confirmee', 'terminee') THEN 1 END) AS presences,
                COUNT(CASE WHEN statut IN ('confirmee', 'terminee', 'abandonne') THEN 1 END) AS total
            FROM reservations
            WHERE utilisateur_id = ?
        `;
        const [rows] = await db.execute(sql, [userId]);
        const { presences, total } = rows[0];
        if (total === 0) return 100;
        return Math.round((presences / total) * 100);
    }
}

module.exports = Reservation;
