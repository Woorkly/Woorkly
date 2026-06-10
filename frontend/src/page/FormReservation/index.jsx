import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";
import useRooms from "../../hooks/useRooms";
import useReservation from "../../hooks/useReservation";

const DEMI_PERIODES = {
  matin:        { heureDebut: "08:00", heureFin: "12:00" },
  "apres-midi": { heureDebut: "13:00", heureFin: "18:00" },
};

const getTodayInputValue = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
};

export default function ReservationPage() {
  const { roomId } = useParams();
  const { room, loading: roomLoading, error: roomError } = useRooms({ roomId });
  const { createReservation, loading: submitting, error: reservationError } = useReservation();

  const [formule, setFormule]         = useState("heure");
  const [demiPeriode, setDemiPeriode] = useState("matin");
  const [date, setDate]               = useState("");
  const [heureDebut, setHeureDebut]   = useState("08:00");
  const [heureFin, setHeureFin]       = useState("10:00");
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError]         = useState("");

  const minDate = getTodayInputValue();

  useEffect(() => {
    if (formule === "heure") {
      setHeureDebut("08:00");
      setHeureFin("10:00");
    } else if (formule === "demi-journée") {
      const p = DEMI_PERIODES[demiPeriode];
      setHeureDebut(p.heureDebut);
      setHeureFin(p.heureFin);
    } else {
      // journée : bloque l'intégralité de la journée de travail
      setHeureDebut("08:00");
      setHeureFin("18:00");
    }
  }, [formule, demiPeriode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setLocalError("");

    if (!room?.id) {
      setLocalError("La salle sélectionnée est introuvable.");
      return;
    }

    if (!date) {
      setLocalError("Veuillez choisir une date.");
      return;
    }

    if (date < minDate) {
      setLocalError("Vous ne pouvez pas réserver une date antérieure à aujourd'hui.");
      return;
    }

    const [y, mo, d] = date.split("-").map(Number);
    const weekday = new Date(y, mo - 1, d).getDay();
    if (weekday === 0 || weekday === 6) {
      setLocalError("Les réservations ne sont pas disponibles le week-end.");
      return;
    }

    if (!heureDebut || !heureFin) {
      setLocalError("Veuillez renseigner les horaires de réservation.");
      return;
    }

    try {
      const payload = {
        salle_id: room.id,
        date,
        heure_debut: heureDebut,
        heure_fin:   heureFin,
        type_reservation: formule,
      };

      const created = await createReservation(payload);
      setSuccessMessage(`Réservation créée avec succès${created?.id ? ` (ID ${created.id})` : ""}.`);
    } catch (error) {
      setLocalError(error.response?.data?.message || error.message || "Erreur lors de la création de la réservation");
    }
  };

  return (
    <div className="page">

      {/* MAIN */}
      <div className="main">

        {/* LEFT */}
        <div className="left">
          <h1>C'est parti pour l'organisation de votre réunion !</h1>
          <p>
            Réservez votre salle en quelques clics ou bénéficiez d'un accompagnement
            sur mesure pour organiser votre réunion.
          </p>
          <p className="question">Vous préférez nous appeler ?</p>
          <p className="answer">
            Aucun problème, notre équipe est disponible du lundi au vendredi.
          </p>
          <button className="phone-btn">07 57 80 40 29</button>
        </div>

        {/* RIGHT — FORM */}
        <form className="form-card" onSubmit={handleSubmit}>

          {/* Stepper */}
          <div className="stepper">
            <div className="step active">
              <div className="step-circle">1</div>
              <span className="step-label">Votre réunion</span>
            </div>
            <div className="step-line" />
            <div className="step inactive">
              <div className="step-circle">2</div>
              <span className="step-label">Vos informations</span>
            </div>
          </div>

          {/* Notification salle */}
          <div className="notif">
            {roomLoading
              ? "Chargement de la salle..."
              : roomError
                ? "Salle introuvable"
                : `Vous avez sélectionné la salle ${room?.nom ?? "—"}, sous réserve de disponibilité`}
          </div>

          {(reservationError || localError) ? (
            <p className="form-message form-message-error">
              {localError || reservationError}
            </p>
          ) : null}

          {successMessage ? (
            <p className="form-message form-message-success">{successMessage}</p>
          ) : null}

          {/* Formule */}
          <div className="form-group">
            <label className="form-label">
              Choisissez votre formule <span>*</span>
            </label>
            <div className="radio-group">
              {[
                { value: "heure",       label: "À l'heure" },
                { value: "demi-journée", label: "À la demi-journée" },
                { value: "journée",     label: "À la journée" },
              ].map((f) => (
                <div className="radio-option" key={f.value}>
                  <input
                    type="radio"
                    id={f.value}
                    name="formule"
                    value={f.value}
                    checked={formule === f.value}
                    onChange={() => setFormule(f.value)}
                  />
                  <label className="radio-label" htmlFor={f.value}>
                    {f.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Sélecteur matin / après-midi — visible uniquement pour demi-journée */}
          {formule === "demi-journée" && (
            <div className="form-group">
              <label className="form-label" htmlFor="demiPeriode">
                Période <span>*</span>
              </label>
              <select
                id="demiPeriode"
                className="form-input"
                value={demiPeriode}
                onChange={(e) => setDemiPeriode(e.target.value)}
              >
                <option value="matin">Matin (8h00 – 12h00)</option>
                <option value="apres-midi">Après-midi (13h00 – 18h00)</option>
              </select>
            </div>
          )}

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="date">
              Date de la réunion <span>*</span>
            </label>
            <div className="date-row">
              <input
                id="date"
                type="date"
                className="form-input"
                value={date}
                min={minDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val);
                  if (val) {
                    const [y, mo, d] = val.split("-").map(Number);
                    const wd = new Date(y, mo - 1, d).getDay();
                    setLocalError(
                      wd === 0 || wd === 6
                        ? "Les réservations ne sont pas disponibles le week-end."
                        : ""
                    );
                  }
                }}
              />
              <p className="time-hint" style={{ marginTop: "0.4rem" }}>
                Disponible du lundi au vendredi uniquement.
              </p>
            </div>
          </div>

          {/* Horaires libres pour "heure", récapitulatif fixe pour les autres */}
          {formule === "heure" ? (
            <>
              <div className="time-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="heureDebut">
                    Heure de début <span>*</span>
                  </label>
                  <input
                    id="heureDebut"
                    type="time"
                    className="form-input"
                    value={heureDebut}
                    min="08:00"
                    max="18:00"
                    onChange={(e) => setHeureDebut(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="heureFin">
                    Heure de fin <span>*</span>
                  </label>
                  <input
                    id="heureFin"
                    type="time"
                    className="form-input"
                    value={heureFin}
                    min="08:00"
                    max="18:00"
                    onChange={(e) => setHeureFin(e.target.value)}
                  />
                </div>
              </div>
              <p className="time-hint">
                Les horaires sont ajustés automatiquement selon la formule choisie.
              </p>
            </>
          ) : (
            <p className="time-hint">
              Créneau réservé : <strong>{heureDebut} – {heureFin}</strong>
            </p>
          )}

          <button className="btn-submit" type="submit" disabled={submitting || roomLoading}>
            {submitting ? "Enregistrement..." : "Réserver"}
          </button>
        </form>
      </div>
    </div>
  );
}
