/**
 * Page Gestion Réservations (admin).
 *
 * Affiche :
 *   - Filtres : salle, utilisateur, statut, type de réservation
 *   - Calendrier FullCalendar (vue semaine par défaut, couleurs par statut)
 *   - Légende des statuts
 *   - Panel détail au clic sur un événement (modifier le statut : confirmer / annuler)
 */

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin   from '@fullcalendar/timegrid';
import dayGridPlugin    from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale         from '@fullcalendar/core/locales/fr';

import reservationService from '../../../services/reservationService';

/* Utilitaires de date */
import { formatDateShort, formatHeure } from '../../../utils/dateUtils';

import './AdminStyle.css';

/* ── Configuration des statuts ───────────────────────────────── */

const STATUT_COLORS = {
  'en-attente': '#F59E0B',
  confirmee:    '#10B981',
  annulee:      '#EF4444',
  terminee:     '#6B7280',
  abandonne:    '#8B5CF6',
};

const STATUT_LABELS = {
  'en-attente': 'En attente',
  confirmee:    'Confirmée',
  annulee:      'Annulée',
  terminee:     'Terminée',
  abandonne:    'Abandonnée',
};

const TYPE_LABELS = {
  heure:          "À l'heure",
  'demi-journee': 'Demi-journée',
  journee:        'Journée',
};

/* ── Helpers ─────────────────────────────────────────────────── */

/** Convertit une réservation API en événement FullCalendar. */
function toDateStr(raw) {
  const d   = new Date(raw);
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toEvent(r) {
  const dateStr = toDateStr(r.date);
  return {
    id:              String(r.id),
    title:           `${r.salle_nom} · ${r.utilisateur_nom}`,
    start:           `${dateStr}T${r.heure_debut}`,
    end:             `${dateStr}T${r.heure_fin}`,
    backgroundColor: STATUT_COLORS[r.statut] ?? '#1A56A0',
    borderColor:     STATUT_COLORS[r.statut] ?? '#1A56A0',
    extendedProps:   r,
  };
}

/* ── Page principale ─────────────────────────────────────────── */

export default function GestionReservations() {
  const [events,        setEvents]       = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [selected,      setSelected]     = useState(null);
  const [salles,        setSalles]       = useState([]);
  const [utilisateurs,  setUtilisateurs] = useState([]);
  const [filters,       setFilters]      = useState({
    salle_id: '', utilisateur_id: '', statut: '', type_reservation: '',
  });

  /* Chargement initial des listes pour les menus déroulants */
  useEffect(() => {
    reservationService.getFiltersData()
      .then(({ salles, utilisateurs }) => { setSalles(salles); setUtilisateurs(utilisateurs); })
      .catch(() => {});
  }, []);

  /* Re-fetch à chaque changement de filtre */
  useEffect(() => {
    setLoading(true);
    reservationService
      .getAllReservations(filters)
      .then((data) => setEvents(data.map(toEvent)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  /** Mise à jour du statut : API + state local (calendrier + panel). */
  const handleStatut = async (newStatut) => {
    const id = selected.id;
    await reservationService.updateStatut(id, newStatut);
    setEvents((prev) =>
      prev.map((ev) =>
        Number(ev.id) === id
          ? {
              ...ev,
              backgroundColor: STATUT_COLORS[newStatut] ?? ev.backgroundColor,
              borderColor:     STATUT_COLORS[newStatut] ?? ev.borderColor,
              extendedProps:   { ...ev.extendedProps, statut: newStatut },
            }
          : ev
      )
    );
    setSelected((prev) => ({ ...prev, statut: newStatut }));
  };

  const hasActiveFilter = filters.salle_id || filters.utilisateur_id
    || filters.statut || filters.type_reservation;

  return (
    <>
      <div className="topbar">Tableau de bord Admin</div>
      <div className="page-body">
        <div className="page-header">
          <h2 className="page-title">Gestion Réservations</h2>
        </div>

        {/* ── Filtres ── */}
        <div className="filters-row">
          <span className="flt-label">Filtres :</span>

          <select className="flt-select" value={filters.salle_id}
            onChange={(e) => setFilter('salle_id', e.target.value)}>
            <option value="">Toutes les salles</option>
            {salles.map((s) => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>

          <select className="flt-select" value={filters.utilisateur_id}
            onChange={(e) => setFilter('utilisateur_id', e.target.value)}>
            <option value="">Tous les utilisateurs</option>
            {utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>{u.nom}</option>
            ))}
          </select>

          <select className="flt-select" value={filters.statut}
            onChange={(e) => setFilter('statut', e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="en-attente">En attente</option>
            <option value="confirmee">Confirmée</option>
            <option value="annulee">Annulée</option>
            <option value="abandonne">Abandonnée</option>
            <option value="terminee">Terminée</option>
          </select>

          <span className="flt-label" style={{ marginLeft: '0.5rem' }}>Type :</span>
          <div className="type-tabs">
            {[
              { label: 'Heure',        value: 'heure'        },
              { label: 'Demi-journée', value: 'demi-journee' },
              { label: 'Journée',      value: 'journee'      },
            ].map(({ label, value }) => (
              <button
                key={value}
                className={`type-tab ${filters.type_reservation === value ? 'active' : ''}`}
                onClick={() => setFilter('type_reservation', filters.type_reservation === value ? '' : value)}
              >
                {label}
              </button>
            ))}
          </div>

          {hasActiveFilter && (
            <button
              className="type-tab"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => setFilters({ salle_id: '', utilisateur_id: '', statut: '', type_reservation: '' })}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* ── Calendrier + Légende ── */}
        <div className="cal-layout">
          <div className="card card-pad" style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <p style={{ padding: '2rem', color: 'var(--muted)', textAlign: 'center' }}>
                Chargement des réservations…
              </p>
            ) : (
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={frLocale}
                headerToolbar={{
                  left:   'prev,next today',
                  center: 'title',
                  right:  'dayGridMonth,timeGridWeek,timeGridDay',
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
                    style={{ padding: '2px 4px', fontSize: '0.74rem', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}
                  >
                    <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {arg.event.extendedProps.salle_nom}
                    </strong>
                    <span style={{ display: 'block', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {arg.event.extendedProps.utilisateur_nom}
                    </span>
                  </div>
                )}
              />
            )}
          </div>

          {/* Légende statuts */}
          <div className="card plages-card">
            <p className="plages-title">Légende statuts</p>
            {Object.entries(STATUT_LABELS).map(([key, label]) => (
              <div key={key} className="plage-item">
                <div className="plage-bar" style={{ background: STATUT_COLORS[key] }} />
                <div className="plage-name">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel détail réservation ── */}
      {selected && (
        <div className="ud-overlay" onClick={() => setSelected(null)}>
          <div className="ud-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="ud-close" onClick={() => setSelected(null)}>✕</button>

            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {selected.salle_nom}
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.82rem' }}>
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
                <span className="ud-meta-val">{formatDateShort(selected.date)}</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Horaire</span>
                <span className="ud-meta-val">
                  {formatHeure(selected.heure_debut)} – {formatHeure(selected.heure_fin)}
                </span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Type</span>
                <span className="ud-meta-val">
                  {TYPE_LABELS[selected.type_reservation] ?? selected.type_reservation}
                </span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Prix</span>
                <span className="ud-meta-val">{selected.prix_total} €</span>
              </div>
              <div className="ud-meta-item">
                <span className="ud-meta-label">Statut</span>
                <span
                  className="ud-meta-val"
                  style={{ color: STATUT_COLORS[selected.statut] ?? 'var(--text)', fontWeight: 600 }}
                >
                  {STATUT_LABELS[selected.statut] ?? selected.statut}
                </span>
              </div>
            </div>

            {/* Boutons d'action sur le statut */}
            {(selected.statut === 'en-attente' || selected.statut === 'confirmee') && (
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
                {selected.statut === 'en-attente' && (
                  <button
                    onClick={() => handleStatut('confirmee')}
                    style={{
                      flex: 1, padding: '0.55rem 0', borderRadius: 8, border: 'none',
                      background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                    }}
                  >
                    ✓ Confirmer
                  </button>
                )}
                <button
                  onClick={() => handleStatut('annulee')}
                  style={{
                    flex: 1, padding: '0.55rem 0', borderRadius: 8, border: 'none',
                    background: '#EF4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                  }}
                >
                  ✕ Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
