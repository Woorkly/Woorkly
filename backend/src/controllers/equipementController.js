const Equipements = require("../models/Equipements");

// Récupérer tous les equipements
const getAllEquipements = async (req, res) => {
  try {
    const equipements = await Equipements.findAll();
    res.status(200).json(equipements);
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
    await Equipements.update(id, req.body);
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
