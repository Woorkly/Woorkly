import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashBoardAdmin/adminStyle.css"

const DAYS  = ["Oct 15", "Lun 16", "Mar 17", "Mer 18", "Jeu 19", "Ven 20", "Sam 21"];
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17];

// Événements: day=index colonne (0-6), startH=heure début, rows=nb lignes occupées
const EVENTS = [
  { day:1, startH:14, rows:2, label:"14:00-15:00\nInnovation Hub\n(Team Meeting)", cls:"ev-green"  },
  { day:3, startH:11, rows:2, label:"11:00-13:00\nBoardroom A\n(Présentation)",    cls:"ev-orange" },
  { day:4, startH:11, rows:1, label:"11:00-13:00\nBoardroom A",                    cls:"ev-blue"   },
  { day:4, startH:14, rows:2, label:"14:00-15:00\nAteliers",                       cls:"ev-teal"   },
];

const PLAGES = [
  { nom:"Innovation Hub",   slots:"25 slots", color:"#1A56A0" },
  { nom:"Boardroom A",      slots:"12 slots", color:"#F59E0B" },
  { nom:"Creativity Suite", slots:"15 slots", color:"#10B981" },
  { nom:"Boardroom B",      slots:"15 slots", color:"#38BDF8" },
];

const ROW_H = 46; // hauteur en px d'une ligne heure

const NAV_ROUTES = {
  Dashboard:    "/dashboardAdmin",
  Salles:       "/Gestionsalles",
  Reservations: "/GestionReservations",
  Utilisateurs: "/GestionUser",
};

export default function GestionReservations() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [typeTab, setTypeTab] = useState("Heure");

  return (
    <div className="admin-wrap">
      <aside className="sidebar">
        <div className="sidebar-logo">Woorkly<span>,</span></div>
        <nav className="sidebar-nav">
          {["Dashboard", "Salles", "Reservations", "Utilisateurs"].map((p) => (
            <button key={p} className={`snav-btn ${NAV_ROUTES[p] === pathname ? "active" : ""}`} onClick={() => navigate(NAV_ROUTES[p])}>{p}</button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="topbar">Tableau de bord Admin</div>
        <div className="page-body">

          <div className="page-header">
            <h2 className="page-title">Gestion Réservations</h2>
            <button className="btn-primary">+ Nouvelle Réservations</button>
          </div>

          <div className="filters-row">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="search-box" placeholder="Rechercher" />
            </div>
            <span className="flt-label">Filtres :</span>
            <select className="flt-select"><option>Salle ▾</option></select>
            <select className="flt-select"><option>Utilisateur ▾</option></select>
            <select className="flt-select"><option>Statut ▾</option></select>
            <span className="flt-label" style={{ marginLeft:"0.5rem" }}>Type:</span>
            <div className="type-tabs">
              {["Heure", "Demi-journée", "Journée"].map((t) => (
                <button key={t} className={`type-tab ${typeTab === t ? "active" : ""}`} onClick={() => setTypeTab(t)}>{t}</button>
              ))}
            </div>
            <span style={{ marginLeft:"auto", fontSize:"0.78rem", color:"var(--primary)", cursor:"pointer", textDecoration:"underline" }}>
              Nouvelle réservation
            </span>
          </div>

          <div className="cal-layout">
            {/* Calendrier */}
            <div className="card card-pad">
              <div className="cal-nav">
                <h2>Oct 15 - 21</h2>
                <button className="cal-nav-btn">‹</button>
                <button className="cal-today-btn">Today</button>
                <button className="cal-nav-btn">›</button>
                <button className="cal-nav-btn">»</button>
              </div>

              <div className="cal-grid">
                {/* Header */}
                <div className="cal-head-row">
                  <div className="cal-head-cell">Heure</div>
                  {DAYS.map((d, i) => <div key={i} className="cal-head-cell">{d}</div>)}
                </div>

                {/* Body */}
                {HOURS.map((h) => (
                  <div key={h} className="cal-row">
                    <div className="cal-time-cell">{h}:00</div>
                    {DAYS.map((_, di) => {
                      const ev = EVENTS.find((e) => e.day === di && e.startH === h);
                      return (
                        <div key={di} className="cal-cell" style={{ height: ROW_H }}>
                          {ev && (
                            <div
                              className={`cal-event ${ev.cls}`}
                              style={{ height: ev.rows * ROW_H - 6 }}
                            >
                              {ev.label.split("\n").map((line, li) => (
                                <span key={li} style={{ display:"block" }}>{line}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Plages horaires */}
            <div className="card plages-card">
              <p className="plages-title">Plages horaires</p>
              {PLAGES.map((p, i) => (
                <div key={i} className="plage-item">
                  <div className="plage-bar" style={{ background: p.color }} />
                  <div>
                    <div className="plage-name">{p.nom}</div>
                    <div className="plage-slots">({p.slots})</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}