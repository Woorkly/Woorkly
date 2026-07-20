/*
  Rooms list page
  - Affiche les salles en 2 colonnes à gauche
  - Affiche une carte Leaflet à droite
  - Styles locaux dans `styles.css`
*/
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import useRooms from '../../hooks/useRooms'
import Button from '../../components/Button'
import api from '../../services/api'
import { equipmentService } from '../../services/equipmentService'
import './Styles.css'

// Fix marker icon for leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function Salle() {
  const [filters, setFilters] = useState({
    date: '',
    capacite_min: '',
    type_id: '',
    equipement_id: '',
  })
  const [villeInput, setVilleInput] = useState('')
  const [debouncedVille, setDebouncedVille] = useState('')
  const [types, setTypes] = useState([])
  const [equipements, setEquipements] = useState([])

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/types')
        setTypes(Array.isArray(res.data) ? res.data : [])
      } catch {
        setTypes([])
      }
    }

    fetchTypes()
  }, [])

  useEffect(() => {
    const fetchEquipements = async () => {
      try {
        const data = await equipmentService.getEquipments()
        setEquipements(Array.isArray(data) ? data : [])
      } catch {
        setEquipements([])
      }
    }

    fetchEquipements()
  }, [])

  const appliedFilters = useMemo(() => {
    if (!filters.date) return {}
    return {
      date: filters.date,
      ville: debouncedVille.trim() || undefined,
      capacite_min: filters.capacite_min || undefined,
      type_id: filters.type_id || undefined,
      equipement_id: filters.equipement_id || undefined,
    }
  }, [filters, debouncedVille])

  useEffect(() => {
    const debounceId = setTimeout(() => {
      setDebouncedVille(villeInput)
    }, 1000)

    return () => clearTimeout(debounceId)
  }, [villeInput])

  const { rooms, loading, error } = useRooms(appliedFilters)

  const getRoomImageSrc = (imageName) => {
    const value = (imageName || '').trim()
    if (/^https?:\/\//i.test(value)) return value
    return `/images/${value || 'default-room.jpg'}`
  }


  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setVilleInput('')
    setDebouncedVille('')
    setFilters({ date: '', capacite_min: '', type_id: '', equipement_id: '' })
  }

  // Calculate center of map from rooms with valid coordinates
  const validRooms = rooms.filter((r) =>
    r.latitude && r.longitude &&
    !isNaN(parseFloat(r.latitude)) && !isNaN(parseFloat(r.longitude))
  )

  const mapCenter = validRooms.length > 0
    ? [
        validRooms.reduce((sum, r) => sum + parseFloat(r.latitude), 0) / validRooms.length,
        validRooms.reduce((sum, r) => sum + parseFloat(r.longitude), 0) / validRooms.length,
      ]
    : [48.8566, 2.3522] // Paris center by default

  const roomMarkerIcon = L.divIcon({
    className: 'room-marker-icon',
    html: '<span class="room-marker-dot"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })

  if (loading) return <div className="rooms-page"><div style={{ padding: 32 }}>Chargement...</div></div>
  if (error) return <div className="rooms-page"><div style={{ padding: 32, color: 'var(--color-danger)' }}>Erreur: {error}</div></div>

  return (
    <section className="rooms-page">
      <div className="rooms-container">
        <div className="rooms-top-section">
          <h1>Trouvez la salle idéale</h1>
          <p className="rooms-subtitle">Sélectionnez l'emplacement et les équipements qui conviennent à votre événement.</p>

          <div className="rooms-filters">
            <label>
              Date
              <input
                type="date"
                value={filters.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFilter('date', e.target.value)}
              />
            </label>

            <label>
              Ville
              <input
                type="text"
                placeholder="Ex: Paris"
                value={villeInput}
                onChange={(e) => setVilleInput(e.target.value)}
                disabled={!filters.date}
              />
            </label>

            <label>
              Capacité min
              <input
                type="number"
                min="1"
                placeholder="Ex: 8"
                value={filters.capacite_min}
                onChange={(e) => updateFilter('capacite_min', e.target.value)}
                disabled={!filters.date}
              />
            </label>

            <label>
              Type de salle
              <select
                value={filters.type_id}
                onChange={(e) => updateFilter('type_id', e.target.value)}
                disabled={!filters.date}
              >
                <option value="">Tous les types</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </select>
            </label>

            <label>
              Équipement
              <select
                value={filters.equipement_id}
                onChange={(e) => updateFilter('equipement_id', e.target.value)}
                disabled={!filters.date}
              >
                <option value="">Tous les équipements</option>
                {equipements.map((equipement) => (
                  <option key={equipement.id} value={equipement.id}>{equipement.nom}</option>
                ))}
              </select>
            </label>

            <button type="button" className="filters-reset" onClick={resetFilters}>
              Réinitialiser
            </button>
          </div>

          {!filters.date && (
            <p className="filters-hint">Sélectionne une date pour activer les filtres de disponibilité.</p>
          )}
        </div>

        {/* Left: Rooms list */}
        <div className="rooms-list-section">
          {rooms.length === 0 ? (
            <p className="no-rooms">Aucune salle trouvée.</p>
          ) : (
            <div className="rooms-list-grid">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-image-wrapper">
                    <img
                      src={getRoomImageSrc(room.image_principale)}
                      alt={room.nom}
                      className="room-image"
                    />
                    <span className="room-badge">{room.type_nom}</span>
                  </div>
                  
                  <div className="room-content">
                    <h3>{room.nom}</h3>
                    <p className="room-location">📍 {room.adresse}, {room.code_postal} {room.ville}</p>
                    
                    {/* <div className="room-info">
                      <span className="info-badge">
                        👥 {room.capacite} personnes
                      </span>
                      <span className="info-badge">
                        💵 à partir de {room.prix_heure}€/h
                      </span>
                    </div> */}
                    
                    <Link
                      to={`/salle/${room.id}${filters.date ? `?date=${encodeURIComponent(filters.date)}` : ''}`}
                      className="room-card-btn"
                    >
                      <Button variant="secondary" className="room-card-detail-btn" style={{ width: '100%' }}>
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="rooms-map-section">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            className="rooms-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validRooms.map((room) => (
              <Marker
                key={room.id}
                position={[parseFloat(room.latitude), parseFloat(room.longitude)]}
                icon={roomMarkerIcon}
              >
                <Popup>
                  <div className="marker-popup">
                    <h4>{room.nom}</h4>
                    <p>{room.adresse}</p>
                    <p>{room.capacite} personnes</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  )
}
