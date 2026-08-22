import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import CarteEmplacements from '../components/CarteEmplacements'
import GestionEmplacements from '../components/GestionEmplacements'
import DemandeEmplacement from '../components/DemandeEmplacement'
import MeteoPort from '../components/MeteoPort'
import IllustrationMeteo from '../components/IllustrationMeteo'

export default function DetailPort() {
  const { id } = useParams()
  const { aRole } = useAuth()
  const [port, setPort] = useState(null)
  const [emplacements, setEmplacements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const chargerPort = () => {
    api.get(`/ports/${id}`)
      .then((res) => setPort(res.data))
      .catch(() => setErreur('Impossible de charger ce port.'))
  }

  const chargerEmplacements = () => {
    api.get(`/ports/${id}/emplacements`)
      .then((res) => setEmplacements(res.data))
      .catch(() => {})
  }

  const chargerTout = () => {
    chargerPort()
    chargerEmplacements()
  }

  useEffect(() => {
    api.get(`/ports/${id}`)
      .then((res) => setPort(res.data))
      .catch(() => setErreur('Impossible de charger ce port.'))
      .finally(() => setChargement(false))
    chargerEmplacements()
  }, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/ports" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-700 text-white">
        <div className="flex items-center justify-between gap-4 p-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-ocean-300">{port.ville}</span>
            <h1 className="mt-1 text-white">{port.nom}</h1>
            <div className="mt-6">
              <MeteoPort portId={port.id} sombre />
            </div>
          </div>
          <IllustrationMeteo />
        </div>

        <dl className="grid grid-cols-3 divide-x divide-ocean-700 border-t border-ocean-700 text-center">
          <div className="px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-ocean-300">Capacité</dt>
            <dd className="mt-1 font-display text-2xl text-white">{port.capacite}</dd>
          </div>
          <div className="px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-ocean-300">Amarrés</dt>
            <dd className="mt-1 font-display text-2xl text-white">{port.bateaux}</dd>
          </div>
          <div className="px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-ocean-300">Coordonnées</dt>
            <dd className="mt-1 text-xs text-ocean-200">{port.latitude}, {port.longitude}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <h2 className="mb-3">Emplacements</h2>
        {emplacements.length > 0 ? (
          <CarteEmplacements port={port} emplacements={emplacements} />
        ) : (
          <p className="text-ocean-600">Aucun emplacement pour ce port pour le moment.</p>
        )}
      </div>

      {aRole('ROLE_ADMIN') && (
        <GestionEmplacements port={port} emplacements={emplacements} onMiseAJour={chargerTout} />
      )}

      {aRole('ROLE_OWNER') && (
        <DemandeEmplacement emplacements={emplacements} onMiseAJour={chargerTout} />
      )}
    </main>
  )
}
