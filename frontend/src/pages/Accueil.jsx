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
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 45% 95% at 12% 50%, rgba(15,43,57,0.8), transparent 75%)' }}
          aria-hidden="true"
        />

        <span className="goutte-eau goutte-eau--claire pointer-events-none absolute left-[8%] top-[12%] h-10 w-10" aria-hidden="true" />
        <span className="goutte-eau goutte-eau--claire pointer-events-none absolute right-[12%] top-[20%] h-6 w-6" style={{ animationDelay: '1s' }} aria-hidden="true" />
        <span className="goutte-eau goutte-eau--claire pointer-events-none absolute bottom-[10%] right-[8%] h-12 w-12" style={{ animationDelay: '0.5s' }} aria-hidden="true" />

        <span className="goutte-eau goutte-eau--sombre pointer-events-none absolute bottom-[8%] left-[6%] h-16 w-16" style={{ animationDelay: '0.2s' }} aria-hidden="true" />
        <span className="goutte-eau goutte-eau--sombre pointer-events-none absolute bottom-[22%] left-[14%] h-10 w-10" style={{ animationDelay: '1.6s' }} aria-hidden="true" />
        <span className="goutte-eau goutte-eau--sombre pointer-events-none absolute bottom-[4%] left-[24%] h-12 w-12" style={{ animationDelay: '2.4s' }} aria-hidden="true" />

        <div className="relative z-10 space-y-4">
          <span className="badge badge-neon bg-white/15 ring-1 ring-inset ring-white/30 backdrop-blur-sm">
            Gestion de flotte intelligente
          </span>
          <h1 className="max-w-2xl text-white drop-shadow-sm">
            Naviguez, gérez votre flotte <span className="text-coral-300">en toute confiance</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-ocean-100">
            NautiLog centralise vos bateaux, vos ports d'attache.
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

      <div className="grid w-full gap-4 pt-4 text-left sm:grid-cols-12">
        <div className="relative overflow-hidden sm:col-span-7 sm:row-span-2 rounded-2xl bg-gradient-to-br from-ocean-950/90 via-ocean-900/85 to-ocean-700/85 p-8 text-white shadow-sm backdrop-blur-sm">
          <span className="goutte-eau goutte-eau--claire pointer-events-none absolute -left-3 -top-3 h-9 w-9" aria-hidden="true" />
          <span className="goutte-eau goutte-eau--claire pointer-events-none absolute bottom-4 right-6 h-6 w-6" style={{ animationDelay: '1.3s' }} aria-hidden="true" />
          <span className="goutte-eau goutte-eau--claire pointer-events-none absolute right-10 top-8 h-5 w-5" style={{ animationDelay: '2.1s' }} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-ocean-300">Flotte</span>
          <h2 className="mt-3 text-white">Chaque bateau, son statut, en direct</h2>
          <p className="mt-3 max-w-md text-ocean-100">
            Disponible, loué ou en réparation : la disponibilité réelle de votre flotte tient à jour sans tableur ni coup de fil.
          </p>
        </div>
        <div className="relative overflow-hidden sm:col-span-5 rounded-2xl border border-ocean-100 bg-white/80 p-6 backdrop-blur-sm">
          <span className="goutte-eau goutte-eau--claire pointer-events-none absolute -right-2 -top-2 h-7 w-7" style={{ animationDelay: '0.8s' }} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-ocean-500">Ports</span>
          <h2 className="mt-2 text-lg">Emplacement précis, à quai</h2>
          <p className="mt-1 text-sm text-ocean-600">La carte des ports localise chaque poste d'amarrage.</p>
        </div>
        <div className="relative overflow-hidden sm:col-span-5 rounded-2xl bg-coral-500 p-6 text-white shadow-sm">
          <span className="goutte-eau goutte-eau--claire pointer-events-none absolute -bottom-3 -right-3 h-9 w-9" style={{ animationDelay: '2.2s' }} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-coral-100">Réservations</span>
          <h2 className="mt-2 text-lg text-white">Sans double réservation</h2>
          <p className="mt-1 text-sm text-coral-50">Les conflits de dates sont détectés automatiquement.</p>
        </div>
      </div>
    </main>
  )
}
