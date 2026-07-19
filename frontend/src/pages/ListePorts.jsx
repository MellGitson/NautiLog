import { useEffect, useState } from 'react'
import CartePort from '../components/CartePort'
import api from '../services/api'

export default function ListePorts() {
  const [ports, setPorts] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/ports')
      .then((res) => setPorts(res.data))
      .catch(() => setErreur('Impossible de charger les ports.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header className="mb-8">
        <h1>Les ports</h1>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && ports.length === 0 && (
        <p className="text-ocean-600">Aucun port disponible.</p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ports.map((port) => (
          <CartePort key={port.id} port={port} />
        ))}
      </section>
    </main>
  )
}
