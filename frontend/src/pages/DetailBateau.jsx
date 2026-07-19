import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailBateau() {
  const { id } = useParams()
  const [bateau, setBateau] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/bateaux/${id}`)
      .then((res) => setBateau(res.data))
      .catch(() => setErreur('Impossible de charger ce bateau.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/bateaux" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4">
        <h1>{bateau.nom}</h1>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-ocean-500">Type</dt>
            <dd className="text-ocean-900">{bateau.type}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Statut</dt>
            <dd className="text-ocean-900">{bateau.statut}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Créé le</dt>
            <dd className="text-ocean-900">{bateau.creeLe}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-ocean-500">Propriétaire</dt>
            <dd className="text-ocean-900">{bateau.proprietaire.email}</dd>
          </div>

          {bateau.port && (
            <div>
              <dt className="text-sm font-medium text-ocean-500">Port</dt>
              <dd className="text-ocean-900">{bateau.port.nom} — {bateau.port.ville}</dd>
            </div>
          )}
        </dl>
      </div>
    </main>
  )
}
