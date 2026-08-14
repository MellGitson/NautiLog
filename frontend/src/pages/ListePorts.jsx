import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CartePort from '../components/CartePort'
import CarteInteractive from '../components/CarteInteractive'
import MeteoPort from '../components/MeteoPort'
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
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <CarteInteractive ports={ports} />

          <aside className="card flex h-[28rem] flex-col">
            <h2 className="mb-3 shrink-0 text-sm font-semibold text-ocean-800">Météo des ports</h2>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {ports.map((port) => (
                <div key={port.id} className="border-t border-ocean-100 pt-3 first:border-0 first:pt-0">
                  <Link to={`/ports/${port.id}`} className="text-sm font-medium">
                    {port.nom}
                  </Link>
                  <p className="text-xs text-ocean-500">{port.ville}</p>
                  <div className="mt-1">
                    <MeteoPort portId={port.id} />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
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
