const MAGIC_BYTES = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const verifyImageBinary = (buffer, mimetype) => {
    if (!buffer || buffer.length === 0) {
        return false;
    }

    const expectedBytes = MAGIC_BYTES[mimetype];
    if (!expectedBytes) {
        return false;
    }

    // Comparer les premiers bytes du buffer avec la signature attendue
    for (let i = 0; i < expectedBytes.length; i++) {
        if (buffer[i] !== expectedBytes[i]) {
            return false;
        }
    }

    // Vérification supplémentaire pour WebP
    if (mimetype === 'image/webp') {
        // WebP: RIFF....WEBP
        // Vérifier que "WEBP" apparaît aux positions 8-11
        if (buffer.length < 12) return false;
        const webpSignature = buffer.slice(8, 12).toString('ascii');
        if (webpSignature !== 'WEBP') {
            return false;
        }
    }

    return true;
};

// Valide qu'une URL est une URL HTTPS valide provenant d'une source de confiance (Cloudinary)
const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);

        // Vérifier que c'est HTTPS (sécurisé)
        if (urlObj.protocol !== 'https:') {
            return false;
        }

        // Vérifier que ça vient de Cloudinary (source de confiance pour les images)
        if (!urlObj.hostname.includes('cloudinary.com')) {
            return false;
        }

        return true;
    } catch (error) {
        // URL invalide
        return false;
    }
};

module.exports = { verifyImageBinary, isValidImageUrl };
