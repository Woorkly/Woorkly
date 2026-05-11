import React from 'react'
import './footer.css'

const footerCols = [
  { title: 'Espaces', links: ['Bureaux privés', 'Open space', 'Salles de réunion', 'Événements'] },
  { title: 'À propos', links: ['Notre histoire', 'Nos valeurs', 'L\'équipe', 'Presse'] },
  { title: 'Support', links: ['Centre d\'aide', 'Contact', 'Conditions générales', 'Confidentialité'] },
]

const footer = () => {
  return (
     <>
      {/* REJOIGNEZ-NOUS */}
      <section className="join">
        <div className="join__inner">
          <div className="join__left">
            <h2 className="join__title">REJOIGNEZ-<br/>NOUS !</h2>
          </div>
          <div className="join__right">
            <p className="join__text">
              Woorkly déploie tous ses espaces faites pour que chacun puisse se former au terme de travail. Au quotidien, notre équipe accompagne tous types d'entreprises pour les héberger, concevoir leurs bureaux ou organiser leurs événements.
              <br/><br/>
              Pourquoi pas vous ?
            </p>
            <button className="join__btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 12 19.79 19.79 0 011.21 3.35 2 2 0 013.22 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">

        {/* Newsletter */}
        <div className="footer__nl">
          <div className="footer__nl-left">
            <p className="footer__nl-title">Inscrivez-vous à notre newsletter</p>
            <p className="footer__nl-sub">Vous recevrez toutes les actualités sur Woorkly et l'univers.</p>
          </div>
          <div className="footer__nl-form">
            <input type="email" placeholder="Votre e-mail" className="footer__nl-input"/>
            <button className="footer__nl-btn">S'inscrire</button>
          </div>
        </div>

        {/* Columns */}
        <div className="footer__cols">
          {footerCols.map((col, i) => (
            <div className="footer__col" key={i}>
              <p className="footer__col-title">{col.title}</p>
              <ul className="footer__links">
                {col.links.map((l, j) => (
                  <li key={j}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p className="footer__copy">© Copyright Woorkly 2025</p>
          <div className="footer__legal">
            <a href="#">Règlement de la serveur</a>
            <a href="#">FAQ</a>
            <a href="#">Résultat et cookies</a>
          </div>
          <div className="footer__social">
            {['f', 'in', '𝕏', 'yt', 'ig'].map((s, i) => (
              <a href="#" className="footer__social-btn" key={i}>{s}</a>
            ))}
          </div>
        </div>

      </footer>
    </>
  )
}

export default footer