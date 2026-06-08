const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');



// Route pour récupérer tous les types
// URL : GET http://localhost:3000/api/types/
router.get('/', typeController.getAllTypes);

// Route pour récupérer les détails d'un type
// URL : GET http://localhost:3000/api/types/1
router.get('/:id', typeController.getTypesDetails);

// Route pour créer un type
// URL : POST http://localhost:3000/api/types/
router.post('/', typeController.createType);

// Route pour modifier un type
// URL : PUT http://localhost:3000/api/types/1
router.put('/:id', typeController.updateType);

// Route pour supprimer un type
// URL : DELETE http://localhost:3000/api/types/1
router.delete('/:id', typeController.deleteType);

module.exports = router;