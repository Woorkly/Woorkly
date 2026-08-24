const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { authRequired, requireRole } = require('../middlewares/auth');
const { uploadFromBuffer } = require('../services/uploadService');
const { verifyImageBinary, isValidImageUrl } = require('../utils/fileValidator');
const { uploadLimiter } = require('../middlewares/rateLimiter');

// Flux de sécurité pour les uploads d'images:
// 1. uploadLimiter — Rate limiting (max 10 uploads/heure par utilisateur)
// 2. authRequired — Authentification
// 3. requireRole('admin') — Vérification des droits (pour salles)
// 4. upload.single('image') — Multer vérifie: MIME type + extension
// 5. verifyImageBinary() — Vérification des magic bytes
// 6. uploadFromBuffer() — Upload Cloudinary + redimensionnement
// 7. isValidImageUrl() — Validation de l'URL retournée par Cloudinary
// 8. Stockage en BD avec validation stricte
const handleUpload = (folder, transformations) => async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu.' });
        }

        // Étape 1: Vérifier l'intégrité binaire du fichier (magic bytes)
        // Cela confirme que le fichier est vraiment une image, pas un fichier renommé
        const isValid = verifyImageBinary(req.file.buffer, req.file.mimetype);
        if (!isValid) {
            return res.status(400).json({ message: 'Fichier invalide ou corrompu. L\'en-tête binaire ne correspond pas au type déclaré.' });
        }

        // Étape 2: Upload vers Cloudinary avec transformations
        // Cloudinary: redimensionne, optimise, et retourne une URL HTTPS
        const result = await uploadFromBuffer(req.file.buffer, folder, transformations);

        // Étape 3: Valider que Cloudinary a retourné une URL sécurisée et valide
        // Sécurité: prévient l'injection d'URLs malveillantes si Cloudinary est compromis
        if (!result || !result.secure_url) {
            return res.status(500).json({ message: "Erreur: upload échoué ou URL sécurisée non disponible" });
        }

        if (!isValidImageUrl(result.secure_url)) {
            return res.status(500).json({ message: "Erreur: URL d'image invalide reçue de Cloudinary" });
        }

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        res.status(500).json({ message: "Erreur lors de l'upload de l'image." });
    }
};

// POST /api/upload/avatar — Avatar utilisateur
// Format: multipart/form-data avec champ 'image'
// Exemple client: const fd = new FormData(); fd.append('image', file); fetch('/upload/avatar', {method: 'POST', body: fd})
// Retourne: { url: "https://cloudinary.com/..." }
// Sécurité: rate limiting + redimensionnement pour éviter de charger d'énormes images
// Les avatars sont redimensionnés à 400x400px (optimal pour affichage)
router.post('/avatar', authRequired, uploadLimiter, upload.single('image'),
    handleUpload('woorkly/avatars', { width: 400, height: 400, crop: 'fill', quality: 'auto' }));

// POST /api/upload/room-image — Image principale de salle
// Format: multipart/form-data avec champ 'image' (admin seulement)
// Retourne: { url: "https://cloudinary.com/..." }
// Sécurité: rate limiting + admin + redimensionnement pour les performances
// Les images principales sont redimensionnées à 1200px max (pour affichage web)
router.post('/room-image', authRequired, requireRole('admin'), uploadLimiter, upload.single('image'),
    handleUpload('woorkly/salles/images', { width: 1200, height: 800, crop: 'fill', quality: 'auto' }));

// POST /api/upload/room-gallery — Galerie de salle
// Format: multipart/form-data avec champ 'image' (admin seulement)
// Retourne: { url: "https://cloudinary.com/..." }
// Sécurité: rate limiting + admin + redimensionnement
// Les images galerie sont redimensionnées à 600px max (pour galerie)
router.post('/room-gallery', authRequired, requireRole('admin'), uploadLimiter, upload.single('image'),
    handleUpload('woorkly/salles/gallery', { width: 600, height: 600, crop: 'fill', quality: 'auto' }));

module.exports = router;
