const multer = require('multer');
const path = require('path');

// Utilisation de la mémoire (RAM) pour stocker le fichier temporairement sous forme de Buffer
// Idéal pour Render car on n'écrit rien sur le disque dur éphémère
const storage = multer.memoryStorage();

// Map des extensions autorisées par MIME type
// Sécurité: empêche quelqu'un de renommer un .exe en .jpg
const ALLOWED_EXTENSIONS = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
};

// Filtre de sécurité pour n'accepter que les images valides
const fileFilter = (req, file, cb) => {
    // Vérification 1: le MIME type doit être une image
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Type de fichier non supporté. Seules les images sont autorisées.'), false);
    }

    // Vérification 2: vérifier que l'extension match le MIME type
    // Prévient quelqu'un de renommer un fichier malveillant en .jpg
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED_EXTENSIONS[file.mimetype];

    if (!allowedExts || !allowedExts.includes(ext)) {
        return cb(new Error(`Extension invalide pour le type ${file.mimetype}. Extensions autorisées: ${allowedExts?.join(', ') || 'aucune'}`), false);
    }

    cb(null, true);
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5 MB par fichier
});

module.exports = upload;