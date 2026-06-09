import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import frLocale from "@fullcalendar/core/locales/fr"
import reservationService from "../../../services/reservationService"
import "./AdminStyle.css"

const STATUT_COLORS = {
  "en-attente": "#F59E0B",
  confirmee:    "#10B981",
  annulee:      "#EF4444",
  terminee:     "#6B7280",
  abandonne:    "#8B5CF6",
}

const STATUT_LABELS = {
  "en-attente": "En attente",
  confirmee:    "Confirmée",
  annulee:      "Annulée",
  terminee:     "Terminée",
  abandonne:    "Abandonnée",
}

const TYPE_LABELS = {
  heure:         "À l'heure",
  "demi-journee": "Demi-journée",
  journee:       "Journée",
}

const NAV_ROUTES = {
  Dashboard:    "/dashboardAdmin",
  Salles:       "/Gestionsalles",
  Reservations: "/GestionReservations",
  Utilisateurs: "/GestionUser",
}

function toDateStr(raw) {
  const d = new Date(raw)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function toEvent(r) {
  const dateStr = toDateStr(r.date)
  return {
    id:              String(r.id),
    title:           `${r.salle_nom} · ${r.utilisateur_nom}`,
    start:           `${dateStr}T${r.heure_debut}`,
    end:             `${dateStr}T${r.heure_fin}`,
    backgroundColor: STATUT_COLORS[r.statut] ?? "#1A56A0",
    borderColor:     STATUT_COLORS[r.statut] ?? "#1A56A0",
    extendedProps:   r,
  }
}

function formatHeure(h) {
  return h ? h.slice(0, 5) : "—"
}

function formatDate(raw) {
  if (!raw) return "—"
  return new Date(raw).toLocaleDateString("fr-FR")
}

export default function GestionReservations() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [typeTab, setTypeTab]   = useState("Heure")
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    reservationService
      .getAllReservations()
      .then((data) => setEvents(data.map(toEvent)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="topbar">Tableau de bord Admin</div>
      <div className="page-body">
        <div className="page-header">
          <h2 className="page-title">Gestion Réservations</h2>
        </div>

        <div className="filters-row">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="search-box" placeholder="Rechercher" />
          </div>
          <span className="flt-label">Filtres :</span>
          <select className="flt-select"><option>Salle ▾</option></select>
          <select className="flt-select"><option>Utilisateur ▾</option></select>
          <select className="flt-select"><option>Statut ▾</option></select>
          <span className="flt-label" style={{ marginLeft: "0.5rem" }}>Type:</span>
          <div className="type-tabs">
            {["Heure", "Demi-journée", "Journée"].map((t) => (
              <button
                key={t}
                className={`type-tab ${typeTab === t ? "active" : ""}`}
                onClick={() => setTypeTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="cal-layout">
          <div className="card card-pad" style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <p style={{ padding: "2rem", color: "var(--muted)", textAlign: "center" }}>
                Chargement des réservations…
              </p>
            ) : (
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={frLocale}
                headerToolbar={{
                  left:   "prev,next today",
                  center: "title",
                  right:  "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:30:00"
                allDaySlot={false}
                nowIndicator={true}
                events={events}
                height="auto"
                eventClick={({ event }) => setSelected(event.extendedProps)}
                eventContent={(arg) => (
                  <div
                    title={`${arg.event.extendedProps.salle_nom} — ${arg.event.extendedProps.utilisateur_nom}`}
                    style={{ padding: "2px 4px", fontSize: "0.74rem", overflow: "hidden", width: "100%", boxSizing: "border-box" }}
                  >
                    <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {arg.event.extendedProps.salle_nom}
                    </strong>
                    <span style={{ display: "block", opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {arg.event.extendedProps.utilisateur_nom}
                    </span>
                  </div>
                )}
              />
            )}
          </div>

          <div className="card plages-card">
            <p className="plages-title">Légende statuts</p>
            {Object.entries(STATUT_LABELS).map(([key, label]) => (
              <div key={key} className="plage-item">
                <div className="plage-bar" style={{ background: STATUT_COLORS[key] }} />
                <div>
                  <div className="plage-name">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="ud-overlay" onClick={() => setSelected(null)}>
          <div
            className="ud-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <button className="ud-close" onClick={() => setSelected(null)}>✕</button>

            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {selected.salle_nom}
              </h2>
              <p style={{ margin: "0.25rem 0 0", color: "var(--muted)", fontSize: "0.82rem" }}>
                Réservation #{selected.id}
              </p>
            </div>

            <div className="ud-meta">
              <div className="ud-meta-item">
                <span className="ud-meta-label">Utilisateur</span>
                <span className="ud-meta-val">{selected.utilisateur_nom}</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Date</span>
                <span className="ud-meta-val">{formatDate(selected.date)}</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Horaire</span>
                <span className="ud-meta-val">
                  {formatHeure(selected.heure_debut)} – {formatHeure(selected.heure_fin)}
                </span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Type</span>
                <span className="ud-meta-val">{TYPE_LABELS[selected.type_reservation] ?? selected.type_reservation}</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Prix</span>
                <span className="ud-meta-val">{selected.prix_total} €</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Statut</span>
                <span
                  className="ud-meta-val"
                  style={{ color: STATUT_COLORS[selected.statut] ?? "var(--text)", fontWeight: 600 }}
                >
                  {STATUT_LABELS[selected.statut] ?? selected.statut}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
