import { Link } from 'react-router-dom'

export default function Accueil() {
  return (
    <main>
      <h1>NautiLog</h1>
      <p>Carnet de navigation électronique intelligent.</p>
      <nav>
        <Link to="/connexion">Se connecter</Link>
        {' | '}
        <Link to="/inscription">S'inscrire</Link>
        {' | '}
        <Link to="/bateaux">Mes bateaux</Link>
      </nav>
    </main>
  )
}
