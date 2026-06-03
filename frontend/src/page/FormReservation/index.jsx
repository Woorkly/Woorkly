import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";
import useRooms from "../../hooks/useRooms";
import useReservation from "../../hooks/useReservation";

const DEFAULT_TIMES = {
  heure: { heureDebut: "09:00", heureFin: "10:00" },
  "demi-journée": { heureDebut: "09:00", heureFin: "12:00" },
  journée: { heureDebut: "09:00", heureFin: "17:00" },
};

const getTodayInputValue = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
};

export default function ReservationPage() {
  const {roomId} = useParams();
  const { room, loading: roomLoading, error: roomError } = useRooms({ roomId });
  const { createReservation, loading: submitting, error: reservationError } = useReservation();
  const [formule, setFormule] = useState("heure");
  const [date, setDate] = useState(""); 
  const [heureDebut, setHeureDebut] = useState(DEFAULT_TIMES.heure.heureDebut);
  const [heureFin, setHeureFin] = useState(DEFAULT_TIMES.heure.heureFin);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const minDate = getTodayInputValue();

  useEffect(() => {
    const defaultTimes = DEFAULT_TIMES[formule];
    setHeureDebut(defaultTimes.heureDebut);
    setHeureFin(defaultTimes.heureFin);
  }, [formule]);

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

    if (!heureDebut || !heureFin) {
      setLocalError("Veuillez renseigner les horaires de réservation.");
      return;
    }

    try {
      const payload = {
        salle_id: room.id,
        date,
        heure_debut: heureDebut,
        heure_fin: heureFin,
        type_reservation: formule,
      };

      const created = await createReservation(payload);
      setSuccessMessage(`Réservation créée avec succès${created?.id ? ` (ID ${created.id})` : ""}.`);
    } catch (error) {
      // L'erreur est déjà exposée via le hook, on garde aussi un message local pour l'UI.
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

          {/* Notification */}
          <div className="notif">
            {roomLoading
              ? "Chargement de la salle..."
              : roomError
                ? "Salle introuvable"
                : `Vous avez sélectionné la salle ${room?.nom ?? "—"}, sous réserve de disponibilité`}
          </div>

          {reservationError || localError ? (
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
                { value: "heure", label: "À l'heure" },
                { value: "demi-journée", label: "À la demi-journée" },
                { value: "journée", label: "À la journée" },
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
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Horaires */}
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
                onChange={(e) => setHeureFin(e.target.value)}
              />
            </div>
          </div>

          <p className="time-hint">
            Les horaires sont ajustés automatiquement selon la formule choisie.
          </p>

          <button className="btn-submit" type="submit" disabled={submitting || roomLoading}>
            {submitting ? "Enregistrement..." : "Réserver"}
          </button>
        </form>
      </div>   
    </div>
  );
}
