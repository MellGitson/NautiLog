import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function NavBar() {
  const { estConnecte, aRole, user, deconnexion } = useAuth()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [nombreNonLues, setNombreNonLues] = useState(0)
  const estAdmin = aRole('ROLE_ADMIN')

  useEffect(() => {
    if (!estConnecte) return
    api.get('/notifications')
      .then((res) => setNombreNonLues(res.data.filter((n) => !n.lu).length))
      .catch(() => {})
  }, [estConnecte])

  const lien = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-coral-500' : 'text-ocean-700 hover:text-coral-500'
    }`

  const fermerMenu = () => setMenuOuvert(false)

  const initiale = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-10 border-b border-ocean-100 bg-white/80 backdrop-blur-md">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ocean-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" onClick={fermerMenu} className="flex items-center gap-2 font-display text-xl font-bold text-ocean-800 hover:text-ocean-800">
          <span aria-hidden="true">⚓</span> NautiLog
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {estConnecte ? (
            <>
              <NavLink to="/bateaux" className={lien}>Bateaux</NavLink>
              <NavLink to="/ports" className={lien}>Ports</NavLink>
              <NavLink to="/trajets" className={lien}>Trajets</NavLink>
              <NavLink to="/reservations" className={lien}>Réservations</NavLink>
              <NavLink to="/notifications" className={`${lien} relative`}>
                Notifications
                {nombreNonLues > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-coral-500 text-[10px] font-semibold text-white">
                    {nombreNonLues}
                  </span>
                )}
              </NavLink>
              {estAdmin && <NavLink to="/admin" className={lien}>Admin</NavLink>}
              <Link
                to="/profil"
                title={estAdmin ? `${user?.email} (administrateur)` : user?.email}
                aria-label="Mon profil"
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80 ${
                  estAdmin ? 'bg-coral-500' : 'bg-ocean-500'
                }`}
              >
                {initiale}
              </Link>
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

        <button
          type="button"
          onClick={() => setMenuOuvert((o) => !o)}
          aria-expanded={menuOuvert}
          aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50 sm:hidden"
        >
          <span aria-hidden="true" className="text-2xl leading-none">{menuOuvert ? '✕' : '☰'}</span>
        </button>
      </div>

      {menuOuvert && (
        <nav className="flex flex-col gap-1 border-t border-ocean-100 bg-white/95 px-6 py-4 sm:hidden">
          {estConnecte ? (
            <>
              <NavLink to="/bateaux" className={lien} onClick={fermerMenu}>Bateaux</NavLink>
              <NavLink to="/ports" className={`${lien} py-2`} onClick={fermerMenu}>Ports</NavLink>
              <NavLink to="/trajets" className={`${lien} py-2`} onClick={fermerMenu}>Trajets</NavLink>
              <NavLink to="/reservations" className={`${lien} py-2`} onClick={fermerMenu}>Réservations</NavLink>
              <NavLink to="/notifications" className={`${lien} py-2`} onClick={fermerMenu}>
                Notifications {nombreNonLues > 0 && <span className="text-coral-500">({nombreNonLues})</span>}
              </NavLink>
              {estAdmin && (
                <NavLink to="/admin" className={`${lien} py-2`} onClick={fermerMenu}>Admin</NavLink>
              )}
              <NavLink to="/profil" className={`${lien} py-2`} onClick={fermerMenu}>
                Mon profil <span className="text-ocean-500">({user?.email}{estAdmin && ', administrateur'})</span>
              </NavLink>
              <button
                onClick={() => { deconnexion(); fermerMenu() }}
                className="btn-ghost mt-2 !px-4 !py-1.5 text-sm"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <NavLink to="/connexion" className={`${lien} py-2`} onClick={fermerMenu}>Se connecter</NavLink>
              <Link to="/inscription" onClick={fermerMenu} className="btn-accent mt-2 !px-4 !py-1.5 text-sm">
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
