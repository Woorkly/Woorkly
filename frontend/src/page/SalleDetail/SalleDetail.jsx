import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { roomService } from "../../services/roomService";
import "./SalleDetail.css";

const DEFAULT_ROOM_IMAGE = "/images/default-room.jpg";
const DEFAULT_MAP_CENTER = [48.8566, 2.3522];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const getRoomImageSrc = (imageName) => {
  const value = (imageName || "").trim();
  if (!value) return DEFAULT_ROOM_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `/images/${value}`;
};

const formatPrice = (room) => {
  if (room.prix_journee) return `A partir de ${room.prix_journee} EUR / jour`;
  if (room.prix_demi_journee) return `A partir de ${room.prix_demi_journee} EUR / demi-journee`;
  if (room.prix_heure) return `A partir de ${room.prix_heure} EUR / heure`;
  return "Tarif sur demande";
};

const hasValidCoordinates = (room) =>
  room?.latitude &&
  room?.longitude &&
  !Number.isNaN(parseFloat(room.latitude)) &&
  !Number.isNaN(parseFloat(room.longitude));

const SalleDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await roomService.getRoomById(id);
        setRoom(data);
      } catch (err) {
        const status = err.response?.status;
        setError(status === 404 ? "Salle introuvable" : "Erreur lors du chargement de la salle");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const images = useMemo(() => {
    if (!room) return [DEFAULT_ROOM_IMAGE];

    const allImages = [room.image_principale, ...(room.galerie || [])]
      .filter(Boolean)
      .map(getRoomImageSrc);

    return allImages.length ? allImages : [DEFAULT_ROOM_IMAGE];
  }, [room]);

  if (loading) {
    return (
      <div className="room-not-found">
        <h1>Chargement...</h1>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="room-not-found">
        <h1>{error || "Salle introuvable"}</h1>
      </div>
    );
  }

  const equipments = room.equipements || [];
  const isAvailable = room.statut === "disponible";
  const location = [room.adresse, room.code_postal, room.ville].filter(Boolean).join(", ");
  const mapPosition = hasValidCoordinates(room)
    ? [parseFloat(room.latitude), parseFloat(room.longitude)]
    : DEFAULT_MAP_CENTER;

  const roomMarkerIcon = L.divIcon({
    className: "room-detail-marker-icon",
    html: '<span class="room-detail-marker-dot"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  return (
    <main className="room-detail-page">
      <section className={`room-gallery ${images.length === 1 ? "single-image" : ""}`}>
        <div className="main-image">
          <img src={images[0]} alt={room.nom} />
        </div>

        {images.length > 1 && (
          <div className="small-images">
            {images.slice(1, 5).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${room.nom} ${index + 2}`} />
            ))}
          </div>
        )}
      </section>

      <section className="room-tabs">
        <span>Description</span>
        <span>Offres</span>
        <span>Localisation</span>
        <span>Services et equipements</span>
        <span>Plan d'espace</span>
      </section>

      <section className="room-info">
        <div className="room-main-content">
          <p className="room-location">{location || room.ville}</p>

          <h1>{room.nom}</h1>

          <div className="room-meta">
            <span>{room.capacite} personnes</span>
            {room.type_nom && <span>{room.type_nom}</span>}

            <span className={isAvailable ? "available-badge" : "unavailable-badge"}>
              {isAvailable ? "Disponible" : "Indisponible"}
            </span>
          </div>

          <p className="room-description">{room.description}</p>

          <div className="room-section">
            <h2>Equipements</h2>

            {equipments.length > 0 ? (
              <div className="equipments-list">
                {equipments.map((equipment) => (
                  <span key={equipment} className="equipment-item">
                    {equipment}
                  </span>
                ))}
              </div>
            ) : (
              <p>Aucun equipement renseigne.</p>
            )}
          </div>
        </div>

        <aside className="room-side-card">
          <p>{formatPrice(room)}</p>

          <button type="button">Voir les disponibilites</button>

          <span>Sans engagement</span>
        </aside>
      </section>

      <section className="room-map-section">
        <div className="room-map-header">
          <p className="room-map-address">{location || "Adresse a confirmer"}</p>
          <h2>Localisation</h2>
        </div>

        <MapContainer
          center={mapPosition}
          zoom={15}
          scrollWheelZoom={false}
          className="room-detail-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={mapPosition} icon={roomMarkerIcon}>
            <Popup>
              <div className="room-detail-popup">
                <h4>{room.nom}</h4>
                <p>{location || room.ville || "Adresse a confirmer"}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </section>
    </main>
  );
};

export default SalleDetail;
