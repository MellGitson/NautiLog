import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CarteTrajet from '../components/CarteTrajet'
import api from '../services/api'

export default function ListeTrajets() {
  const [trajets, setTrajets] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/trajets')
      .then((res) => setTrajets(res.data))
      .catch(() => setErreur('Impossible de charger les trajets.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header className="mb-8 flex items-center justify-between">
        <h1>Mes trajets</h1>
        <Link to="/trajets/nouveau" className="btn-accent">Nouveau trajet</Link>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && trajets.length === 0 && (
        <p className="text-ocean-600">Aucun trajet enregistré.</p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trajets.map((trajet) => (
          <CarteTrajet key={trajet.id} trajet={trajet} />
        ))}
      </section>
    </main>
  )
}
