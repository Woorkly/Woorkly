import { useState } from "react";
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

const salles = [
  {
    id: 1,
    nom: "Innovation Hub",
    cap: 25,
    loc: "Floor 3",
    equip: "Projector, Visio, Screen",
    statut: "Disponible",
    icon: icons.hub,
  },
  {
    id: 2,
    nom: "Boardroom A",
    cap: 12,
    loc: "Floor 4",
    equip: "Screen",
    statut: "Blue",
    icon: icons.boardroom,
  },
  {
    id: 3,
    nom: "Creativity Suite",
    cap: 15,
    loc: "Floor 2",
    equip: "Whiteboard",
    statut: "Hors Service",
    icon: icons.creative,
  },
  {
    id: 4,
    nom: "Creativity Suite B",
    cap: 15,
    loc: "Floor 2",
    equip: "Whiteboard",
    statut: "Disponible",
    icon: icons.screen,
  },
  {
    id: 5,
    nom: "Boardroom B",
    cap: 12,
    loc: "Floor 4",
    equip: "Screen",
    statut: "Disponible",
    icon: icons.office,
  },
];

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
    Disponible: "b-available",
    Blue: "b-blue",
    "Hors Service": "b-offline",
  };
  return <span className={`badge ${m[s] || ""}`}>{s}</span>;
}

export default function GestionSalles() {
  const [search, setSearch] = useState("");
  const filtered = salles.filter((s) =>
    s.nom.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="topbar">Gestion Salles</div>
      <div className="page-body">
        <div className="page-header">
          <h2 className="page-title">Gestion Salles</h2>
          <button className="btn-primary">+ Ajouter une salle</button>
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
                  <th>Status</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="room-thumb">{s.icon}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.nom}</td>
                    <td>{s.cap}</td>
                    <td>{s.loc}</td>
                    <td style={{ fontSize: "0.79rem", color: "var(--muted)" }}>
                      {s.equip}
                    </td>
                    <td>
                      <Badge s={s.statut} />
                    </td>
                    <td>
                      <button className="act-btn">
                        <IconEdit />
                      </button>
                      <button className="act-btn">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
