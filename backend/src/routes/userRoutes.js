const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');
const { authRequired, requireRole } = require('../middlewares/auth');
const { createUserValidator, patchProfileValidator, patchRoleValidator } = require('../validators/userValidator');
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

// PATCH /api/users/:id/profile (connecté)
// Modification du profil personnel (nom, email, avatar, password) — chaque utilisateur ne peut modifier que le sien
router.patch('/:id/profile', authRequired, upload.single('avatar'), patchProfileValidator, validate, userController.patchProfile);

// PATCH /api/users/:id/role (admin only)
// Modification du rôle d'un utilisateur
router.patch('/:id/role', authRequired, requireRole('admin'), patchRoleValidator, validate, userController.patchRole);

// DELETE /api/users/:id (admin only)
// Suppression d'un utilisateur (bloquée s'il a des réservations à venir)
router.delete('/:id', authRequired, requireRole('admin'), userController.deleteUser);

module.exports = router;
