import { useEffect, useState } from 'react'
import CartePort from '../components/CartePort'
import CarteInteractive from '../components/CarteInteractive'
import api from '../services/api'

export default function ListePorts() {
  const [ports, setPorts] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [vue, setVue] = useState('carte')

  useEffect(() => {
    api.get('/ports')
      .then((res) => setPorts(res.data))
      .catch(() => setErreur('Impossible de charger les ports.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header className="mb-8 flex items-center justify-between">
        <h1>Les ports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setVue('carte')}
            className={vue === 'carte' ? 'btn-primary !px-4 !py-1.5 text-sm' : 'btn-ghost !px-4 !py-1.5 text-sm'}
          >
            Carte
          </button>
          <button
            onClick={() => setVue('liste')}
            className={vue === 'liste' ? 'btn-primary !px-4 !py-1.5 text-sm' : 'btn-ghost !px-4 !py-1.5 text-sm'}
          >
            Liste
          </button>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && ports.length === 0 && (
        <p className="text-ocean-600">Aucun port disponible.</p>
      )}

      {!chargement && !erreur && ports.length > 0 && vue === 'carte' && (
        <CarteInteractive ports={ports} />
      )}

      {!chargement && !erreur && vue === 'liste' && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ports.map((port) => (
            <CartePort key={port.id} port={port} />
          ))}
        </section>
      )}
    </main>
  )
}
