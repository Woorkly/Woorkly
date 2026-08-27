const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Fonction pour uploader un buffer vers Cloudinary avec transformations optionnelles
// transformations: { width, height, crop, quality, ... } appliquées à Cloudinary
const uploadFromBuffer = (buffer, folder = 'woorkly', transformations = {}) => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: folder,
            // Optimisation: Cloudinary applique automatiquement les transformations
            // Cela réduit la bande passante en envoyant des images redimensionnées
            ...transformations,
        };
        //   Création d'un stream pour uploader le buffer
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = { uploadFromBuffer };