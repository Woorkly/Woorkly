import React from 'react'
import './footer.css'
import { useState } from 'react'

const footerCols = [
  { title: 'Espaces', links: ['Bureaux privés', 'Open space', 'Salles de réunion', 'Événements'] },
  { title: 'À propos', links: ['Notre histoire', 'Nos valeurs', 'L\'équipe', 'Presse'] },
  { title: 'Support', links: ['Centre d\'aide', 'Contact', 'Conditions générales', 'Confidentialité'] },
]

const footer = () => {
    const [email,setEmail] = useState('')
  return (
     <>
        {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="footer-logo">woorkly<span>.</span></div>
            <div className="footer-tagline">Espace de travail & réunion</div>
            <p className="footer-newsletter-label">Inscrivez-vous à notre newsletter</p>
          </div>
          <form className="newsletter" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" style={{ display: 'none' }}>Email pour la newsletter</label>
            <input
              id="newsletter-email"
              className="newsletter-input"
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Votre adresse email"
            />
            <button type="submit" className="newsletter-btn">S'inscrire</button>
          </form>
        </div>

        { <div className="footer-links">
          <div className="footer-col">
            <h4>Espace de travail</h4>
            <a href="#">Coworking</a>
            <a href="#">Location de bureau</a>
            <a href="#">Location de salle de réunion</a>
          </div>
          <div className="footer-col">
            <h4>Aménagement</h4>
            <a href="#">Le conseil en aménagement</a>
            <a href="#">Le design d'espaces de travail</a>
            <a href="#">Les travaux de réalisation</a>
          </div>
          <div className="footer-col">
            <h4>Événementiel</h4>
            <a href="#">Événements professionnels</a>
            <a href="#">Événements sur mesure</a>
            <a href="#">Séminaire de réunion</a>
          </div>
          <div className="footer-col">
            <h4>Chez Woorkly</h4>
            <a href="#">Qui sommes-nous ?</a>
            <a href="#">Recrutement</a>
            <a href="#">Le Journal Woorkly</a>
            <a href="#">Engagements</a>
            <a href="#">Devenez partenaires</a>
          </div>
          <div className="footer-col">
            <h4>Nous contacter</h4>
            <a href="#">Partir à un endroit</a>
            <a href="#">Recrutement</a>
          </div>
        </div> }

        <div className="footer-bottom">
          <p>© Copyright Woorkly 2026</p>
          <div className="footer-bottom-links">
            <a href="#">Règlement de partenage</a>
            <a href="#">CPG</a>
            <a href="#">Sécurité et cookies</a>
          </div>
          <div className="social-icons">
            <a href="#" aria-label="Suivez-nous sur Facebook">f</a>
            <a href="#" aria-label="Suivez-nous sur LinkedIn">in</a>
            <a href="#" aria-label="Suivez-nous sur X (Twitter)">x</a>
            <a href="#" aria-label="Regardez nos vidéos sur YouTube">yt</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default footer