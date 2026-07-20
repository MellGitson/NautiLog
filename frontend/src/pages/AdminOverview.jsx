import { useEffect, useState } from 'react'
import api from '../services/api'
import CarteInteractive from '../components/CarteInteractive'

function CarteKpi({ label, valeur, sousDetail }) {
  return (
    <div className="rounded-xl border border-ocean-100 bg-white p-5">
      <p className="text-sm font-medium text-ocean-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ocean-800">{valeur}</p>
      {sousDetail && <p className="mt-2 text-xs text-ocean-400">{sousDetail}</p>}
    </div>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [ports, setPorts] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/ports'),
    ])
      .then(([resStats, resPorts]) => {
        setStats(resStats.data)
        setPorts(resPorts.data)
      })
      .catch(() => setErreur('Impossible de charger les données du dashboard.'))
      .finally(() => setChargement(false))
  }, [])

  if (chargement) return <p>Chargement du dashboard…</p>
  if (erreur) return <p className="text-coral-600">{erreur}</p>

  return (
    <main>
      <header className="mb-6">
        <h1>Overview</h1>
        <p className="mt-2 text-ocean-600">Vue d'ensemble de la flotte, répartie sur les ports.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CarteKpi
          label="Bateaux"
          valeur={stats.bateaux.total}
          sousDetail={`${stats.bateaux.parStatut.DISPONIBLE ?? 0} disponibles`}
        />
        <CarteKpi label="Ports" valeur={stats.ports.total} />
        <CarteKpi
          label="Utilisateurs"
          valeur={stats.utilisateurs.total}
          sousDetail={`${stats.utilisateurs.parRole.ROLE_ADMIN ?? 0} admin(s)`}
        />
        <CarteKpi label="Trajets" valeur={stats.trajets.total} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ocean-800">Statuts de la flotte</h2>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg bg-ocean-50 px-4 py-2 text-sm text-ocean-700">
            Disponible : <span className="font-semibold">{stats.bateaux.parStatut.DISPONIBLE ?? 0}</span>
          </div>
          <div className="rounded-lg bg-coral-50 px-4 py-2 text-sm text-coral-700">
            Loué : <span className="font-semibold">{stats.bateaux.parStatut['LOUÉ'] ?? 0}</span>
          </div>
          <div className="rounded-lg bg-ocean-100 px-4 py-2 text-sm text-ocean-800">
            En réparation : <span className="font-semibold">{stats.bateaux.parStatut['EN_RÉPARATION'] ?? 0}</span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-ocean-800">Carte de la flotte</h2>
        {ports.length > 0 && <CarteInteractive ports={ports} />}
      </section>
    </main>
  )
}
