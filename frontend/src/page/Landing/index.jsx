/*
  Landing page
  - Contient la section hero et la présentation du service
  - Styles locaux dans `styles.css`
*/
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import './styles.css'

export default function Landing() {
  return (
    <section className="landing">
      {/* Hero section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-kicker">WOORKLY</p>
          <h1>RÉUNISSEZ-VOUS</h1>
          <h2>Comme vous le souhaitez</h2>
          <p className="hero-subtitle">
            La plateforme pour trouver la salle parfaite. Rapide. Facile. À votre portée.
          </p>

          <ul className="hero-features-list">
            <li>Réservez en 30 secondes</li>
            <li>Disponibilités en temps réel</li>
            <li>Des salles pour tous les besoins</li>
          </ul>

          <div className="hero-actions">
            <Link to="/rooms">
              <Button variant="primary">Découvrir les salles</Button>
            </Link>
            <Link to="/reservation">
              <Button variant="outline"><Link to="/reservation"> Réserver maintenant</Link></Button>
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-shell">
            <img
              src="/images/cou-de-coeur-2.jpg"
              alt="Salle de réunion moderne"
              className="hero-image"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="hero-image-badge">
              <span className="badge-label">Salle premium</span>
              <strong>WOORKLY 12</strong>
            </div>
          </div>
        </div>
        <div className="hero-partners">
          <span className="partners-label">Partenaires :</span>
          <span className="partner">Acme</span>
          <span className="partner">Contoso</span>
          <span className="partner">Globex</span>
        </div>
      </section>

      <section className="section-intro">
        <div className="intro-header">
          <h3>Tout ce qu'il faut pour que votre réunion soit parfaite</h3>
          <p>Équipée. Flexible. À votre image.</p>
        </div>

        <div className="intro-features">
          <article className="intro-feature">
            <div className="feature-icon feature-icon-rooms">
              <span>🏢</span>
            </div>
            <h4>Salles de réunion</h4>
            <p>Petites réunions ou grand séminaire. Des espaces conçus pour vous.</p>
          </article>

          <article className="intro-feature">
            <div className="feature-icon feature-icon-equipment">
              <span>⚙️</span>
            </div>
            <h4>Équipements</h4>
            <p>Écrans, vidéoconférence, confidentialité et insonorisation. Nos salles sont conçues pour vos usages professionnels.</p>
          </article>

          <article className="intro-feature">
            <div className="feature-icon feature-icon-services">
              <span>🎯</span>
            </div>
            <h4>Prestations et services</h4>
            <p>Restauration, équipements premium, support dédié. Tout pour réussir.</p>
          </article>

          <article className="intro-feature">
            <div className="feature-icon feature-icon-pricing">
              <span>💳</span>
            </div>
            <h4>Tarifs</h4>
            <p>Transparents et adapté à votre budget. De 2h à la journée complète.</p>
          </article>
        </div>

        <div className="intro-cta">
          <Button variant="primary"><Link to="/reservation">Réserver une salle</Link></Button>
        </div>
      </section>

      <section className="section-salles-reunion">
        <div className="section-intro-inner">
          <h3>Salles vérifiées et approuvées</h3>
          <p>Découvrez nos coups de cœur pour votre prochaine réunion.</p>
        </div>

        <div className="intro-gallery">
          <div className="intro-gallery-grid">
            <div className="intro-gallery-left">
              <div className="gallery-item large">
                <img src="/images/cou-de-coeur-4.avif" alt="Paris 08 - Concorde" loading="lazy" decoding="async" />
                <span className="gallery-badge">Paris 08 - Concorde</span>
              </div>
            </div>

            <div className="intro-gallery-right">
              <div className="gallery-item small small-top">
                <img src="/images/cou-de-coeur-3.avif" alt="Paris 06 - Général Foy" loading="lazy" decoding="async" />
                <span className="gallery-badge">Paris 06 - Général Foy</span>
              </div>

              <div className="gallery-item small small-bottom">
                <img src="/images/cou-de-coeur-2.jpg" alt="Paris 09 - Laffitte" loading="lazy" decoding="async" />
                <span className="gallery-badge">Paris 09 - Laffitte</span>
              </div>

              <div className="gallery-item tall tall-right">
                <img src="/images/cou-de-coeur-1.jpg" alt="Paris 02 - Bourse" loading="lazy" decoding="async" />
                <span className="gallery-badge">Paris 02 - Bourse</span>
              </div>
            </div>
          </div>

          <div className="section-intro-cta">
            <Button variant="primary"><Link to="/reservation">Réserver une salle</Link></Button>
          </div>
        </div>
      </section>

      <section className="section-highlights">
        <div className="section-highlights-inner">
          <div className="section-highlights-content">
            <h3>Les équipements et services pour vos réunions</h3>
          </div>
        </div>

        <div className="section-highlights-grid section-highlights-grid-services">
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">📺</div>
            <div>
              <h4>Technique</h4>
              <p>Écrans et système de visioconférence</p>
            </div>
          </article>
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">☀️</div>
            <div>
              <h4>Lumière naturelle</h4>
              <p>Dans la majorité de nos salles</p>
            </div>
          </article>
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">🔑</div>
            <div>
              <h4>Confidentialité</h4>
              <p>Insonorisation garantie</p>
            </div>
          </article>
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">🧷</div>
            <div>
              <h4>Tableau mural</h4>
              <p>White board et fournitures à disposition</p>
            </div>
          </article>
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">♿</div>
            <div>
              <h4>Accessibilité</h4>
              <p>Accès facilité et PMR</p>
            </div>
          </article>
          <article className="highlight-card highlight-card-service">
            <div className="highlight-icon">🍴</div>
            <div>
              <h4>Food</h4>
              <p>Petits déjeuners - Plateaux repas - pauses café - pauses gourmandes</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-two">
        <div className="section-two-help">
          <div className="section-two-help-card">
            <div>
              <strong>Besoin d'aide ? Une question ?</strong>
              <p>Notre équipe est à votre disposition pour vous accompagner.</p>
            </div>

            <a className="section-two-phone" href="tel:+330757904029">
              <span>📞</span>
              Nous appeler
            </a>
          </div>
        </div>

        <div className="section-two-header">
          <h3>4 formats pour tous vos besoins</h3>
        </div>

        <div className="section-types-grid">
          <figure className="type-card type-card-a">
            <img
              src="/images/pngtree-d-rendering.jpg"
              alt="Réunion simple"
              className="type-card-image"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Réunion simple</figcaption>
          </figure>

          <figure className="type-card type-card-b">
            <img
              src="/images/interieur-salle-reunion.avif"
              alt="Séminaire d'équipe ou Comex"
              className="type-card-image"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Séminaire d'équipe ou Comex</figcaption>
          </figure>

          <figure className="type-card type-card-c">
            <img
              src="/images/salle-classique.avif"
              alt="Rendez-vous client"
              className="type-card-image"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Rendez-vous client</figcaption>
          </figure>

          <figure className="type-card type-card-d">
            <img
              src="/images/salle-conference-grand-ecran.avif"
              alt="Assemblée Générale"
              className="type-card-image"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Assemblée Générale</figcaption>
          </figure>
        </div>

        <div className="section-two-cta">
          <Button variant="primary"><Link to="/reservation">Réserver une salle</Link></Button>
        </div>
      </section>

      <section className="section-faq">
        <div className="faq-container">
          <div className="faq-header">
            <span className="faq-label">FAQ</span>
            <h3>Tout ce que vous devez savoir</h3>
            <p>Des questions ? Nous sommes là pour vous aider.</p>
          </div>

          <div className="faq-list">
            <details className="faq-item">
              <summary>
                <span className="faq-question">Quels équipements dans les salles ?</span>
                <span className="faq-toggle">+</span>
              </summary>
              <div className="faq-answer">
                <p>Écrans HD, viséoconf, Wi-Fi illimité, tableau blanc. Tout ce qu'il faut. Insonorée et lumière naturelle incluses.</p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="faq-question">Pourquoi choisir WOORKLY ?</span>
                <span className="faq-toggle">+</span>
              </summary>
              <div className="faq-answer">
                <p>Localisation parfaite, disponibilités en temps réel, tarifs simples et transparents, service client qui écoute.</p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="faq-question">Quels événements peut-on organiser ?</span>
                <span className="faq-toggle">+</span>
              </summary>
              <div className="faq-answer">
                <p>Réunions d'équipe, séminaires, formations, entrevues client, présentations, assemblées générales. Bref, tout ce dont vous avez besoin.</p>
              </div>
            </details>

            <details className="faq-item">
              <summary>
                <span className="faq-question">Quel est le prix ?</span>
                <span className="faq-toggle">+</span>
              </summary>
              <div className="faq-answer">
                <p>Tarifs adaptés à votre budget selon la salle et les services. Devis gratuit et sans engagement.</p>
              </div>
            </details>
          </div>
        </div>
      </section>
    </section>
  )
}
