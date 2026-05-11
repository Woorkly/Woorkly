import { useState } from "react";
import "./style.css";

export default function ReservationPage() {
  const [formule, setFormule] = useState("heure");
  const [participants, setParticipants] = useState("");
  const [date, setDate] = useState(""); 

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
        <div className="form-card">

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
            Vous avez sélectionné la salle Florin, sous réserve de disponibilité
          </div>

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

          {/* Participants */}
          <div className="form-group">
            <label className="form-label" htmlFor="participants">
              Nombre de participants <span>*</span>
            </label>
            <input
              id="participants"
              type="number"
              className="form-input"
              placeholder="Ex : 10"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
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
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-submit">Suivant →</button>
        </div>
      </div>   
    </div>
  );
}
