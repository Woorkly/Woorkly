import React from "react";
import { useParams } from "react-router-dom";
import "./salleDetail.css";

const salles = [
  {
    id: "1",
    name: "Salle Horizon",
    location: "Marseille",
    capacity: 12,
    available: true,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    description:
      "Salle lumineuse idéale pour les réunions d’équipe et les présentations.",
    equipments: [
      "Wi-Fi",
      "Écran",
      "Tableau blanc",
      "Climatisation",
    ],
  },
  {
    id: "2",
    name: "Salle Nova",
    location: "Paris",
    capacity: 8,
    available: false,
    image:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop",
    description:
      "Petite salle moderne adaptée aux réunions rapides et au travail collaboratif.",
    equipments: ["Wi-Fi", "TV", "Prises USB"],
  },
];

const SalleDetail = () => {
  const { id } = useParams();

  const room = salles.find((salle) => salle.id === id);

  if (!room) {
  return (
  <div style={{ color: "white", padding: "100px" }}>
    <h1>TEST PAGE DETAIL</h1>
  </div>
);
  }

  return (
    <div className="room-detail-page">
      <div className="room-hero">
        <img src={room.image} alt={room.name} />

        <div className="room-hero-content">
          <h1>{room.name}</h1>

          <p>{room.location}</p>

          <p>{room.capacity} personnes</p>

          <span
            className={
              room.available ? "available-badge" : "unavailable-badge"
            }
          >
            {room.available ? "Disponible" : "Indisponible"}
          </span>
        </div>
      </div>

      <div className="room-content">
        <div className="room-left">
          <section className="room-section">
            <h2>Description</h2>
            <p>{room.description}</p>
          </section>

          <section className="room-section">
            <h2>Équipements</h2>

            <div className="equipments-list">
              {room.equipments.map((equipment, index) => (
                <span key={index} className="equipment-item">
                  {equipment}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="reservation-card">
          <h2>Réserver</h2>

          <label>Date</label>
          <input type="date" />

          <label>Heure de début</label>
          <input type="time" />

          <label>Heure de fin</label>
          <input type="time" />

          <button disabled={!room.available}>
            {room.available ? "Réserver" : "Indisponible"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalleDetail;