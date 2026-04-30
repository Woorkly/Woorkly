const express = require("express");
const router = express.Router();
const equipementController = require("../controllers/equipController");

// Route pour récupérer tous les equipements
// URL : GET http://localhost:3000/api/equipements/
router.get("/", equipementController.getAllEquipements);

// Route pour créer un equipement
// URL : POST http://localhost:3000/api/equipements/
router.post("/", equipementController.createEquipements);

// Route pour modifier un equipement
// URL : PUT http://localhost:3000/api/equipements/1
router.put("/:id", equipementController.updateEquipements);

// Route pour supprimer un equipement
// URL : DELETE http://localhost:3000/api/equipements/1
router.delete("/:id", equipementController.deleteEquipements);

module.exports = router;
