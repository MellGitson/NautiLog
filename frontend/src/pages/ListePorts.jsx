import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CartePort from '../components/CartePort'
import CarteInteractive from '../components/CarteInteractive'
import MeteoPort from '../components/MeteoPort'
import SphereRotative from '../components/SphereRotative'
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
        <div className="grid gap-6 lg:grid-cols-[9rem_1fr_18rem]">
          <div className="hidden items-start justify-center pt-2 lg:flex">
            <SphereRotative />
          </div>

          <CarteInteractive ports={ports} />

          <aside className="flex h-[28rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-700 text-white">
            <h2 className="shrink-0 px-5 pt-5 text-xs font-semibold uppercase tracking-wide text-ocean-300">Météo des ports</h2>
            <div className="mt-3 flex-1 divide-y divide-ocean-700/60 overflow-y-auto">
              {ports.map((port) => (
                <Link key={port.id} to={`/ports/${port.id}`} className="block px-5 py-3.5 transition-colors hover:bg-white/5">
                  <p className="text-sm font-semibold text-white">{port.nom}</p>
                  <p className="text-xs text-ocean-300">{port.ville}</p>
                  <div className="mt-1.5">
                    <MeteoPort portId={port.id} sombre />
                  </div>
                </Link>
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
