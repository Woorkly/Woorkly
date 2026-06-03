const User = require('../models/User');

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
};

// Récupérer les détails d'un utilisateur
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails" });
    }
};

// créée un nouvel utilisateur
const createUser = async (req, res) => {
    try {
        const userId = await User.create(req.body);
        res.status(201).json({ id: userId, message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
};

// modification d'un utilisateur
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.update(id, req.body);
        res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};

// modification partielle d'un utilisateur (ex: rôle uniquement)
const patchUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.patch(id, req.body);
        res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};

// suppression d'un utilisateur
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
};


module.exports = {
    getAllUsers,
    getUserDetails,
    createUser,
    updateUser,
    patchUser,
    deleteUser
};
 
   

 