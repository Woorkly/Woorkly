const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { authRequired, requireRole } = require('../middlewares/auth');

// GET /api/types/ (public)
// Liste tous les types de salles (utilisé pour les filtres et formulaires)
router.get('/', typeController.getAllTypes);

// GET /api/types/:id (public)
// Retourne le détail d'un type
router.get('/:id', typeController.getTypesDetails);

// POST /api/types/ (admin only)
// Crée un type de salle
router.post('/', authRequired, requireRole('admin'), typeController.createType);

// PUT /api/types/:id (admin only)
// Met à jour un type de salle
router.put('/:id', authRequired, requireRole('admin'), typeController.updateType);

// DELETE /api/types/:id (admin only)
// Supprime un type de salle
router.delete('/:id', authRequired, requireRole('admin'), typeController.deleteType);

module.exports = router;
