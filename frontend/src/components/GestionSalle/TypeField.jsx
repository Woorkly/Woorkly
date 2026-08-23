function TypeField({
  roomTypes,
  loadingTypes,
  selectedTypeId,
  onTypeChange,
  onDeleteType,
  deletingType,
  newTypeName,
  onNewTypeNameChange,
  onCreateType,
  addingType,
  typeCreateError,
  typeDeleteError,
  target = "create",
}) {
  return (
    <>
      <label>
        Type de salle
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            required
            value={selectedTypeId}
            onChange={(e) => onTypeChange(e.target.value)}
            disabled={loadingTypes}
            style={{ flex: 1 }}
          >
            <option value="">
              {loadingTypes ? "Chargement des types..." : "Choisir un type"}
            </option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>
          <button
            className="ud-btn-danger"
            type="button"
            onClick={() => onDeleteType(selectedTypeId, target)}
            disabled={!selectedTypeId || deletingType}
            style={{ whiteSpace: "nowrap" }}
          >
            {deletingType ? "..." : "Supprimer"}
          </button>
        </div>
      </label>

      {typeCreateError && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>
          {typeCreateError}
        </p>
      )}

      {typeDeleteError && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: "-0.5rem" }}>
          {typeDeleteError}
        </p>
      )}

      <div className="room-form-wide room-equipment-field">
        <span>Ajouter un type de salle</span>
        <div className="room-equipment-create">
          <input
            value={newTypeName}
            onChange={(e) => onNewTypeNameChange(e.target.value)}
            placeholder="Nouveau type de salle"
          />
          <button
            className="btn-primary"
            type="button"
            onClick={() => onCreateType(newTypeName, target)}
            disabled={addingType}
          >
            {addingType ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>
    </>
  );
}

export default TypeField;
