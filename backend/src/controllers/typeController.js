const Types = require('../models/Types');

// Récupérer tous les types
const getAllTypes = async (req, res) => {
    try {
        const allTypes = await Types.findAll();
        res.status(200).json(allTypes);
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
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails" });
    }
};

// Créer un nouveau Type
const createType = async (req, res) => {
    try {
        const typeId = await Types.create(req.body);
        res.status(201).json({ id: typeId, message: "type créé avec succès" });
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la création du type" });
    }
};

// modification d'un Type
const updateType = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['nom'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Aucun champ valide à mettre à jour" });
        }

        await Types.update(id, updates);
        res.status(200).json({ message: "type mis à jour avec succès" });
    } catch (error) {
        console.error("ERREUR SQL :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du type" });
    }
};

// Supprimer un type
const deleteType = async (req, res) => {
    try {
        const { id } = req.params;
        await Types.delete(id);
        res.status(200).json({ message: "type supprimé avec succès" });
    } catch (error) {
        console.error("ERREUR SQL :", error);
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
 
   

 