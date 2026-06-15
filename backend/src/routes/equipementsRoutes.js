const express = require("express");
const router = express.Router();
const equipementController = require("../controllers/equipementController");
const { authRequired, requireRole } = require("../middlewares/auth");

// GET /api/equipements/ (public)
// Liste tous les équipements (utilisé pour les filtres de salles)
router.get("/", equipementController.getAllEquipements);

// GET /api/equipements/:id (public)
// Retourne le détail d'un équipement
router.get("/:id", equipementController.getEquipementDetails);

// POST /api/equipements/ (admin only)
// Crée un équipement (retourne 200 s'il existe déjà, 201 si nouveau)
router.post("/", authRequired, requireRole("admin"), equipementController.createEquipement);

// PUT /api/equipements/:id (admin only)
// Met à jour un équipement
router.put("/:id", authRequired, requireRole("admin"), equipementController.updateEquipement);

// DELETE /api/equipements/:id (admin only)
// Supprime un équipement
router.delete("/:id", authRequired, requireRole("admin"), equipementController.deleteEquipement);

module.exports = router;
