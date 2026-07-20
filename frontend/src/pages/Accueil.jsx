import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import wallpaperEau from '../assets/wallpaper-eaututu.png'

export default function Accueil() {
  const { estConnecte } = useAuth()

  return (
    <main className="flex flex-col items-center gap-10 text-center">
      <section
        className="relative -mx-6 -mt-10 flex w-[calc(100%+3rem)] flex-col items-center gap-6 overflow-hidden px-6 py-24 text-white sm:py-32"
        style={{ backgroundImage: `url(${wallpaperEau})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-950/70 via-ocean-900/50 to-ocean-950/80" aria-hidden="true" />

        <div className="relative z-10 space-y-4">
          <span className="badge bg-white/15 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
            Carnet de navigation intelligent
          </span>
          <h1 className="max-w-2xl text-white drop-shadow-sm">
            Naviguez, suivez, gérez votre flotte <span className="text-coral-300">en toute confiance</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-ocean-100">
            NautiLog centralise vos bateaux, vos ports d'attache et l'historique de vos trajets
            dans une seule interface élégante et sécurisée.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center gap-4">
          {estConnecte ? (
            <Link to="/bateaux" className="btn-accent">Accéder à mes bateaux</Link>
          ) : (
            <>
              <Link to="/inscription" className="btn-accent">Créer un compte</Link>
              <Link to="/connexion" className="btn bg-white/15 text-white ring-1 ring-inset ring-white/40 backdrop-blur-sm hover:bg-white/25">
                Se connecter
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 pt-4 sm:grid-cols-3">
        <div className="card animate-float [animation-delay:0s]">
          <div className="text-2xl">🚤</div>
          <h2 className="mt-2 text-lg">Flotte</h2>
          <p className="mt-1 text-sm text-ocean-600">Gérez vos bateaux et leur disponibilité en temps réel.</p>
        </div>
        <div className="card animate-float [animation-delay:0.4s]">
          <div className="text-2xl">⚓</div>
          <h2 className="mt-2 text-lg">Ports</h2>
          <p className="mt-1 text-sm text-ocean-600">Retrouvez les ports d'attache et leur capacité d'accueil.</p>
        </div>
        <div className="card animate-float [animation-delay:0.8s]">
          <div className="text-2xl">🧭</div>
          <h2 className="mt-2 text-lg">Trajets</h2>
          <p className="mt-1 text-sm text-ocean-600">Consignez chaque sortie et suivez votre historique de navigation.</p>
        </div>
      </div>
    </main>
  )
}
