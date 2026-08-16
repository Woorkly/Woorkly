const Equipements = require("../models/Equipements");

// Récupérer tous les equipements
const getAllEquipements = async (req, res) => {
  try {
    const equipements = await Equipements.findAll();
    const validEquipements = equipements.filter(equipement => equipement.nom && equipement.nom.trim());
    res.status(200).json(validEquipements);
  } catch (error) {
    console.error("ERREUR SQL :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des equipements" });
  }
};

// Récupérer les détails d'un equipement
const getEquipementDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const equipement = await Equipements.findById(id);

    if (!equipement) {
      return res.status(404).json({ message: "Equipement introuvable" });
    }

    res.status(200).json(equipement);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des détails" });
  }
};

// créée un nouvel equipement
const createEquipement = async (req, res) => {
  try {
    const nom = req.body.nom?.trim();

    if (!nom) {
      return res.status(400).json({ message: "Le nom de l'equipement est obligatoire" });
    }

    if (nom.length > 100) {
      return res.status(400).json({ message: "Le nom de l'equipement ne peut pas dépasser 100 caractères" });
    }

    const existingEquipement = await Equipements.findByName(nom);
    if (existingEquipement) {
      return res
        .status(200)
        .json({ id: existingEquipement.id, nom: existingEquipement.nom, message: "Equipement deja existant" });
    }

    const equipementId = await Equipements.create({ nom });
    res
      .status(201)
      .json({ id: equipementId, nom, message: "Equipement cree avec succes" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'equipement" });
  }
};

// modification d'un equipement
const updateEquipement = async (req, res) => {
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

    if (updates.nom) {
      const nom = updates.nom.trim();
      if (!nom) {
        return res.status(400).json({ message: "Le nom de l'equipement ne peut pas être vide" });
      }
      if (nom.length > 100) {
        return res.status(400).json({ message: "Le nom de l'equipement ne peut pas dépasser 100 caractères" });
      }
      updates.nom = nom;
    }

    await Equipements.update(id, updates);
    res.status(200).json({ message: "Equipement mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'equipement" });
  }
};

// suppression d'un equipement
const deleteEquipement = async (req, res) => {
  try {
    const { id } = req.params;
    await Equipements.delete(id);
    res.status(200).json({ message: "Equipement supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'equipement" });
  }
};

module.exports = {
  getAllEquipements,
  getEquipementDetails,
  createEquipement,
  updateEquipement,
  deleteEquipement,
};
