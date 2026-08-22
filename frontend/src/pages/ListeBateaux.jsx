import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CarteBateau from '../components/CarteBateau'
import HoloAncre from '../components/HoloAncre'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ListeBateaux() {
  const { user, aRole } = useAuth()
  const estProprietaire = aRole('ROLE_OWNER')
  const [bateaux, setBateaux] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/bateaux')
      .then((res) => setBateaux(res.data))
      .catch(() => setErreur('Impossible de charger les bateaux.'))
      .finally(() => setChargement(false))
  }, [])

  const bateauxVisibles = aRole('ROLE_ADMIN')
    ? bateaux
    : bateaux.filter((bateau) => bateau.statut !== 'EN_RÉPARATION' || bateau.proprietaire?.email === user?.email)

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>{estProprietaire ? 'Mes bateaux' : 'Bateaux'}</h1>
          <p className="mt-2 text-ocean-600">
            {estProprietaire ? 'Gérez votre flotte et suivez son statut.' : 'Parcourez les bateaux disponibles à la location.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {estProprietaire && (
            <Link to="/bateaux/nouveau" className="btn-primary inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajouter un bateau
            </Link>
          )}
          <div className="h-20 w-20 shrink-0">
            <HoloAncre taille="moyenne" />
          </div>

          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
            <span className="font-display text-3xl leading-none">{bateauxVisibles.length}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
              Bateau{bateauxVisibles.length > 1 ? 'x' : ''}
            </span>
          </div>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && bateauxVisibles.length === 0 && (
        <p className="text-ocean-600">
          {estProprietaire ? "Vous n'avez pas encore de bateau." : 'Aucun bateau disponible.'}
        </p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bateauxVisibles.map((bateau) => (
          <CarteBateau key={bateau.id} bateau={bateau} />
        ))}
      </section>
    </main>
  )
}
