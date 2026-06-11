const multer = require('multer');

// Utilisation de la mémoire (RAM) pour stocker le fichier temporairement sous forme de Buffer
// Idéal pour Render car on n'écrit rien sur le disque dur éphémère
const storage = multer.memoryStorage();

// Filtre de sécurité pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seules les images sont autorisées.'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5 MB par fichier
});

module.exports = upload;