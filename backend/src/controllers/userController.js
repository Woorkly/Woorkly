const User = require('../models/User');
const Reservation = require('../models/Reservation');
const { uploadFromBuffer } = require('../services/uploadService');

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

        res.status(200).json(User.sanitize(user));
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

// modification du profil personnel (nom, email, avatar, password)
const patchProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        // Vérifier que l'utilisateur modifie son propre profil
        if (parseInt(id) !== parseInt(userId)) {
            return res.status(403).json({ message: "Vous ne pouvez modifier que votre propre profil" });
        }

        // Filtrer les champs autorisés (bloquer le rôle)
        const allowedFields = ['nom', 'email', 'password', 'avatar_url'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Gestion de l'upload de l'avatar s'il y a un fichier
        if (req.file) {
            const result = await uploadFromBuffer(req.file.buffer, 'woorkly/avatars');
            if (result && (result.secure_url || result.url)) {
                updates.avatar_url = result.secure_url || result.url;
            }
        }

        await User.patch(id, updates);

        // Re-émettre le JWT si des champs de profil changent
        if (updates.nom !== undefined || updates.email !== undefined || updates.avatar_url !== undefined) {
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
                    message: "Profil mis à jour avec succès",
                    user: { userId: updatedUser.id, nom: updatedUser.nom, email: updatedUser.email, role: updatedUser.role, avatar_url: updatedUser.avatar_url },
                });
            }
        }

        res.status(200).json({ message: "Profil mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
};

// modification du rôle d'un utilisateur (admin seulement)
const patchRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Filtrer pour accepter seulement le champ 'role'
        if (!role) {
            return res.status(400).json({ message: "Le rôle est obligatoire" });
        }

        const updates = { role };

        await User.patch(id, updates);

        const updatedUser = await User.findById(id);
        if (updatedUser) {
            res.status(200).json({
                message: "Rôle mis à jour avec succès",
                user: { userId: updatedUser.id, nom: updatedUser.nom, email: updatedUser.email, role: updatedUser.role }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du rôle" });
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
    patchProfile,
    patchRole,
    deleteUser
};
 
   

 