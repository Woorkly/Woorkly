const User = require('../models/User');
const Reservation = require('../models/Reservation');

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

// modification partielle d'un utilisateur (ex: rôle uniquement, ou profil personnel)
const patchUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.patch(id, req.body);

        // Re-émettre le JWT si des champs de profil changent (nom/email)
        if (req.body.nom !== undefined || req.body.email !== undefined) {
            const updatedUser = await User.findById(id);
            if (updatedUser) {
                const authService = require('../services/authService');
                const token = authService.generateToken(updatedUser);
                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/',
                });
                return res.status(200).json({
                    message: "Utilisateur mis à jour avec succès",
                    user: { userId: updatedUser.id, nom: updatedUser.nom, email: updatedUser.email, role: updatedUser.role },
                });
            }
        }

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

        const upcomingCount = await Reservation.countUpcoming(id);
        if (upcomingCount > 0) {
            return res.status(409).json({
                message: `Impossible de supprimer : cet utilisateur a ${upcomingCount} réservation(s) à venir.`,
                upcomingCount
            });
        }

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
 
   

 