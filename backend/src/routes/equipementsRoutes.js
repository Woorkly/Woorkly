const express = require("express");
const router = express.Router();
const equipementController = require("../controllers/equipementController");

// Route pour récupérer tous les equipements
// URL : GET http://localhost:3000/api/equipements/
router.get("/", equipementController.getAllEquipements);

// Route pour récupérer le detaille dun equipement
// URL : GET http://localhost:3000/api/equipements/1
router.get("/:id", equipementController.getEquipementDetails);

// Route pour créer un equipement
// URL : POST http://localhost:3000/api/equipements/
router.post("/", equipementController.createEquipement);

// Route pour modifier un equipement
// URL : PUT http://localhost:3000/api/equipements/1
router.put("/:id", equipementController.updateEquipement);

// Route pour supprimer un equipement
// URL : DELETE http://localhost:3000/api/equipements/1
router.delete("/:id", equipementController.deleteEquipement);

module.exports = router;
