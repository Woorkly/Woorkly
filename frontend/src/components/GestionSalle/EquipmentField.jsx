function EquipmentField({
  equipments,
  loadingEquipments,
  selectedEquipmentIds,
  onEquipmentToggle,
  newEquipmentName,
  onNewEquipmentNameChange,
  onCreateEquipment,
  addingEquipment,
  equipmentCreateError,
  target = "create",
}) {
  return (
    <>
      <div className="room-form-wide room-equipment-field">
        <span>Equipements</span>
        <div className="room-equipment-list">
          {loadingEquipments && (
            <p className="ud-empty">Chargement des equipements...</p>
          )}

          {!loadingEquipments && equipments.length === 0 && (
            <p className="ud-empty">Aucun equipement disponible.</p>
          )}

          {!loadingEquipments &&
            equipments.map((equipment) => (
              <label key={equipment.id} className="room-equipment-item">
                <input
                  type="checkbox"
                  checked={selectedEquipmentIds.includes(String(equipment.id))}
                  onChange={() => onEquipmentToggle(equipment.id)}
                />
                <span>{equipment.nom}</span>
              </label>
            ))}
        </div>
      </div>

      {equipmentCreateError && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>
          {equipmentCreateError}
        </p>
      )}

      <div className="room-form-wide room-equipment-field">
        <span>Ajouter un equipement</span>
        <div className="room-equipment-create">
          <input
            value={newEquipmentName}
            onChange={(e) => onNewEquipmentNameChange(e.target.value)}
            placeholder="Nouvel equipement"
          />
          <button
            className="btn-primary"
            type="button"
            onClick={() => onCreateEquipment(newEquipmentName, target)}
            disabled={addingEquipment}
          >
            {addingEquipment ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>
    </>
  );
}

export default EquipmentField;
