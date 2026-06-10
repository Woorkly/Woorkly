const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Fonction pour uploader un buffer (binaire) vers Cloudinary
const uploadFromBuffer = (buffer, folder = 'woorkly') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder }, // Vous pouvez organiser par dossier : 'woorkly/avatars', 'woorkly/salles'
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = { uploadFromBuffer };