import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Accueil() {
  const { estConnecte } = useAuth()

  return (
    <main className="flex flex-col items-center gap-10 py-16 text-center">
      <div className="space-y-4">
        <span className="badge bg-coral-100 text-coral-600">Carnet de navigation intelligent</span>
        <h1 className="max-w-2xl">
          Naviguez, suivez, gérez votre flotte <span className="text-coral-500">en toute confiance</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-ocean-700">
          NautiLog centralise vos bateaux, vos ports d'attache et l'historique de vos trajets
          dans une seule interface élégante et sécurisée.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {estConnecte ? (
          <Link to="/bateaux" className="btn-primary">Accéder à mes bateaux</Link>
        ) : (
          <>
            <Link to="/inscription" className="btn-accent">Créer un compte</Link>
            <Link to="/connexion" className="btn-ghost">Se connecter</Link>
          </>
        )}
      </div>

      <div className="grid gap-6 pt-8 sm:grid-cols-3">
        <div className="card">
          <div className="text-2xl">🚤</div>
          <h2 className="mt-2 text-lg">Flotte</h2>
          <p className="mt-1 text-sm text-ocean-600">Gérez vos bateaux et leur disponibilité en temps réel.</p>
        </div>
        <div className="card">
          <div className="text-2xl">⚓</div>
          <h2 className="mt-2 text-lg">Ports</h2>
          <p className="mt-1 text-sm text-ocean-600">Retrouvez les ports d'attache et leur capacité d'accueil.</p>
        </div>
        <div className="card">
          <div className="text-2xl">🧭</div>
          <h2 className="mt-2 text-lg">Trajets</h2>
          <p className="mt-1 text-sm text-ocean-600">Consignez chaque sortie et suivez votre historique de navigation.</p>
        </div>
      </div>
    </main>
  )
}
