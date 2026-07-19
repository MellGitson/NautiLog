import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { estConnecte, deconnexion } = useAuth()

  const lien = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-coral-500' : 'text-ocean-700 hover:text-coral-500'
    }`

  return (
    <header className="sticky top-0 z-10 border-b border-ocean-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ocean-800 hover:text-ocean-800">
          <span aria-hidden="true">⚓</span> NautiLog
        </Link>

        <nav className="flex items-center gap-6">
          {estConnecte ? (
            <>
              <NavLink to="/bateaux" className={lien}>Bateaux</NavLink>
              <NavLink to="/ports" className={lien}>Ports</NavLink>
              <NavLink to="/trajets" className={lien}>Trajets</NavLink>
              <button onClick={deconnexion} className="btn-ghost !px-4 !py-1.5 text-sm">
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <NavLink to="/connexion" className={lien}>Se connecter</NavLink>
              <Link to="/inscription" className="btn-accent !px-4 !py-1.5 text-sm">
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
