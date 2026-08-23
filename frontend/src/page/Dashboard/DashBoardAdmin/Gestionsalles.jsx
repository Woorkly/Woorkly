import { useEffect, useState } from "react";
import { equipmentService } from "../../../services/equipmentService";
import { roomService } from "../../../services/roomService";
import { typeService } from "../../../services/typeService";
import uploadService from "../../../services/uploadService";
import { Badge, RoomForm, RoomDeleteModal } from "../../../components/GestionSalle";
import "./AdminStyle.css";

// Icônes SVG par type de salle
const icons = {
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

const IconEdit = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const initialRoomForm = {
  nom: "",
  statut: "disponible",
  adresse: "",
  code_postal: "",
  ville: "",
  latitude: "",
  longitude: "",
  capacite: "",
  description: "",
  prix_heure: "",
  prix_demi_journee: "",
  prix_journee: "",
  image_principale: "",
  photos: [],
  type_id: "",
  equipement_ids: [],
};

const optionalNumber = (value) => (value === "" ? null : Number(value));

const buildRoomPayload = (form) => ({
  ...form,
  nom: form.nom.trim(),
  adresse: form.adresse.trim() || null,
  code_postal: form.code_postal.trim() || null,
  ville: form.ville.trim() || null,
  latitude: optionalNumber(form.latitude),
  longitude: optionalNumber(form.longitude),
  capacite: optionalNumber(form.capacite),
  description: form.description.trim() || null,
  prix_heure: optionalNumber(form.prix_heure),
  prix_demi_journee: optionalNumber(form.prix_demi_journee),
  prix_journee: optionalNumber(form.prix_journee),
  image_principale: form.image_principale.trim() || "default-room.jpg",
  photos: Array.isArray(form.photos) ? form.photos.filter((u) => u && u.trim()) : [],
  type_id: optionalNumber(form.type_id),
  equipement_ids: form.equipement_ids.map((id) => Number(id)),
});

const toFormValue = (value) => (value === null || value === undefined ? "" : String(value));

const buildRoomForm = (room) => ({
  nom: toFormValue(room.nom),
  statut: toFormValue(room.statut) || "disponible",
  adresse: toFormValue(room.adresse),
  code_postal: toFormValue(room.code_postal),
  ville: toFormValue(room.ville),
  latitude: toFormValue(room.latitude),
  longitude: toFormValue(room.longitude),
  capacite: toFormValue(room.capacite),
  description: toFormValue(room.description),
  prix_heure: toFormValue(room.prix_heure),
  prix_demi_journee: toFormValue(room.prix_demi_journee),
  prix_journee: toFormValue(room.prix_journee),
  image_principale: toFormValue(room.image_principale),
  photos: Array.isArray(room.galerie) ? room.galerie : [],
  type_id: toFormValue(room.type_id),
  equipement_ids: Array.isArray(room.equipement_ids) ? room.equipement_ids.map(String) : [],
});

const capacityFilters = {
  small: { capacite_max: 12 },
  medium: { capacite_min: 13, capacite_max: 20 },
  large: { capacite_min: 21 },
};


export default function GestionSalles() {
  const [search, setSearch] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state: unified for create + edit
  const [roomFormData, setRoomFormData] = useState(initialRoomForm);
  const [formError, setFormError] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal state: null = closed, { id, ... } = editing, "create" = creating
  const [modalState, setModalState] = useState(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);

  // Room types
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [newTypeName, setNewTypeName] = useState("");
  const [addingType, setAddingType] = useState(false);
  const [typeCreateError, setTypeCreateError] = useState(null);
  const [deletingType, setDeletingType] = useState(false);
  const [typeDeleteError, setTypeDeleteError] = useState(null);

  // Equipment
  const [equipments, setEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [equipmentsError, setEquipmentsError] = useState(null);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [addingEquipment, setAddingEquipment] = useState(false);
  const [equipmentCreateError, setEquipmentCreateError] = useState(null);

  // Delete confirmation
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch rooms on filter change
  useEffect(() => {
    let isMounted = true;

    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = { ...(capacityFilters[capacityFilter] || {}) };
        if (equipmentFilter) filters.equipement_id = equipmentFilter;

        const data = await roomService.getRooms(filters);
        if (isMounted) setSalles(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || err.message || "Erreur lors du chargement des salles");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRooms();
    return () => {
      isMounted = false;
    };
  }, [capacityFilter, equipmentFilter]);

  // Fetch types
  useEffect(() => {
    let isMounted = true;

    const fetchTypes = async () => {
      setLoadingTypes(true);

      try {
        const data = await typeService.getTypes();
        if (isMounted) setRoomTypes(Array.isArray(data) ? data : []);
      } catch (err) {
        // Silent fail for types
      } finally {
        if (isMounted) setLoadingTypes(false);
      }
    };

    fetchTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch equipments
  useEffect(() => {
    let isMounted = true;

    const fetchEquipments = async () => {
      setLoadingEquipments(true);
      setEquipmentsError(null);

      try {
        const data = await equipmentService.getEquipments();
        if (isMounted) setEquipments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setEquipmentsError(err.response?.data?.message || err.message || "Erreur lors du chargement des équipements");
      } finally {
        if (isMounted) setLoadingEquipments(false);
      }
    };

    fetchEquipments();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = { ...(capacityFilters[capacityFilter] || {}) };
      if (equipmentFilter) filters.equipement_id = equipmentFilter;

      const data = await roomService.getRooms(filters);
      setSalles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  const normalizeEquipmentName = (name) => name.trim().toLowerCase();
  const findEquipmentByName = (name) =>
    equipments.find((equipment) => normalizeEquipmentName(equipment.nom) === normalizeEquipmentName(name));

  const selectEquipmentInForm = (equipmentId) => {
    if (!equipmentId) return;
    const value = String(equipmentId);
    setRoomFormData((current) => ({
      ...current,
      equipement_ids: current.equipement_ids.includes(value)
        ? current.equipement_ids
        : [...current.equipement_ids, value],
    }));
  };

  const handleCreateEquipment = async (name) => {
    const cleanName = name.trim();
    setEquipmentCreateError(null);

    if (!cleanName) {
      setEquipmentCreateError("Le nom de l'équipement est obligatoire.");
      return;
    }

    const existingEquipment = findEquipmentByName(cleanName);
    if (existingEquipment) {
      selectEquipmentInForm(existingEquipment.id);
      setNewEquipmentName("");
      return;
    }

    setAddingEquipment(true);

    try {
      const createdEquipment = await equipmentService.createEquipment(cleanName);
      const data = await equipmentService.getEquipments();
      const nextEquipments = Array.isArray(data) ? data : [];
      const freshEquipment = nextEquipments.find((equipment) => normalizeEquipmentName(equipment.nom) === normalizeEquipmentName(cleanName));

      setEquipments(nextEquipments);
      selectEquipmentInForm(createdEquipment.id || freshEquipment?.id);
      setNewEquipmentName("");
    } catch (err) {
      setEquipmentCreateError(err.response?.data?.message || err.message || "Erreur lors de la création de l'équipement");
    } finally {
      setAddingEquipment(false);
    }
  };

  const normalizeTypeName = (name) => name.trim().toLowerCase();
  const findTypeByName = (name) => roomTypes.find((type) => normalizeTypeName(type.nom) === normalizeTypeName(name));

  const selectTypeInForm = (typeId) => {
    if (!typeId) return;
    setRoomFormData((current) => ({ ...current, type_id: String(typeId) }));
  };

  const handleCreateType = async (name) => {
    const cleanName = name.trim();
    setTypeCreateError(null);

    if (!cleanName) {
      setTypeCreateError("Le nom du type est obligatoire.");
      return;
    }

    const existingType = findTypeByName(cleanName);
    if (existingType) {
      selectTypeInForm(existingType.id);
      setNewTypeName("");
      return;
    }

    setAddingType(true);

    try {
      const createdType = await typeService.createType(cleanName);
      const data = await typeService.getTypes();
      const nextTypes = Array.isArray(data) ? data : [];
      const freshType = nextTypes.find((type) => normalizeTypeName(type.nom) === normalizeTypeName(cleanName));

      setRoomTypes(nextTypes);
      selectTypeInForm(createdType.id || freshType?.id);
      setNewTypeName("");
    } catch (err) {
      setTypeCreateError(err.response?.data?.message || err.message || "Erreur lors de la création du type");
    } finally {
      setAddingType(false);
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!typeId) return;

    const type = roomTypes.find((t) => String(t.id) === String(typeId));
    const confirmed = window.confirm(`Supprimer le type "${type?.nom || ""}" ? Cette action est irréversible.`);
    if (!confirmed) return;

    setTypeDeleteError(null);
    setDeletingType(true);

    try {
      await typeService.deleteType(typeId);
      const data = await typeService.getTypes();
      setRoomTypes(Array.isArray(data) ? data : []);

      setRoomFormData((current) =>
        current.type_id === String(typeId) ? { ...current, type_id: "" } : current
      );
    } catch (err) {
      setTypeDeleteError(err.response?.data?.message || err.message || "Erreur lors de la suppression du type");
    } finally {
      setDeletingType(false);
    }
  };

  const filtered = salles.filter((s) => s.nom?.toLowerCase().includes(search.toLowerCase()));

  const getRoomImageSrc = (imageName) => {
    const value = (imageName || "").trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `/images/${value}`;
  };

  const getLocation = (room) =>
    [room.adresse, room.code_postal, room.ville].filter(Boolean).join(", ") || "Non renseigné";

  const openCreateForm = () => {
    setRoomFormData(initialRoomForm);
    setFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
    setTypeCreateError(null);
    setNewTypeName("");
    setTypeDeleteError(null);
    setModalState("create");
  };

  const openRoomDetails = async (roomId) => {
    setSelectedRoomDetail(null);
    setFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
    setTypeCreateError(null);
    setNewTypeName("");
    setTypeDeleteError(null);

    try {
      const data = await roomService.getRoomById(roomId);
      setSelectedRoomDetail(data);
      setRoomFormData(buildRoomForm(data));
      setModalState(data.id);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Erreur lors du chargement de la salle");
    }
  };

  const closeForm = () => {
    if (savingRoom || uploading) return;
    setModalState(null);
    setSelectedRoomDetail(null);
    setRoomFormData(initialRoomForm);
    setFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
    setTypeCreateError(null);
    setNewTypeName("");
    setTypeDeleteError(null);
  };

  const updateFormField = (field, value) => {
    setRoomFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleEquipment = (equipmentId) => {
    const value = String(equipmentId);
    setRoomFormData((current) => ({
      ...current,
      equipement_ids: current.equipement_ids.includes(value)
        ? current.equipement_ids.filter((id) => id !== value)
        : [...current.equipement_ids, value],
    }));
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!roomFormData.nom.trim()) {
      setFormError("Le nom de la salle est obligatoire.");
      return;
    }

    if (!roomFormData.type_id) {
      setFormError("Le type de salle est obligatoire.");
      return;
    }

    setSavingRoom(true);

    try {
      await roomService.createRoom(buildRoomPayload(roomFormData));
      closeForm();
      await refreshRooms();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Erreur lors de la création de la salle");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleUpdateRoom = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedRoomDetail) return;

    if (!roomFormData.nom.trim()) {
      setFormError("Le nom de la salle est obligatoire.");
      return;
    }

    if (!roomFormData.type_id) {
      setFormError("Le type de salle est obligatoire.");
      return;
    }

    setSavingRoom(true);

    try {
      await roomService.updateRoom(selectedRoomDetail.id, buildRoomPayload(roomFormData));
      await refreshRooms();
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Erreur lors de la modification de la salle");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    setDeletingRoom(true);
    setDeleteError(null);

    try {
      await roomService.deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
      await refreshRooms();
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || "Erreur lors de la suppression de la salle");
    } finally {
      setDeletingRoom(false);
    }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadService.uploadRoomImage(file);
      updateFormField("image_principale", url);
    } catch {
      setFormError("Erreur lors de l'upload de l'image principale.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadService.uploadRoomGallery(file);
        uploadedUrls.push(url);
      }
      setRoomFormData((current) => ({
        ...current,
        photos: [...current.photos, ...uploadedUrls],
      }));
    } catch {
      setFormError("Erreur lors de l'upload de la galerie.");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryPhoto = (index) => {
    setRoomFormData((current) => ({
      ...current,
      photos: current.photos.filter((_, i) => i !== index),
    }));
  };

  const isEditMode = modalState && modalState !== "create";
  const isModalOpen = modalState !== null;

  return (
    <>
      <div className="topbar">Gestion Salles</div>
      <div className="page-body">
        <div className="page-header">
          <h2 className="page-title">Gestion Salles</h2>
          <button className="btn-primary" type="button" onClick={openCreateForm}>
            + Ajouter une salle
          </button>
        </div>

        <div className="filters-row">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-box"
              placeholder="Rechercher"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="flt-label">Filtres :</span>
          <select
            className="flt-select"
            value={capacityFilter}
            onChange={(event) => setCapacityFilter(event.target.value)}
          >
            <option value="">Capacité</option>
            <option value="small">12 ou moins</option>
            <option value="medium">13 à 20</option>
            <option value="large">Plus de 20</option>
          </select>
          <select
            className="flt-select"
            value={equipmentFilter}
            onChange={(event) => setEquipmentFilter(event.target.value)}
            disabled={loadingEquipments}
          >
            <option value="">
              {loadingEquipments ? "Chargement..." : "Équipements"}
            </option>
            {equipments.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.nom}
              </option>
            ))}
          </select>
          {(capacityFilter || equipmentFilter) && (
            <button
              className="flt-clear"
              type="button"
              onClick={() => {
                setCapacityFilter("");
                setEquipmentFilter("");
              }}
            >
              Réinitialiser
            </button>
          )}
          <select className="flt-select" style={{ marginLeft: "auto" }}>
            <option>Ainas delive ▾</option>
          </select>
        </div>

        {equipmentsError && <p className="room-form-error">{equipmentsError}</p>}

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room Photo</th>
                  <th>Room Name</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Equipments</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 24 }}>
                      Chargement des salles...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 24, color: "var(--red)" }}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 24 }}>
                      Aucune salle trouvée.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filtered.map((s) => {
                    const imageSrc = getRoomImageSrc(s.image_principale);

                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="room-thumb">
                            {imageSrc ? (
                              <img src={imageSrc} alt={s.nom} />
                            ) : (
                              icons.boardroom
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{s.nom}</td>
                        <td>{s.capacite || "Non renseigné"}</td>
                        <td>{getLocation(s)}</td>
                        <td style={{ fontSize: "0.79rem", color: "var(--muted)" }}>
                          {s.equipements || "Non renseigné"}
                        </td>
                        <td>
                          <Badge status={s.statut} />
                        </td>
                        <td>
                          <button
                            className="act-btn act-edit"
                            type="button"
                            onClick={() => openRoomDetails(s.id)}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="act-btn act-del"
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setRoomToDelete(s);
                            }}
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RoomForm
          title={isEditMode ? `Modifier ${selectedRoomDetail?.nom || "la salle"}` : "Ajouter une salle"}
          subtitle={isEditMode ? "Mettez à jour les informations de la salle." : "Préparez les informations de la salle avant enregistrement."}
          formData={roomFormData}
          onFormChange={updateFormField}
          roomTypes={roomTypes}
          loadingTypes={loadingTypes}
          equipments={equipments}
          loadingEquipments={loadingEquipments}
          onSubmit={isEditMode ? handleUpdateRoom : handleCreateRoom}
          onClose={closeForm}
          loading={savingRoom || uploading}
          error={formError}
          newTypeName={newTypeName}
          onNewTypeNameChange={setNewTypeName}
          onCreateType={handleCreateType}
          onDeleteType={handleDeleteType}
          addingType={addingType}
          deletingType={deletingType}
          typeCreateError={typeCreateError}
          typeDeleteError={typeDeleteError}
          newEquipmentName={newEquipmentName}
          onNewEquipmentNameChange={setNewEquipmentName}
          onCreateEquipment={handleCreateEquipment}
          onEquipmentToggle={toggleEquipment}
          addingEquipment={addingEquipment}
          equipmentCreateError={equipmentCreateError}
          onMainImageUpload={handleMainImageUpload}
          onGalleryUpload={handleGalleryUpload}
          onRemovePhoto={removeGalleryPhoto}
          uploading={uploading}
          mode={isEditMode ? "edit" : "create"}
          editingRoom={selectedRoomDetail}
        />
      )}

      <RoomDeleteModal
        room={roomToDelete}
        onConfirm={handleDeleteRoom}
        onCancel={() => {
          setRoomToDelete(null);
          setDeleteError(null);
        }}
        loading={deletingRoom}
        error={deleteError}
      />
    </>
  );
}
