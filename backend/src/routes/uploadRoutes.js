const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { authRequired } = require('../middlewares/auth');
const { uploadFromBuffer } = require('../services/uploadService');

// POST /api/upload (connecté)
// Upload une image vers Cloudinary — utilisé par les admins (photos de salles)
// et les utilisateurs (avatar). Retourne l'URL Cloudinary.
router.post('/', authRequired, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu.' });
        }
        const result = await uploadFromBuffer(req.file.buffer, 'woorkly/salles');
        res.json({ url: result.secure_url || result.url });
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
    }
});

module.exports = router;
