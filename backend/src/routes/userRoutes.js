const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');
const { createUserValidator, updateUserValidator, patchUserValidator } = require('../validators/userValidator');
const validate = require('../middlewares/validate');

// Route pour récupérer tous les utilisateurs
// URL : GET http://localhost:3000/api/users/
router.get('/', userController.getAllUsers);

// Route pour récupérer les détails d'un utilisateur
// URL : GET http://localhost:3000/api/users/1
router.get('/:id', userController.getUserDetails);

// Route pour créer un utilisateur
// URL : POST http://localhost:3000/api/users/
router.post('/', createUserValidator, validate, userController.createUser);

// Route pour modifier un utilisateur
// URL : PUT http://localhost:3000/api/users/1
router.put('/:id', updateUserValidator, validate, userController.updateUser);

// Route pour modification partielle (ex: rôle, avatar)
// URL : PATCH http://localhost:3000/api/users/1
router.patch('/:id', upload.single('avatar'), patchUserValidator, validate, userController.patchUser);

// Route pour supprimer un utilisateur
// URL : DELETE http://localhost:3000/api/users/1
router.delete('/:id', userController.deleteUser);

module.exports = router;