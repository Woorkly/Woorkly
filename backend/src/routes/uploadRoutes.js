const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { authRequired } = require('../middlewares/auth');
const { uploadFromBuffer } = require('../services/uploadService');
const { verifyImageBinary } = require('../utils/fileValidator');

const handleUpload = (folder) => async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu.' });
        }

        // Vérifier l'intégrité binaire du fichier
        const isValid = verifyImageBinary(req.file.buffer, req.file.mimetype);
        if (!isValid) {
            return res.status(400).json({ message: 'Fichier invalide ou corrompu. L\'en-tête binaire ne correspond pas au type déclaré.' });
        }

        const result = await uploadFromBuffer(req.file.buffer, folder);
        res.json({ url: result.secure_url || result.url });
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
    }
};

// POST /api/upload/avatar — Avatar utilisateur
router.post('/avatar', authRequired, upload.single('image'), handleUpload('woorkly/avatars'));

// POST /api/upload/room-image — Image principale de salle
router.post('/room-image', authRequired, upload.single('image'), handleUpload('woorkly/salles/images'));

// POST /api/upload/room-gallery — Galerie de salle
router.post('/room-gallery', authRequired, upload.single('image'), handleUpload('woorkly/salles/gallery'));

module.exports = router;
