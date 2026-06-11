import { useEffect, useState } from "react";
import { equipmentService } from "../../../services/equipmentService";
import { roomService } from "../../../services/roomService";
import { typeService } from "../../../services/typeService";
import api from "../../../services/api";
import "./AdminStyle.css";

// Icônes SVG par type de salle
const icons = {
  hub: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A56A0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="26"
      height="26"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
      <circle cx="6" cy="6" r="0.5" fill="#1A56A0" />
    </svg>
  ),
  boardroom: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A56A0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="26"
      height="26"
    >
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M6 7V5M12 7V4M18 7V5M6 17v2M18 17v2" />
    </svg>
  ),
  creative: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A56A0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="26"
      height="26"
    >
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8l3 3 2-2 3 4" />
    </svg>
  ),
  screen: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A56A0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="26"
      height="26"
    >
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 20h8M12 18v2" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  ),
  office: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A56A0"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="26"
      height="26"
    >
      <path d="M4 20V10l8-6 8 6v10H4z" />
      <rect x="9" y="14" width="6" height="6" />
      <path d="M4 10h16" />
    </svg>
  ),
};

const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

function Badge({ s }) {
  const m = {
    disponible: "b-available",
    reservee: "b-blue",
    "hors-service": "b-offline",
  };
  const labels = {
    disponible: "Disponible",
    reservee: "Reservee",
    "hors-service": "Hors service",
  };

  return (
    <span className={`badge ${m[s] || ""}`}>
      {labels[s] || s || "Non renseigne"}
    </span>
  );
}

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

const optionalNumber = (value) => {
  if (value === "") return null;
  return Number(value);
};

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

const toFormValue = (value) =>
  value === null || value === undefined ? "" : String(value);

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
  equipement_ids: Array.isArray(room.equipement_ids)
    ? room.equipement_ids.map(String)
    : [],
});

const capacityFilters = {
  small: { capacite_max: 12 },
  medium: { capacite_min: 13, capacite_max: 20 },
  large: { capacite_min: 21 },
};

const predefinedEquipmentNames = [
  "Projecteur",
  "Ecran",
  "Tableau blanc",
  "Paperboard",
  "Visioconference",
  "Wifi",
];

export default function GestionSalles() {
  const [search, setSearch] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [savingRoom, setSavingRoom] = useState(false);
  const [formError, setFormError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState(initialRoomForm);
  const [savingEditRoom, setSavingEditRoom] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [equipmentsError, setEquipmentsError] = useState(null);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [addingEquipment, setAddingEquipment] = useState(false);
  const [equipmentCreateError, setEquipmentCreateError] = useState(null);
  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const getRoomFilters = () => {
    const filters = {
      ...(capacityFilters[capacityFilter] || {}),
    };

    if (equipmentFilter) {
      filters.equipement_id = equipmentFilter;
    }

    return filters;
  };

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          ...(capacityFilters[capacityFilter] || {}),
        };

        if (equipmentFilter) {
          filters.equipement_id = equipmentFilter;
        }

        const data = await roomService.getRooms(filters);
        setSalles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des salles");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [capacityFilter, equipmentFilter]);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoadingTypes(true);
      setTypesError(null);

      try {
        const data = await typeService.getTypes();
        setRoomTypes(Array.isArray(data) ? data : []);
      } catch (err) {
        setTypesError(err.message || "Erreur lors du chargement des types");
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchEquipments = async () => {
      setLoadingEquipments(true);
      setEquipmentsError(null);

      try {
        const data = await equipmentService.getEquipments();
        setEquipments(Array.isArray(data) ? data : []);
      } catch (err) {
        setEquipmentsError(
          err.message || "Erreur lors du chargement des equipements",
        );
      } finally {
        setLoadingEquipments(false);
      }
    };

    fetchEquipments();
  }, []);

  const refreshRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await roomService.getRooms(getRoomFilters());
      setSalles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  const normalizeEquipmentName = (name) => name.trim().toLowerCase();

  const findEquipmentByName = (name) =>
    equipments.find(
      (equipment) =>
        normalizeEquipmentName(equipment.nom) === normalizeEquipmentName(name),
    );

  const selectEquipmentInForm = (equipmentId, target) => {
    if (!equipmentId) return;

    const value = String(equipmentId);
    const setter = target === "edit" ? setEditRoomForm : setRoomForm;

    setter((current) => ({
      ...current,
      equipement_ids: current.equipement_ids.includes(value)
        ? current.equipement_ids
        : [...current.equipement_ids, value],
    }));
  };

  const handleCreateEquipment = async (name, target) => {
    const cleanName = name.trim();
    setEquipmentCreateError(null);

    if (!cleanName) {
      setEquipmentCreateError("Le nom de l'equipement est obligatoire.");
      return;
    }

    const existingEquipment = findEquipmentByName(cleanName);
    if (existingEquipment) {
      selectEquipmentInForm(existingEquipment.id, target);
      setNewEquipmentName("");
      return;
    }

    setAddingEquipment(true);

    try {
      const createdEquipment =
        await equipmentService.createEquipment(cleanName);
      const data = await equipmentService.getEquipments();
      const nextEquipments = Array.isArray(data) ? data : [];
      const freshEquipment = nextEquipments.find(
        (equipment) =>
          normalizeEquipmentName(equipment.nom) ===
          normalizeEquipmentName(cleanName),
      );

      setEquipments(nextEquipments);
      selectEquipmentInForm(createdEquipment.id || freshEquipment?.id, target);
      setNewEquipmentName("");
    } catch (err) {
      setEquipmentCreateError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la creation de l'equipement",
      );
    } finally {
      setAddingEquipment(false);
    }
  };

  const filtered = salles.filter((s) =>
    s.nom?.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoomImageSrc = (imageName) => {
    const value = (imageName || "").trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    return `/images/${value}`;
  };

  const getLocation = (room) =>
    [room.adresse, room.code_postal, room.ville].filter(Boolean).join(", ") ||
    "Non renseigne";

  const openCreateForm = () => {
    setRoomForm(initialRoomForm);
    setFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
    setIsCreateOpen(true);
  };

  const closeCreateForm = () => {
    if (savingRoom) return;
    setIsCreateOpen(false);
  };

  const updateRoomForm = (field, value) => {
    setRoomForm((current) => ({ ...current, [field]: value }));
  };

  const toggleRoomEquipment = (equipmentId) => {
    const value = String(equipmentId);

    setRoomForm((current) => {
      const selected = current.equipement_ids.includes(value);
      return {
        ...current,
        equipement_ids: selected
          ? current.equipement_ids.filter((id) => id !== value)
          : [...current.equipement_ids, value],
      };
    });
  };

  const openRoomDetails = async (roomId) => {
    setSelectedRoom(null);
    setDetailError(null);
    setEditFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
    setLoadingRoom(true);

    try {
      const data = await roomService.getRoomById(roomId);
      setSelectedRoom(data);
      setEditRoomForm(buildRoomForm(data));
    } catch (err) {
      setDetailError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de la salle",
      );
    } finally {
      setLoadingRoom(false);
    }
  };

  const closeRoomDetails = () => {
    if (savingEditRoom) return;
    setSelectedRoom(null);
    setDetailError(null);
    setLoadingRoom(false);
    setEditRoomForm(initialRoomForm);
    setEditFormError(null);
    setEquipmentCreateError(null);
    setNewEquipmentName("");
  };

  const updateEditRoomForm = (field, value) => {
    setEditRoomForm((current) => ({ ...current, [field]: value }));
  };

  const toggleEditRoomEquipment = (equipmentId) => {
    const value = String(equipmentId);

    setEditRoomForm((current) => {
      const selected = current.equipement_ids.includes(value);
      return {
        ...current,
        equipement_ids: selected
          ? current.equipement_ids.filter((id) => id !== value)
          : [...current.equipement_ids, value],
      };
    });
  };

  const openDeleteConfirm = (room) => {
    setDeleteError(null);
    setRoomToDelete(room);
  };

  const closeDeleteConfirm = () => {
    if (deletingRoom) return;
    setRoomToDelete(null);
    setDeleteError(null);
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!roomForm.nom.trim()) {
      setFormError("Le nom de la salle est obligatoire.");
      return;
    }

    if (!roomForm.type_id) {
      setFormError("Le type de salle est obligatoire.");
      return;
    }

    setSavingRoom(true);

    try {
      await roomService.createRoom(buildRoomPayload(roomForm));
      setIsCreateOpen(false);
      setRoomForm(initialRoomForm);
      await refreshRooms();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la creation de la salle",
      );
    } finally {
      setSavingRoom(false);
    }
  };

  const handleUpdateRoom = async (event) => {
    event.preventDefault();
    setEditFormError(null);

    if (!selectedRoom) return;

    if (!editRoomForm.nom.trim()) {
      setEditFormError("Le nom de la salle est obligatoire.");
      return;
    }

    if (!editRoomForm.type_id) {
      setEditFormError("Le type de salle est obligatoire.");
      return;
    }

    setSavingEditRoom(true);

    try {
      const payload = buildRoomPayload(editRoomForm);
      await roomService.updateRoom(selectedRoom.id, payload);
      const updatedRoom = await roomService.getRoomById(selectedRoom.id);
      setSelectedRoom(updatedRoom);
      setEditRoomForm(buildRoomForm(updatedRoom));
      await refreshRooms();
    } catch (err) {
      setEditFormError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la modification de la salle",
      );
    } finally {
      setSavingEditRoom(false);
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
      setDeleteError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression de la salle",
      );
    } finally {
      setDeletingRoom(false);
    }
  };

  const handleMainImageUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    const setUploading = target === "edit" ? setUploadingEdit : setUploadingCreate;
    const formSetter = target === "edit" ? updateEditRoomForm : updateRoomForm;
    const setErr = target === "edit" ? setEditFormError : setFormError;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      formSetter("image_principale", res.data.url);
    } catch {
      setErr("Erreur lors de l'upload de l'image principale.");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e, target) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const setUploading = target === "edit" ? setUploadingEdit : setUploadingCreate;
    const setForm = target === "edit" ? setEditRoomForm : setRoomForm;
    const setErr = target === "edit" ? setEditFormError : setFormError;
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrls.push(res.data.url);
      }
      setForm((current) => ({
        ...current,
        photos: [...current.photos, ...uploadedUrls],
      }));
    } catch {
      setErr("Erreur lors de l'upload de la galerie.");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryPhoto = (target, index) => {
    const setForm = target === "edit" ? setEditRoomForm : setRoomForm;
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <div className="topbar">Gestion Salles</div>
      <div className="page-body">
        <div className="page-header">
          <h2 className="page-title">Gestion Salles</h2>
          <button
            className="btn-primary"
            type="button"
            onClick={openCreateForm}
          >
            + Ajouter une salle
          </button>
        </div>

        <div className="filters-row">
          <div className="search-wrap">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            <option value="">Capacite</option>
            <option value="small">12 ou moins</option>
            <option value="medium">13 a 20</option>
            <option value="large">Plus de 20</option>
          </select>
          <select
            className="flt-select"
            value={equipmentFilter}
            onChange={(event) => setEquipmentFilter(event.target.value)}
            disabled={loadingEquipments}
          >
            <option value="">
              {loadingEquipments ? "Chargement..." : "Equipements"}
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
              Reinitialiser
            </button>
          )}
          <select className="flt-select" style={{ marginLeft: "auto" }}>
            <option>Ainas delive ▾</option>
          </select>
        </div>

        {equipmentsError && (
          <p className="room-form-error">{equipmentsError}</p>
        )}

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
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Chargement des salles...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "var(--red)",
                      }}
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      Aucune salle trouvee.
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
                        <td>{s.capacite || "Non renseigne"}</td>
                        <td>{getLocation(s)}</td>
                        <td
                          style={{ fontSize: "0.79rem", color: "var(--muted)" }}
                        >
                          {s.equipements || "Non renseigne"}
                        </td>
                        <td>
                          <Badge s={s.statut} />
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
                            onClick={() => openDeleteConfirm(s)}
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

      {isCreateOpen && (
        <div className="ud-overlay" onClick={closeCreateForm}>
          <div
            className="ud-panel room-form-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="ud-close"
              type="button"
              onClick={closeCreateForm}
              disabled={savingRoom}
            >
              x
            </button>

            <div>
              <h3 className="ud-name">Ajouter une salle</h3>
              <p className="ud-email">
                Prepare les informations de la salle avant enregistrement.
              </p>
            </div>

            <form className="room-form" onSubmit={handleCreateRoom}>
              <label>
                Nom
                <input
                  required
                  value={roomForm.nom}
                  onChange={(event) =>
                    updateRoomForm("nom", event.target.value)
                  }
                  placeholder="Nom de la salle"
                />
              </label>

              <label>
                Statut
                <select
                  value={roomForm.statut}
                  onChange={(event) =>
                    updateRoomForm("statut", event.target.value)
                  }
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservee">Reservee</option>
                  <option value="hors-service">Hors service</option>
                </select>
              </label>

              <label>
                Adresse
                <input
                  required
                  value={roomForm.adresse}
                  onChange={(event) =>
                    updateRoomForm("adresse", event.target.value)
                  }
                  placeholder="Adresse"
                />
              </label>

              <label>
                Code postal
                <input
                  value={roomForm.code_postal}
                  onChange={(event) =>
                    updateRoomForm("code_postal", event.target.value)
                  }
                  placeholder="13001"
                />
              </label>

              <label>
                Ville
                <input
                  value={roomForm.ville}
                  onChange={(event) =>
                    updateRoomForm("ville", event.target.value)
                  }
                  placeholder="Marseille"
                />
              </label>

              <label>
                Capacite
                <input
                  type="number"
                  min="1"
                  value={roomForm.capacite}
                  onChange={(event) =>
                    updateRoomForm("capacite", event.target.value)
                  }
                  placeholder="12"
                />
              </label>

              <label>
                Prix heure
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomForm.prix_heure}
                  onChange={(event) =>
                    updateRoomForm("prix_heure", event.target.value)
                  }
                  placeholder="25.00"
                />
              </label>

              <label>
                Prix demi-journee
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomForm.prix_demi_journee}
                  onChange={(event) =>
                    updateRoomForm("prix_demi_journee", event.target.value)
                  }
                  placeholder="90.00"
                />
              </label>

              <label>
                Prix journee
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomForm.prix_journee}
                  onChange={(event) =>
                    updateRoomForm("prix_journee", event.target.value)
                  }
                  placeholder="160.00"
                />
              </label>

              <label>
                Type de salle
                <select
                  required
                  value={roomForm.type_id}
                  onChange={(event) =>
                    updateRoomForm("type_id", event.target.value)
                  }
                  disabled={loadingTypes}
                >
                  <option value="">
                    {loadingTypes
                      ? "Chargement des types..."
                      : "Choisir un type"}
                  </option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
              </label>

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
                      <label
                        key={equipment.id}
                        className="room-equipment-choice"
                      >
                        <input
                          type="checkbox"
                          checked={roomForm.equipement_ids.includes(
                            String(equipment.id),
                          )}
                          onChange={() => toggleRoomEquipment(equipment.id)}
                        />
                        <span>{equipment.nom}</span>
                      </label>
                    ))}
                </div>

                <div className="room-equipment-presets">
                  {predefinedEquipmentNames
                    .filter(
                      (equipmentName) => !findEquipmentByName(equipmentName),
                    )
                    .map((equipmentName) => (
                      <button
                        key={equipmentName}
                        className="room-equipment-preset"
                        type="button"
                        onClick={() =>
                          handleCreateEquipment(equipmentName, "create")
                        }
                        disabled={addingEquipment}
                      >
                        + {equipmentName}
                      </button>
                    ))}
                </div>

                <div className="room-equipment-create">
                  <input
                    value={newEquipmentName}
                    onChange={(event) =>
                      setNewEquipmentName(event.target.value)
                    }
                    placeholder="Nouvel equipement"
                  />
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={() =>
                      handleCreateEquipment(newEquipmentName, "create")
                    }
                    disabled={addingEquipment}
                  >
                    {addingEquipment ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </div>

              <div className="room-form-wide room-equipment-field">
                <span>Image principale</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleMainImageUpload(e, "create")}
                  disabled={uploadingCreate}
                />
                {uploadingCreate && (
                  <p className="ud-empty">Upload en cours...</p>
                )}
                {roomForm.image_principale && (
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={roomForm.image_principale}
                      alt="Image principale"
                      style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                    />
                    <button
                      type="button"
                      className="ud-btn-ghost"
                      style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                      onClick={() => updateRoomForm("image_principale", "")}
                      disabled={uploadingCreate}
                    >
                      Retirer
                    </button>
                  </div>
                )}
              </div>

              <div className="room-form-wide room-equipment-field">
                <span>Galerie de photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleGalleryUpload(e, "create")}
                  disabled={uploadingCreate}
                />
                {roomForm.photos.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                    {roomForm.photos.map((url, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`Photo ${index + 1}`}
                          style={{ width: "70px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto("create", index)}
                          disabled={uploadingCreate}
                          style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--red, #e53e3e)", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", lineHeight: "18px", padding: 0 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="room-form-wide">
                Description
                <textarea
                  value={roomForm.description}
                  onChange={(event) =>
                    updateRoomForm("description", event.target.value)
                  }
                  placeholder="Description de la salle"
                  rows="4"
                />
              </label>

              {formError && <p className="room-form-error">{formError}</p>}

              {typesError && <p className="room-form-error">{typesError}</p>}

              {equipmentCreateError && (
                <p className="room-form-error">{equipmentCreateError}</p>
              )}

              <div className="room-form-actions">
                <button
                  className="ud-btn-ghost"
                  type="button"
                  onClick={closeCreateForm}
                  disabled={savingRoom || uploadingCreate}
                >
                  Annuler
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={savingRoom || uploadingCreate}
                >
                  {uploadingCreate ? "Upload en cours..." : savingRoom ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(loadingRoom || detailError || selectedRoom) && (
        <div className="ud-overlay" onClick={closeRoomDetails}>
          <div
            className="ud-panel room-detail-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="ud-close"
              type="button"
              onClick={closeRoomDetails}
              disabled={savingEditRoom}
            >
              x
            </button>

            {loadingRoom && (
              <p className="ud-empty">Chargement de la salle...</p>
            )}

            {!loadingRoom && detailError && (
              <p className="room-form-error">{detailError}</p>
            )}

            {!loadingRoom && selectedRoom && (
              <>
                <div className="room-detail-admin-head">
                  <div className="room-detail-admin-thumb">
                    {getRoomImageSrc(selectedRoom.image_principale) ? (
                      <img
                        src={getRoomImageSrc(selectedRoom.image_principale)}
                        alt={selectedRoom.nom}
                      />
                    ) : (
                      icons.boardroom
                    )}
                  </div>
                  <div>
                    <h3 className="ud-name">{selectedRoom.nom}</h3>
                    <p className="ud-email">{getLocation(selectedRoom)}</p>
                    <div className="ud-badges">
                      <Badge s={selectedRoom.statut} />
                      {selectedRoom.type_nom && (
                        <span className="badge b-blue">
                          {selectedRoom.type_nom}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <form className="room-form" onSubmit={handleUpdateRoom}>
                  <label>
                    Nom
                    <input
                      required
                      value={editRoomForm.nom}
                      onChange={(event) =>
                        updateEditRoomForm("nom", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Statut
                    <select
                      value={editRoomForm.statut}
                      onChange={(event) =>
                        updateEditRoomForm("statut", event.target.value)
                      }
                    >
                      <option value="disponible">Disponible</option>
                      <option value="reservee">Reservee</option>
                      <option value="hors-service">Hors service</option>
                    </select>
                  </label>

                  <label>
                    Adresse
                    <input
                      value={editRoomForm.adresse}
                      onChange={(event) =>
                        updateEditRoomForm("adresse", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Code postal
                    <input
                      value={editRoomForm.code_postal}
                      onChange={(event) =>
                        updateEditRoomForm("code_postal", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Ville
                    <input
                      value={editRoomForm.ville}
                      onChange={(event) =>
                        updateEditRoomForm("ville", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Capacite
                    <input
                      type="number"
                      min="1"
                      value={editRoomForm.capacite}
                      onChange={(event) =>
                        updateEditRoomForm("capacite", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Prix heure
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editRoomForm.prix_heure}
                      onChange={(event) =>
                        updateEditRoomForm("prix_heure", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Prix demi-journee
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editRoomForm.prix_demi_journee}
                      onChange={(event) =>
                        updateEditRoomForm(
                          "prix_demi_journee",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Prix journee
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editRoomForm.prix_journee}
                      onChange={(event) =>
                        updateEditRoomForm("prix_journee", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Type de salle
                    <select
                      required
                      value={editRoomForm.type_id}
                      onChange={(event) =>
                        updateEditRoomForm("type_id", event.target.value)
                      }
                      disabled={loadingTypes}
                    >
                      <option value="">
                        {loadingTypes
                          ? "Chargement des types..."
                          : "Choisir un type"}
                      </option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.nom}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="room-form-wide room-equipment-field">
                    <span>Equipements</span>
                    <div className="room-equipment-list">
                      {loadingEquipments && (
                        <p className="ud-empty">
                          Chargement des equipements...
                        </p>
                      )}

                      {!loadingEquipments && equipments.length === 0 && (
                        <p className="ud-empty">Aucun equipement disponible.</p>
                      )}

                      {!loadingEquipments &&
                        equipments.map((equipment) => (
                          <label
                            key={equipment.id}
                            className="room-equipment-choice"
                          >
                            <input
                              type="checkbox"
                              checked={editRoomForm.equipement_ids.includes(
                                String(equipment.id),
                              )}
                              onChange={() =>
                                toggleEditRoomEquipment(equipment.id)
                              }
                            />
                            <span>{equipment.nom}</span>
                          </label>
                        ))}
                    </div>

                    <div className="room-equipment-presets">
                      {predefinedEquipmentNames
                        .filter(
                          (equipmentName) =>
                            !findEquipmentByName(equipmentName),
                        )
                        .map((equipmentName) => (
                          <button
                            key={equipmentName}
                            className="room-equipment-preset"
                            type="button"
                            onClick={() =>
                              handleCreateEquipment(equipmentName, "edit")
                            }
                            disabled={addingEquipment}
                          >
                            + {equipmentName}
                          </button>
                        ))}
                    </div>

                    <div className="room-equipment-create">
                      <input
                        value={newEquipmentName}
                        onChange={(event) =>
                          setNewEquipmentName(event.target.value)
                        }
                        placeholder="Nouvel equipement"
                      />
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() =>
                          handleCreateEquipment(newEquipmentName, "edit")
                        }
                        disabled={addingEquipment}
                      >
                        {addingEquipment ? "Ajout..." : "Ajouter"}
                      </button>
                    </div>
                  </div>

                  <div className="room-form-wide room-equipment-field">
                    <span>Image principale</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleMainImageUpload(e, "edit")}
                      disabled={uploadingEdit}
                    />
                    {uploadingEdit && (
                      <p className="ud-empty">Upload en cours...</p>
                    )}
                    {editRoomForm.image_principale && (
                      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={editRoomForm.image_principale}
                          alt="Image principale"
                          style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                        />
                        <button
                          type="button"
                          className="ud-btn-ghost"
                          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                          onClick={() => updateEditRoomForm("image_principale", "")}
                          disabled={uploadingEdit}
                        >
                          Retirer
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="room-form-wide room-equipment-field">
                    <span>Galerie de photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleGalleryUpload(e, "edit")}
                      disabled={uploadingEdit}
                    />
                    {editRoomForm.photos.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {editRoomForm.photos.map((url, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            <img
                              src={url}
                              alt={`Photo ${index + 1}`}
                              style={{ width: "70px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border)" }}
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryPhoto("edit", index)}
                              disabled={uploadingEdit}
                              style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--red, #e53e3e)", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", lineHeight: "18px", padding: 0 }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="room-form-wide">
                    Description
                    <textarea
                      value={editRoomForm.description}
                      onChange={(event) =>
                        updateEditRoomForm("description", event.target.value)
                      }
                      rows="4"
                    />
                  </label>

                  {editFormError && (
                    <p className="room-form-error">{editFormError}</p>
                  )}

                  {typesError && (
                    <p className="room-form-error">{typesError}</p>
                  )}

                  {equipmentCreateError && (
                    <p className="room-form-error">{equipmentCreateError}</p>
                  )}

                  <div className="room-form-actions">
                    <button
                      className="ud-btn-ghost"
                      type="button"
                      onClick={closeRoomDetails}
                      disabled={savingEditRoom || uploadingEdit}
                    >
                      Fermer
                    </button>
                    <button
                      className="btn-primary"
                      type="submit"
                      disabled={savingEditRoom || uploadingEdit}
                    >
                      {uploadingEdit ? "Upload en cours..." : savingEditRoom ? "Modification..." : "Enregistrer"}
                    </button>
                  </div>
                </form>

                <div className="ud-section">
                  <h4 className="ud-section-title">Equipements</h4>
                  {selectedRoom.equipements?.length ? (
                    <div className="ud-badges">
                      {selectedRoom.equipements.map((equipment) => (
                        <span key={equipment} className="badge b-done">
                          {equipment}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="ud-empty">Aucun equipement renseigne.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {roomToDelete && (
        <div className="ud-overlay" onClick={closeDeleteConfirm}>
          <div
            className="ud-panel room-delete-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="ud-close"
              type="button"
              onClick={closeDeleteConfirm}
            >
              x
            </button>

            <div>
              <h3 className="ud-name">Supprimer une salle</h3>
              <p className="ud-email">
                Cette action supprimera vraiment la salle.
              </p>
            </div>

            <div className="room-delete-box">
              <span className="ud-meta-label">Salle selectionnee</span>
              <strong>{roomToDelete.nom}</strong>
              <p>{getLocation(roomToDelete)}</p>
            </div>

            {deleteError && <p className="room-form-error">{deleteError}</p>}

            <div className="room-form-actions">
              <button
                className="ud-btn-ghost"
                type="button"
                onClick={closeDeleteConfirm}
                disabled={deletingRoom}
              >
                Annuler
              </button>
              <button
                className="ud-btn-danger"
                type="button"
                onClick={handleDeleteRoom}
                disabled={deletingRoom}
              >
                {deletingRoom ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
