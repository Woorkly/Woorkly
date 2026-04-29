const Room = require('../models/Room');

// Récupérer toutes les salles
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des salles" });
    }
};

// Récupérer les détails d'une salle (avec sa galerie) - VERSION OPTIMISÉE (2 requêtes lancées en parallèle)
exports.getRoomDetails = async (req, res) => {
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

module.exports = {
    getAllRooms,
    getRoomDetails
};