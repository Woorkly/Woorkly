const Types = require('../models/Types');

// Récupérer tous les types
const getAllTypes = async (req, res) => {
    try {
        const types = await Types.findAll();
        res.status(200).json(types);
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des types" });
    }
};

// Récupérer les détails d'un type
const getTypesDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await Types.findById(id);

        if (!type) {
            return res.status(404).json({ message: "type introuvable" });
        }

        res.status(200).json(type);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails" });
    }
};

// créée un nouvel Type
const createType = async (req, res) => {
    try {
        const typeId = await Types.create(req.body);
        res.status(201).json({ id: typeId, message: "type créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création du type" });
    }
};

// modification d'un Type
const updateType = async (req, res) => {
    try {
        const { id } = req.params;
        await Types.update(id, req.body);
        res.status(200).json({ message: "type mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du type" });
    }
};

// suppression d'un Type
const deleteType = async (req, res) => {
    try {
        const { id } = req.params;
        await Types.delete(id);
        res.status(200).json({ message: "type supprimé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la suppression du Type" });
    }
};


module.exports = {
    getAllTypes,
    getTypesDetails,
    createType,
    updateType,
    deleteType
};
 
   

 