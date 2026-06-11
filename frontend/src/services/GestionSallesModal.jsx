import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/roomService';
import api from '../../services/api'; // On importe api pour faire l'upload

// Supposons que les props `salle` (pour l'édition) et `onClose`, `onSave` sont passées.
const GestionSallesModal = ({ salle, onClose, onSave }) => {
  const [roomData, setRoomData] = useState({
    nom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    capacite: 1,
    description: '',
    prix_heure: 0,
    prix_demi_journee: 0,
    prix_journee: 0,
    type_id: 1,
    statut: 'disponible',
    image_principale: '',
    photos: [], // Pour la galerie
    equipement_ids: [],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // État pour bloquer pendant l'upload

  const isEditing = salle && salle.id;

  useEffect(() => {
    if (isEditing) {
      // Si on édite, on pré-remplit le formulaire.
      // `salle.galerie` vient de getRoomDetails et est un tableau d'URLs.
      // `salle.equipement_ids` est un tableau d'IDs.
      setRoomData({
        nom: salle.nom || '',
        adresse: salle.adresse || '',
        code_postal: salle.code_postal || '',
        ville: salle.ville || '',
        capacite: salle.capacite || 1,
        description: salle.description || '',
        prix_heure: salle.prix_heure || 0,
        prix_demi_journee: salle.prix_demi_journee || 0,
        prix_journee: salle.prix_journee || 0,
        type_id: salle.type_id || 1,
        statut: salle.statut || 'disponible',
        image_principale: salle.image_principale || '',
        photos: salle.galerie || [], // Le backend renvoie `galerie` dans getRoomDetails
        equipement_ids: salle.equipement_ids || [],
      });
    }
  }, [salle, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({ ...prev, [name]: value }));
  };

  // --- Gestion de la galerie de photos ---
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // Remplace 'image' par le nom du champ de ton backend Multer

    try {
      setIsUploading(true);
      // Remplace '/upload' par ta vraie route de téléchargement Cloudinary
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRoomData(prev => ({ ...prev, image_principale: res.data.url }));
    } catch (err) {
      console.error("Erreur upload image", err);
      setError("Erreur lors de l'upload de l'image principale.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file); // Même champ ici
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(res.data.url);
      }
      setRoomData(prev => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
    } catch (err) {
      console.error("Erreur upload galerie", err);
      setError("Erreur lors de l'upload de la galerie.");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhotoField = (index) => {
    const newPhotos = roomData.photos.filter((_, i) => i !== index);
    setRoomData(prev => ({ ...prev, photos: newPhotos }));
  };
  // --- Fin de la gestion de la galerie ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Filtrer les URLs de photos vides avant l'envoi
    const payload = {
      ...roomData,
      photos: roomData.photos.filter(url => url && url.trim() !== ''),
    };

    try {
      let response;
      if (isEditing) {
        response = await roomService.updateRoom(salle.id, payload);
      } else {
        response = await roomService.createRoom(payload);
      }
      onSave(response.data); // Appeler la fonction de callback avec la salle sauvegardée
      onClose(); // Fermer la modale
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal"> {/* Appliquez ici le style de votre modale */}
      <div className="modal-content">
        <h2>{isEditing ? 'Modifier la salle' : 'Ajouter une salle'}</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Champs de base de la salle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Nom de la salle</label>
              <input type="text" name="nom" value={roomData.nom} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Capacité</label>
              <input type="number" name="capacite" value={roomData.capacite} onChange={handleChange} min="1" required style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Adresse</label>
            <input type="text" name="adresse" value={roomData.adresse} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Code Postal</label>
              <input type="text" name="code_postal" value={roomData.code_postal} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Ville</label>
              <input type="text" name="ville" value={roomData.ville} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Description</label>
            <textarea name="description" value={roomData.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '8px' }}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Prix / Heure</label>
              <input type="number" name="prix_heure" value={roomData.prix_heure} onChange={handleChange} min="0" step="0.01" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Prix / Demi-journée</label>
              <input type="number" name="prix_demi_journee" value={roomData.prix_demi_journee} onChange={handleChange} min="0" step="0.01" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Prix / Journée</label>
              <input type="number" name="prix_journee" value={roomData.prix_journee} onChange={handleChange} min="0" step="0.01" style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Statut</label>
            <select name="statut" value={roomData.statut} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              <option value="disponible">Disponible</option>
              <option value="indisponible">Indisponible</option>
            </select>
          </div>

          {/* Champ pour l'image principale */}
          <div>
            <label htmlFor="image_principale" style={{ display: 'block', fontWeight: 'bold' }}>Image principale</label>
            <input
              type="file"
              id="image_principale"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={isUploading}
            />
            {roomData.image_principale && (
              <div style={{ marginTop: '10px' }}>
                <img src={roomData.image_principale} alt="Principale" style={{ width: '150px', borderRadius: '8px' }} />
                <button type="button" onClick={() => setRoomData(prev => ({ ...prev, image_principale: '' }))}>
                  Retirer
                </button>
              </div>
            )}
          </div>

          {/* Champs pour la galerie de photos */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Galerie de photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryUpload}
              disabled={isUploading}
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {roomData.photos.map((photoUrl, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={photoUrl} alt={`Galerie ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button 
                    type="button" 
                    onClick={() => removePhotoField(index)}
                    style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer', width: '20px', height: '20px', borderRadius: '50%' }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} disabled={isLoading}>
              Annuler
            </button>
            <button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GestionSallesModal;