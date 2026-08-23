const predefinedEquipmentNames = [
  "Projecteur",
  "Ecran",
  "Tableau blanc",
  "Paperboard",
  "Visioconference",
  "Wifi",
];

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
  const normalizeEquipmentName = (name) => name.trim().toLowerCase();
  const findEquipmentByName = (name) =>
    equipments.find((equipment) => normalizeEquipmentName(equipment.nom) === normalizeEquipmentName(name));

  const availablePredefined = predefinedEquipmentNames.filter((name) => !findEquipmentByName(name));

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
              <label key={equipment.id} className="room-equipment-choice">
                <input
                  type="checkbox"
                  checked={selectedEquipmentIds.includes(String(equipment.id))}
                  onChange={() => onEquipmentToggle(equipment.id)}
                />
                <span>{equipment.nom}</span>
              </label>
            ))}
        </div>

        {availablePredefined.length > 0 && (
          <div className="room-equipment-presets">
            {availablePredefined.map((equipmentName) => (
              <button
                key={equipmentName}
                className="room-equipment-preset"
                type="button"
                onClick={() => onCreateEquipment(equipmentName, target)}
                disabled={addingEquipment}
              >
                + {equipmentName}
              </button>
            ))}
          </div>
        )}

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

      {equipmentCreateError && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>
          {equipmentCreateError}
        </p>
      )}
    </>
  );
}

export default EquipmentField;
