const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { uploadFromBuffer } = require('../services/uploadService');

router.post('/', upload.single('image'), async (req, res) => {
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
