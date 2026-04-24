const Room = require('../models/Room');

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des salles" });
    }
};

module.exports = {
    getAllRooms
};