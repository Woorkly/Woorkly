import { useEffect, useState } from "react";
import { roomService } from "../../../services/roomService";
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

  return <span className={`badge ${m[s] || ""}`}>{labels[s] || s || "Non renseigne"}</span>;
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
  type_id: "",
};

export default function GestionSalles() {
  const [search, setSearch] = useState("");
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await roomService.getRooms();
        setSalles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des salles");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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
    [room.adresse, room.code_postal, room.ville].filter(Boolean).join(", ") || "Non renseigne";

  const openCreateForm = () => {
    setRoomForm(initialRoomForm);
    setIsCreateOpen(true);
  };

  const closeCreateForm = () => {
    setIsCreateOpen(false);
  };

  const updateRoomForm = (field, value) => {
    setRoomForm((current) => ({ ...current, [field]: value }));
  };

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
          <select className="flt-select">
            <option>Capacité ▾</option>
            <option>≤ 12</option>
            <option>13–20</option>
            <option>&gt; 20</option>
          </select>
          <select className="flt-select">
            <option>Équipements ▾</option>
            <option>Projector</option>
            <option>Screen</option>
            <option>Whiteboard</option>
          </select>
          <select className="flt-select" style={{ marginLeft: "auto" }}>
            <option>Ainas delive ▾</option>
          </select>
        </div>

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
                      Aucune salle trouvee.
                    </td>
                  </tr>
                )}

                {!loading && !error && filtered.map((s) => {
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
                      <td style={{ fontSize: "0.79rem", color: "var(--muted)" }}>
                        {s.type_nom || "Non renseigne"}
                      </td>
                      <td>
                        <Badge s={s.statut} />
                      </td>
                      <td>
                        <button className="act-btn" type="button">
                          <IconEdit />
                        </button>
                        <button className="act-btn" type="button">
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
          <div className="ud-panel room-form-panel" onClick={(event) => event.stopPropagation()}>
            <button className="ud-close" type="button" onClick={closeCreateForm}>
              x
            </button>

            <div>
              <h3 className="ud-name">Ajouter une salle</h3>
              <p className="ud-email">Prepare les informations de la salle avant enregistrement.</p>
            </div>

            <form className="room-form" onSubmit={(event) => event.preventDefault()}>
              <label>
                Nom
                <input
                  value={roomForm.nom}
                  onChange={(event) => updateRoomForm("nom", event.target.value)}
                  placeholder="Nom de la salle"
                />
              </label>

              <label>
                Statut
                <select
                  value={roomForm.statut}
                  onChange={(event) => updateRoomForm("statut", event.target.value)}
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservee">Reservee</option>
                  <option value="hors-service">Hors service</option>
                </select>
              </label>

              <label>
                Adresse
                <input
                  value={roomForm.adresse}
                  onChange={(event) => updateRoomForm("adresse", event.target.value)}
                  placeholder="Adresse"
                />
              </label>

              <label>
                Code postal
                <input
                  value={roomForm.code_postal}
                  onChange={(event) => updateRoomForm("code_postal", event.target.value)}
                  placeholder="13001"
                />
              </label>

              <label>
                Ville
                <input
                  value={roomForm.ville}
                  onChange={(event) => updateRoomForm("ville", event.target.value)}
                  placeholder="Marseille"
                />
              </label>

              <label>
                Capacite
                <input
                  type="number"
                  min="1"
                  value={roomForm.capacite}
                  onChange={(event) => updateRoomForm("capacite", event.target.value)}
                  placeholder="12"
                />
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  value={roomForm.latitude}
                  onChange={(event) => updateRoomForm("latitude", event.target.value)}
                  placeholder="43.296"
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  value={roomForm.longitude}
                  onChange={(event) => updateRoomForm("longitude", event.target.value)}
                  placeholder="5.376"
                />
              </label>

              <label>
                Prix heure
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomForm.prix_heure}
                  onChange={(event) => updateRoomForm("prix_heure", event.target.value)}
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
                  onChange={(event) => updateRoomForm("prix_demi_journee", event.target.value)}
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
                  onChange={(event) => updateRoomForm("prix_journee", event.target.value)}
                  placeholder="160.00"
                />
              </label>

              <label>
                Type ID
                <input
                  type="number"
                  min="1"
                  value={roomForm.type_id}
                  onChange={(event) => updateRoomForm("type_id", event.target.value)}
                  placeholder="2"
                />
              </label>

              <label className="room-form-wide">
                Image principale
                <input
                  value={roomForm.image_principale}
                  onChange={(event) => updateRoomForm("image_principale", event.target.value)}
                  placeholder="default-room.jpg"
                />
              </label>

              <label className="room-form-wide">
                Description
                <textarea
                  value={roomForm.description}
                  onChange={(event) => updateRoomForm("description", event.target.value)}
                  placeholder="Description de la salle"
                  rows="4"
                />
              </label>

              <div className="room-form-actions">
                <button className="ud-btn-ghost" type="button" onClick={closeCreateForm}>
                  Annuler
                </button>
                <button className="btn-primary" type="submit">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
