import { useEffect, useState } from 'react'
import api from '../services/api'
import CartePort from '../components/CartePort'

export default function AdminPorts() {
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
        <h1>Ports</h1>
        <p className="mt-2 text-ocean-600">{ports.length} port(s). Cliquez sur un port pour gérer ses emplacements.</p>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ports.map((port) => (
            <CartePort key={port.id} port={port} />
          ))}
        </section>
      )}
    </main>
  )
}
