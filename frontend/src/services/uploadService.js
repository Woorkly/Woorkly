import API from './api'

/**
 * Helper pour uploader une image via form-data multipart
 * Les routes d'upload requièrent du form-data, pas du JSON
 * @param {File} file - Le fichier image à uploader
 * @param {string} endpoint - L'endpoint d'upload (/upload/avatar, /upload/room-image, etc)
 * @returns {Promise<string>} L'URL HTTPS sécurisée retournée par Cloudinary
 */
const uploadImage = async (file, endpoint) => {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  const formData = new FormData();
  formData.append('image', file); // Clé: 'image' (correspond au multer.single('image'))

  const res = await API.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }, // Spécifie qu'on envoie du form-data
  });

  return res.data.url;
};

/**
 * Upload avatar utilisateur
 * Route: POST /upload/avatar
 * Accept: multipart/form-data avec champ 'image'
 */
const uploadAvatar = async (file) => {
  return uploadImage(file, '/upload/avatar');
};

/**
 * Upload image principale de salle
 * Route: POST /upload/room-image
 * Accept: multipart/form-data avec champ 'image'
 */
const uploadRoomImage = async (file) => {
  return uploadImage(file, '/upload/room-image');
};

/**
 * Upload image galerie de salle
 * Route: POST /upload/room-gallery
 * Accept: multipart/form-data avec champ 'image'
 */
const uploadRoomGallery = async (file) => {
  return uploadImage(file, '/upload/room-gallery');
};

export default { uploadAvatar, uploadRoomImage, uploadRoomGallery }
