import TypeField from "./TypeField";
import EquipmentField from "./EquipmentField";

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
  editingRoom = null,
}) {
  const getRoomImageSrc = (imageName) => {
    const value = (imageName || "").trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `/images/${value}`;
  };

  const boardroomIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="#1A56A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M6 7V5M12 7V4M18 7V5M6 17v2M18 17v2" />
    </svg>
  );

  const getLocation = (room) =>
    [room?.adresse, room?.code_postal, room?.ville].filter(Boolean).join(", ") || "Non renseigné";

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

        {mode === "edit" && editingRoom ? (
          <div className="room-detail-admin-head">
            <div className="room-detail-admin-thumb">
              {getRoomImageSrc(editingRoom.image_principale) ? (
                <img src={getRoomImageSrc(editingRoom.image_principale)} alt={editingRoom.nom} />
              ) : (
                boardroomIcon
              )}
            </div>
            <div>
              <h3 className="ud-name">{editingRoom.nom}</h3>
              <p className="ud-email">{getLocation(editingRoom)}</p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="ud-name">{title}</h3>
            <p className="ud-email">{subtitle}</p>
          </div>
        )}

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

          {/* Image principale */}
          <div className="room-form-wide room-equipment-field">
            <span>Image principale</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onMainImageUpload(e, mode)}
              disabled={uploading}
            />
            {uploading && <p className="ud-empty">Upload en cours...</p>}
            {formData.image_principale && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={getRoomImageSrc(formData.image_principale)}
                  alt="Image principale"
                  style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                />
                <button
                  type="button"
                  className="ud-btn-ghost"
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                  onClick={() => onFormChange("image_principale", "")}
                  disabled={uploading}
                >
                  Retirer
                </button>
              </div>
            )}
          </div>

          {/* Galerie de photos */}
          <div className="room-form-wide room-equipment-field">
            <span>Galerie de photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onGalleryUpload(e, mode)}
              disabled={uploading}
            />
            {formData.photos.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {formData.photos.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={getRoomImageSrc(url)}
                      alt={`Photo ${index + 1}`}
                      style={{ width: "70px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                    />
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(index)}
                      disabled={uploading}
                      style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--red, #e53e3e)", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", lineHeight: "18px", padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <label className="room-form-wide">
            Description
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              placeholder="Description de la salle"
              rows="4"
            />
          </label>

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
