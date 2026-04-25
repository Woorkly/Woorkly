const Room = require('../models/Room');

// Récupérer toutes les salles
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des salles" });
    }
};

// Récupérer les détails d'une salle (avec sa galerie) - VERSION OPTIMISÉE (2 requêtes lancées en parallèle)
const getRoomDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // On lance les deux requêtes en PARALLÈLE
        const [room, photos] = await Promise.all([
            Room.getById(id),
            Room.getPhotos(id)
        ]);

        if (!room) {
            return res.status(404).json({ message: "Salle non trouvée" });
        }

        // On renvoie un objet propre au Front-end
        res.status(200).json({
            ...room,
            galerie: photos // Un beau tableau d'objets [{url: '...'}, {url: '...'}]
        });

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