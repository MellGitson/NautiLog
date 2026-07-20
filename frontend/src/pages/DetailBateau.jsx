import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { photoBateau } from '../assets/photosBateaux'
import Lightbox from '../components/Lightbox'

export default function DetailBateau() {
  const { id } = useParams()
  const [bateau, setBateau] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    api.get(`/bateaux/${id}`)
      .then((res) => setBateau(res.data))
      .catch(() => setErreur('Impossible de charger ce bateau.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  const photo = photoBateau(bateau)

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/bateaux" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4 !p-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Agrandir la photo de ${bateau.nom}`}
          className="photo-frame aspect-[16/9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-inset"
        >
          <img src={photo} alt={`${bateau.nom} (${bateau.type})`} />
        </button>

        <div className="p-6">
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
      </div>

      {zoom && (
        <Lightbox src={photo} alt={`${bateau.nom} (${bateau.type})`} onClose={() => setZoom(false)} />
      )}
    </main>
  )
}
