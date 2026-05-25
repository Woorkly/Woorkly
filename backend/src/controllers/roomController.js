const Room = require('../models/Room');

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
            equipements: equipments.map(e => e.nom)
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
        const { photos, ...roomData } = req.body; // On sépare les photos du reste des données

        const newRoomId = await Room.create(roomData, photos);
        res.status(201).json({ id: newRoomId, ...roomData, photos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de la salle" });
    }
};

module.exports = {
    getAllRooms,
    getAvailableRooms,
    getRoomDetails,
    createRoom
};