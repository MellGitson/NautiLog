import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import CarteInteractive from '../components/CarteInteractive'
import MeteoPort from '../components/MeteoPort'
import ModalNouvelleReservation from '../components/ModalNouvelleReservation'
import SphereRotative from '../components/SphereRotative'

function CarteKpi({ label, valeur, sousDetail }) {
  return (
    <div className="rounded-xl border border-ocean-100 bg-white p-5">
      <p className="text-sm font-medium text-ocean-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ocean-800">{valeur}</p>
      {sousDetail && <p className="mt-2 text-xs text-ocean-400">{sousDetail}</p>}
    </div>
  )
}

function IconePlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [ports, setPorts] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [modaleReservationOuverte, setModaleReservationOuverte] = useState(false)

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
    <main className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Overview</h1>
          <p className="mt-2 text-ocean-600">Vue d'ensemble de la flotte, répartie sur les ports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/bateaux/nouveau" className="btn-ghost inline-flex items-center gap-2">
            <IconePlus />
            Ajouter un bateau
          </Link>
          <button type="button" onClick={() => setModaleReservationOuverte(true)} className="btn-accent inline-flex items-center gap-2">
            <IconePlus />
            Nouvelle réservation
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CarteKpi label="Bateaux" valeur={stats.bateaux.total} />
        <CarteKpi label="Ports" valeur={stats.ports.total} />
        <CarteKpi
          label="Utilisateurs"
          valeur={stats.utilisateurs.total}
          sousDetail={`${stats.utilisateurs.parRole.ROLE_ADMIN ?? 0} admin(s)`}
        />
        <CarteKpi
          label="Signalements en cours"
          valeur={stats.signalements.ouverts}
          sousDetail={stats.signalements.ouverts > 0 ? 'à traiter' : 'aucun en attente'}
        />
      </section>

      <section>
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-ocean-800">Carte de la flotte</h2>
          <p className="mt-1 text-sm text-ocean-500">Position des ports et météo marine en direct.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[9rem_1fr_16rem]">
          <div className="flex max-h-[28rem] flex-col gap-3">
            <SphereRotative />
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean-500">Statuts de la flotte</p>
            <div className="rounded-xl bg-ocean-50 p-4">
              <p className="text-xs font-medium text-ocean-600">Disponible</p>
              <p className="mt-1 text-2xl font-bold text-ocean-800">{stats.bateaux.parStatut.DISPONIBLE ?? 0}</p>
            </div>
            <div className="rounded-xl bg-coral-50 p-4">
              <p className="text-xs font-medium text-coral-600">Loué</p>
              <p className="mt-1 text-2xl font-bold text-coral-700">{stats.bateaux.parStatut['LOUÉ'] ?? 0}</p>
            </div>
            <div className="rounded-xl bg-ocean-100 p-4">
              <p className="text-xs font-medium text-ocean-700">En réparation</p>
              <p className="mt-1 text-2xl font-bold text-ocean-900">{stats.bateaux.parStatut['EN_RÉPARATION'] ?? 0}</p>
            </div>
          </div>

          {ports.length > 0 && <CarteInteractive ports={ports} />}

          <div className="flex max-h-[28rem] flex-col divide-y divide-ocean-100 overflow-y-auto rounded-2xl border border-ocean-100 bg-white">
            {ports.map((port) => (
              <div key={port.id} className="p-4">
                <p className="text-sm font-semibold text-ocean-800">{port.nom}</p>
                <div className="mt-2">
                  <MeteoPort portId={port.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {modaleReservationOuverte && (
        <ModalNouvelleReservation
          onFermer={() => setModaleReservationOuverte(false)}
          onCree={() => setModaleReservationOuverte(false)}
        />
      )}
    </main>
  )
}
