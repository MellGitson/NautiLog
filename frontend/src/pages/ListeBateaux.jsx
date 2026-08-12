import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CarteBateau from '../components/CarteBateau'
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
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1>{estProprietaire ? 'Mes bateaux' : 'Bateaux'}</h1>
        {estProprietaire && (
          <Link to="/bateaux/nouveau" className="btn-primary">
            + Ajouter un bateau
          </Link>
        )}
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
