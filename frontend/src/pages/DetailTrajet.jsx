import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailTrajet() {
  const { id } = useParams()
  const [trajet, setTrajet] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/trajets/${id}`)
      .then((res) => setTrajet(res.data))
      .catch(() => setErreur('Impossible de charger ce trajet.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/trajets" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4">
        <h1 className="flex items-center gap-3">
          {trajet.portDepart.nom} <span className="text-coral-500">→</span> {trajet.portArrivee.nom}
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-ocean-500">Bateau</dt>
            <dd className="text-ocean-900">{trajet.bateau.nom}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Port de départ</dt>
            <dd className="text-ocean-900">{trajet.portDepart.nom} ({trajet.portDepart.ville})</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Port d'arrivée</dt>
            <dd className="text-ocean-900">{trajet.portArrivee.nom} ({trajet.portArrivee.ville})</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Date de départ</dt>
            <dd className="text-ocean-900">{trajet.dateDepart}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Date d'arrivée</dt>
            <dd className="text-ocean-900">{trajet.dateArrivee ?? <span className="badge-disponible badge">En cours</span>}</dd>
          </div>

          {trajet.distanceNm && (
            <div>
              <dt className="text-sm font-medium text-ocean-500">Distance</dt>
              <dd className="text-ocean-900">{trajet.distanceNm} nm</dd>
            </div>
          )}

          {trajet.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-ocean-500">Notes</dt>
              <dd className="text-ocean-900">{trajet.notes}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-ocean-500">Enregistré le</dt>
            <dd className="text-ocean-900">{trajet.creeLe}</dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
