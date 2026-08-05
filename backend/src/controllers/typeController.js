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
        const nom = req.body.nom?.trim();

        if (!nom) {
            return res.status(400).json({ message: "Le nom du type est obligatoire" });
        }

        const existingType = await Types.findByName(nom);
        if (existingType) {
            return res
                .status(200)
                .json({ id: existingType.id, nom: existingType.nom, message: "Type deja existant" });
        }

        const typeId = await Types.create({ nom });
        res.status(201).json({ id: typeId, nom, message: "type créé avec succès" });
    } catch (error) {
        console.error("ERREUR SQL :", error);
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
        if (error.code === "ER_ROW_IS_REFERENCED_2" || error.errno === 1451) {
            return res.status(409).json({
                message: "Ce type est utilisé par une ou plusieurs salles, impossible de le supprimer",
            });
        }
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
 
   

 