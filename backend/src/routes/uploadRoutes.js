const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { authRequired, requireRole } = require('../middlewares/auth');
const { uploadFromBuffer } = require('../services/uploadService');
const { verifyImageBinary } = require('../utils/fileValidator');
const uploadLimiter = require('../middlewares/uploadRateLimit');

const handleUpload = (folder, transformations) => async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu.' });
        }

        // Vérifier l'intégrité binaire du fichier (magic bytes)
        const isValid = verifyImageBinary(req.file.buffer, req.file.mimetype);
        if (!isValid) {
            return res.status(400).json({ message: 'Fichier invalide ou corrompu. L\'en-tête binaire ne correspond pas au type déclaré.' });
        }

        // Upload vers Cloudinary avec transformations optionnelles
        // (ex: redimensionnement, optimisation)
        const result = await uploadFromBuffer(req.file.buffer, folder, transformations);
        res.json({ url: result.secure_url || result.url });
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
    }
};

// POST /api/upload/avatar — Avatar utilisateur
// Sécurité: rate limiting + redimensionnement pour éviter de charger d'énormes images
// Les avatars sont redimensionnés à 400x400px (optimal pour affichage)
router.post('/avatar', authRequired, uploadLimiter, upload.single('image'),
    handleUpload('woorkly/avatars', { width: 400, height: 400, crop: 'fill', quality: 'auto' }));

// POST /api/upload/room-image — Image principale de salle
// Sécurité: rate limiting + admin + redimensionnement pour les performances
// Les images principales sont redimensionnées à 1200px max (pour affichage web)
router.post('/room-image', authRequired, requireRole('admin'), uploadLimiter, upload.single('image'),
    handleUpload('woorkly/salles/images', { width: 1200, height: 800, crop: 'fill', quality: 'auto' }));

// POST /api/upload/room-gallery — Galerie de salle
// Sécurité: rate limiting + admin + redimensionnement
// Les images galerie sont redimensionnées à 600px max (pour galerie)
router.post('/room-gallery', authRequired, requireRole('admin'), uploadLimiter, upload.single('image'),
    handleUpload('woorkly/salles/gallery', { width: 600, height: 600, crop: 'fill', quality: 'auto' }));

module.exports = router;
