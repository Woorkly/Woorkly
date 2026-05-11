import react from 'react';
import './header.css';


const header = () => {
  return (
    <div>
        <section className="hero">

      {/* NAV */}
      <nav className="nav">
        <div className="nav__links">
          <a href="#">SALLES</a>
          <a href="#">MON ESPACE</a>
          <a href="#">ADMIN</a>
        </div>
        <div className="nav__logo">woorkly.</div>
        <div className="nav__actions">
          <button className="nav__btn-outline">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Voir nos espaces
          </button>
          <button className="nav__btn-dark">Contactez-nous</button>
        </div>
      </nav>

    </section>
    </div>
  )
}

export default header