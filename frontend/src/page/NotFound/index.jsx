import { Link } from 'react-router-dom';
import './styles.css';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="not-found-kicker">WOORKLY</p>
        <div className="not-found-code" aria-hidden="true">
          404
        </div>
        <h1 id="not-found-title">Page introuvable</h1>
        <p className="not-found-text">
          L’adresse saisie ne correspond à aucune page disponible. Vérifiez le lien ou revenez vers une
          section existante du site.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-link not-found-link-primary">
            Retour à l’accueil
          </Link>
          <Link to="/salle" className="not-found-link not-found-link-secondary">
            Voir les salles
          </Link>
        </div>

        <p className="not-found-hint">Si vous cherchiez une réservation, vous pouvez repartir depuis l’accueil.</p>
      </section>
    </main>
  );
}