import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailPort() {
  const { id } = useParams()
  const [port, setPort] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/ports/${id}`)
      .then((res) => setPort(res.data))
      .catch(() => setErreur('Impossible de charger ce port.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/ports" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4">
        <h1>{port.nom}</h1>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-ocean-500">Ville</dt>
            <dd className="text-ocean-900">{port.ville}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Capacité</dt>
            <dd className="text-ocean-900">{port.capacite} bateaux</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Bateaux amarrés</dt>
            <dd className="text-ocean-900">{port.bateaux}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Coordonnées</dt>
            <dd className="text-ocean-900">{port.latitude}, {port.longitude}</dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
