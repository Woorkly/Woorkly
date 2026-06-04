const Room = require('../models/Room');

const normalizeIds = (ids = []) => {
    const values = Array.isArray(ids) ? ids : [ids];
    return [...new Set(values.map((id) => Number(id)).filter(Boolean))];
};

// Récupérer toutes les salles
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll(req.query);
        res.status(200).json(rooms);
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des salles" });
    }
};

// Récupérer les salles disponibles
const getAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.getAvailable(req.query);
        res.status(200).json(rooms);
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des salles disponibles" });
    }
};

// Récupérer les détails d'une salle (avec sa galerie) - VERSION OPTIMISÉE (2 requêtes lancées en parallèle)
const getRoomDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. On récupère les infos de base
        const room = await Room.getById(id);

        if (!room) {
            return res.status(404).json({ message: "Salle introuvable" });
        }

        // 2. On récupère en parallèle les photos et équipements
        const [photos, equipments] = await Promise.all([
            Room.getPhotos(id),
            Room.getEquipments(id)
        ]);

        // 3. On fusionne tout dans un seul objet
        const fullRoomData = {
            ...room,
            galerie: photos.map(p => p.url), // On simplifie pour n'avoir qu'un tableau de strings
            equipements: equipments.map(e => e.nom),
            equipement_ids: equipments.map(e => e.id)
        };

        res.status(200).json(fullRoomData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails" });
    }
};
// Détail d'une salle avec sa galerie
// const getRoomDetails = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // On lance les deux requêtes
//         const room = await Room.getById(id);
        
//         if (!room) {
//             return res.status(404).json({ message: "Salle non trouvée" });
//         }

//         const photos = await Room.getPhotos(id);

//         // On fusionne les données : on ajoute la galerie dans l'objet room
//         res.status(200).json({
//             ...room,
//             galerie: photos
//         });

//     } catch (error) {
//         res.status(500).json({ message: "Erreur serveur" });
//     }
// };

// Création d'une salle (Admin)
const createRoom = async (req, res) => {
    try {
        const { photos, equipement_ids, ...roomData } = req.body; // On separe les photos/equipements du reste des donnees

        const equipmentIds = normalizeIds(equipement_ids);
        const newRoomId = await Room.create(roomData, photos, equipmentIds);
        res.status(201).json({ id: newRoomId, ...roomData, photos, equipement_ids: equipmentIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la salle" });
    }
};

const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipement_ids, ...roomData } = req.body;
        const equipmentIds = normalizeIds(equipement_ids);
        const affectedRows = await Room.update(id, roomData, equipmentIds);

        if (affectedRows === 0) {
            return res.status(404).json({ message: "Salle introuvable" });
        }

        res.status(200).json({ id: Number(id), ...roomData, equipement_ids: equipmentIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise a jour de la salle" });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Room.delete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Salle introuvable" });
        }

        res.status(200).json({ message: "Salle supprimee avec succes" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression de la salle" });
    }
};

module.exports = {
    getAllRooms,
    getAvailableRooms,
    getRoomDetails,
    createRoom,
    updateRoom,
    deleteRoom
};
