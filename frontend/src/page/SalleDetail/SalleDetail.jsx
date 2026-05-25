import React from "react";
import { useParams } from "react-router-dom";
import "./SalleDetail.css";

const salles = [
  {
    id: "1",
    name: "Salle Horizon",
    location: "Marseille",
    capacity: 12,
    available: true,
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Salle lumineuse idéale pour les réunions d’équipe, les présentations et les moments de travail collaboratif. Elle offre un cadre calme, confortable et adapté aux besoins professionnels.",
    equipments: ["Wi-Fi", "Écran", "Tableau blanc", "Climatisation", "Prises"],
  },
  {
    id: "2",
    name: "Salle Nova",
    location: "Paris",
    capacity: 8,
    available: false,
    images: [
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Petite salle moderne adaptée aux réunions rapides, aux échanges d’équipe et aux rendez-vous professionnels en petit comité.",
    equipments: ["Wi-Fi", "TV", "Prises USB", "Table ronde"],
  },
];

const SalleDetail = () => {
  const { id } = useParams();

  const room = salles.find((salle) => salle.id === id);

  if (!room) {
    return (
      <div className="room-not-found">
        <h1>Salle introuvable</h1>
      </div>
    );
  }

  return (
    <main className="room-detail-page">
      <section className="room-gallery">
        <div className="main-image">
          <img src={room.images[0]} alt={room.name} />
        </div>

        <div className="small-images">
          {room.images.slice(1).map((image, index) => (
            <img key={index} src={image} alt={`${room.name} ${index + 1}`} />
          ))}
        </div>
      </section>

      <section className="room-tabs">
        <span>Description</span>
        <span>Offres</span>
        <span>Localisation</span>
        <span>Services et équipements</span>
        <span>Plan d’espace</span>
      </section>

      <section className="room-info">
        <div className="room-main-content">
          <p className="room-location">{room.location}</p>

          <h1>{room.name}</h1>

          <div className="room-meta">
            <span>{room.capacity} personnes</span>

            <span className={room.available ? "available-badge" : "unavailable-badge"}>
              {room.available ? "Disponible" : "Indisponible"}
            </span>
          </div>

          <p className="room-description">{room.description}</p>

          <div className="room-section">
            <h2>Équipements</h2>

            <div className="equipments-list">
              {room.equipments.map((equipment, index) => (
                <span key={index} className="equipment-item">
                  {equipment}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="room-side-card">
          <p>À partir de 80€ / jour</p>

          <button>Voir les disponibilités</button>

          <span>Sans engagement</span>
        </aside>
      </section>
    </main>
  );
};

export default SalleDetail;