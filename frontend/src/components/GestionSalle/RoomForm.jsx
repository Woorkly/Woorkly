import TypeField from "./TypeField";
import EquipmentField from "./EquipmentField";
import uploadService from "../../services/uploadService";

const imageIcons = {
  hub: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
      <circle cx="6" cy="6" r="0.5" fill="#1A56A0" />
    </svg>
  ),
  boardroom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M6 7V5M12 7V4M18 7V5M6 17v2M18 17v2" />
    </svg>
  ),
};

function RoomForm({
  title,
  subtitle,
  formData,
  onFormChange,
  roomTypes,
  loadingTypes,
  equipments,
  loadingEquipments,
  onSubmit,
  onClose,
  loading,
  error,
  // Type handling
  newTypeName,
  onNewTypeNameChange,
  onCreateType,
  onDeleteType,
  addingType,
  deletingType,
  typeCreateError,
  typeDeleteError,
  // Equipment handling
  newEquipmentName,
  onNewEquipmentNameChange,
  onCreateEquipment,
  onEquipmentToggle,
  addingEquipment,
  equipmentCreateError,
  // Upload handling
  onMainImageUpload,
  onGalleryUpload,
  onRemovePhoto,
  uploading,
  mode = "create",
}) {
  const getRoomImageSrc = (imageName) => {
    const value = (imageName || "").trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `/images/${value}`;
  };

  return (
    <div className="ud-overlay" onClick={onClose}>
      <div
        className="ud-panel room-form-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="ud-close"
          type="button"
          onClick={onClose}
          disabled={loading}
        >
          x
        </button>

        <div>
          <h3 className="ud-name">{title}</h3>
          <p className="ud-email">{subtitle}</p>
        </div>

        <form className="room-form" onSubmit={onSubmit}>
          {error && <p className="room-form-error">{error}</p>}

          {/* Nom */}
          <label>
            Nom
            <input
              required
              value={formData.nom}
              onChange={(e) => onFormChange("nom", e.target.value)}
              placeholder="Nom de la salle"
            />
          </label>

          {/* Statut */}
          <label>
            Statut
            <select
              value={formData.statut}
              onChange={(e) => onFormChange("statut", e.target.value)}
            >
              <option value="disponible">Disponible</option>
              <option value="reservee">Reservee</option>
              <option value="hors-service">Hors service</option>
            </select>
          </label>

          {/* Adresse */}
          <label>
            Adresse
            <input
              required
              value={formData.adresse}
              onChange={(e) => onFormChange("adresse", e.target.value)}
              placeholder="Adresse"
            />
          </label>

          {/* Code postal */}
          <label>
            Code postal
            <input
              value={formData.code_postal}
              onChange={(e) => onFormChange("code_postal", e.target.value)}
              placeholder="13001"
            />
          </label>

          {/* Ville */}
          <label>
            Ville
            <input
              value={formData.ville}
              onChange={(e) => onFormChange("ville", e.target.value)}
              placeholder="Marseille"
            />
          </label>

          {/* Latitude */}
          <label>
            Latitude
            <input
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => onFormChange("latitude", e.target.value)}
              placeholder="43.2965"
            />
          </label>

          {/* Longitude */}
          <label>
            Longitude
            <input
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => onFormChange("longitude", e.target.value)}
              placeholder="5.3698"
            />
          </label>

          {/* Capacité */}
          <label>
            Capacité
            <input
              type="number"
              min="1"
              value={formData.capacite}
              onChange={(e) => onFormChange("capacite", e.target.value)}
              placeholder="12"
            />
          </label>

          {/* Prix heure */}
          <label>
            Prix heure
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.prix_heure}
              onChange={(e) => onFormChange("prix_heure", e.target.value)}
              placeholder="25.00"
            />
          </label>

          {/* Prix demi-journée */}
          <label>
            Prix demi-journée
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.prix_demi_journee}
              onChange={(e) => onFormChange("prix_demi_journee", e.target.value)}
              placeholder="90.00"
            />
          </label>

          {/* Prix journée */}
          <label>
            Prix journée
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.prix_journee}
              onChange={(e) => onFormChange("prix_journee", e.target.value)}
              placeholder="160.00"
            />
          </label>

          {/* Description */}
          <label>
            Description
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              placeholder="Description de la salle"
              rows="4"
            />
          </label>

          {/* Image principale */}
          <div className="room-form-wide">
            <span>Image principale</span>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div>
                <label htmlFor={`main-image-${mode}`} style={{ cursor: "pointer" }}>
                  <input
                    id={`main-image-${mode}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onMainImageUpload(e, mode)}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  <span style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--blue)", color: "white", borderRadius: "4px", cursor: "pointer" }}>
                    {uploading ? "Upload..." : "Choisir une image"}
                  </span>
                </label>
              </div>
              {formData.image_principale && (
                <div style={{ width: "100px", height: "100px", borderRadius: "4px", overflow: "hidden", background: "var(--bg-secondary)" }}>
                  <img src={getRoomImageSrc(formData.image_principale)} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>

          {/* Galerie */}
          <div className="room-form-wide">
            <span>Galerie (photos supplémentaires)</span>
            <label htmlFor={`gallery-${mode}`} style={{ cursor: "pointer" }}>
              <input
                id={`gallery-${mode}`}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onGalleryUpload(e, mode)}
                disabled={uploading}
                style={{ display: "none" }}
              />
              <span style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--blue)", color: "white", borderRadius: "4px", cursor: "pointer" }}>
                {uploading ? "Upload..." : "Ajouter des photos"}
              </span>
            </label>

            {formData.photos && formData.photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginTop: "1rem" }}>
                {formData.photos.map((photo, idx) => (
                  <div key={idx} style={{ position: "relative", borderRadius: "4px", overflow: "hidden", background: "var(--bg-secondary)" }}>
                    <img src={getRoomImageSrc(photo)} alt={`gallery-${idx}`} style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(mode, idx)}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type de salle */}
          <TypeField
            roomTypes={roomTypes}
            loadingTypes={loadingTypes}
            selectedTypeId={formData.type_id}
            onTypeChange={(val) => onFormChange("type_id", val)}
            onDeleteType={onDeleteType}
            deletingType={deletingType}
            newTypeName={newTypeName}
            onNewTypeNameChange={onNewTypeNameChange}
            onCreateType={onCreateType}
            addingType={addingType}
            typeCreateError={typeCreateError}
            typeDeleteError={typeDeleteError}
            target={mode}
          />

          {/* Équipements */}
          <EquipmentField
            equipments={equipments}
            loadingEquipments={loadingEquipments}
            selectedEquipmentIds={formData.equipement_ids}
            onEquipmentToggle={onEquipmentToggle}
            newEquipmentName={newEquipmentName}
            onNewEquipmentNameChange={onNewEquipmentNameChange}
            onCreateEquipment={onCreateEquipment}
            addingEquipment={addingEquipment}
            equipmentCreateError={equipmentCreateError}
            target={mode}
          />

          {/* Submit */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              className="ud-btn-secondary"
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Annuler
            </button>
            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RoomForm;
