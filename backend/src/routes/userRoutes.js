const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');
const { authRequired, requireRole } = require('../middlewares/auth');
const { createUserValidator, updateUserValidator, patchUserValidator } = require('../validators/userValidator');
const validate = require('../middlewares/validate');

// GET /api/users/ (admin only)
// Liste tous les utilisateurs avec leur nombre de réservations
router.get('/', authRequired, requireRole('admin'), userController.getAllUsers);

// GET /api/users/:id (admin only)
// Retourne les détails d'un utilisateur
router.get('/:id', authRequired, requireRole('admin'), userController.getUserDetails);

// POST /api/users/ (public)
// Création de compte — accessible sans authentification (inscription)
router.post('/', createUserValidator, validate, userController.createUser);

// PUT /api/users/:id (admin only)
// Mise à jour complète d'un utilisateur
router.put('/:id', authRequired, requireRole('admin'), updateUserValidator, validate, userController.updateUser);

// PATCH /api/users/:id (connecté)
// Mise à jour partielle : profil personnel ou changement de rôle (admin)
router.patch('/:id', authRequired, upload.single('avatar'), patchUserValidator, validate, userController.patchUser);

// DELETE /api/users/:id (admin only)
// Suppression d'un utilisateur (bloquée s'il a des réservations à venir)
router.delete('/:id', authRequired, requireRole('admin'), userController.deleteUser);

module.exports = router;
