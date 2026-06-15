const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authRequired, requireRole } = require('../middlewares/auth');
const { createRoomValidator, updateRoomValidator } = require('../validators/roomValidator');
const validate = require('../middlewares/validate');

// GET /api/rooms/ (public)
// Liste toutes les salles avec filtres optionnels (ville, capacite, type, equipement)
router.get('/', roomController.getAllRooms);

// GET /api/rooms/available (public)
// Retourne les salles disponibles à une date donnée
router.get('/available', roomController.getAvailableRooms);

// GET /api/rooms/:id (public)
// Retourne le détail d'une salle avec photos et équipements
router.get('/:id', roomController.getRoomDetails);

// POST /api/rooms/ (admin only)
// Crée une salle avec géocodage automatique de l'adresse
router.post('/', authRequired, requireRole('admin'), createRoomValidator, validate, roomController.createRoom);

// PUT /api/rooms/:id (admin only)
// Met à jour une salle (re-géocode si l'adresse change)
router.put('/:id', authRequired, requireRole('admin'), updateRoomValidator, validate, roomController.updateRoom);

// DELETE /api/rooms/:id (admin only)
// Supprime une salle et ses photos/équipements associés
router.delete('/:id', authRequired, requireRole('admin'), roomController.deleteRoom);

module.exports = router;
