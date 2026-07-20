import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { photoBateau } from '../assets/photosBateaux'
import { useAuth } from '../context/AuthContext'
import Lightbox from '../components/Lightbox'
import GestionBateau from '../components/GestionBateau'

export default function DetailBateau() {
  const { id } = useParams()
  const { user, aRole } = useAuth()
  const [bateau, setBateau] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [zoom, setZoom] = useState(false)

  const recharger = () => {
    api.get(`/bateaux/${id}`)
      .then((res) => setBateau(res.data))
      .catch(() => setErreur('Impossible de charger ce bateau.'))
      .finally(() => setChargement(false))
  }

  useEffect(recharger, [id])

  if (chargement) return <p className="text-ocean-600">Chargement…</p>
  if (erreur)     return <p role="alert" className="font-medium text-coral-600">{erreur}</p>

  const peutGerer = aRole('ROLE_ADMIN') || bateau.proprietaire.email === user?.email
  const photo = bateau.photoUrl ? bateau.photoUrl : photoBateau(bateau)

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
          <div className="flex flex-wrap items-center gap-3">
            <h1>{bateau.nom}</h1>
            {peutGerer && bateau.proprietaire.email === user?.email && (
              <span className="badge bg-coral-500 text-white">Mon bateau</span>
            )}
            {peutGerer && aRole('ROLE_ADMIN') && bateau.proprietaire.email !== user?.email && (
              <span className="badge bg-ocean-500 text-white">Vue administrateur</span>
            )}
          </div>

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

            {bateau.matricule && (
              <div>
                <dt className="text-sm font-medium text-ocean-500">Matricule</dt>
                <dd className="text-ocean-900">{bateau.matricule}</dd>
              </div>
            )}
          </dl>

          {bateau.description && (
            <p className="mt-4 text-ocean-700">{bateau.description}</p>
          )}

          {bateau.reparations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-ocean-500">Historique des réparations</h2>
              <ul className="mt-2 space-y-1">
                {bateau.reparations.map((r) => (
                  <li key={r.id} className="text-sm text-ocean-700">
                    <span className="font-medium">{r.date}</span> — {r.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {zoom && (
        <Lightbox src={photo} alt={`${bateau.nom} (${bateau.type})`} onClose={() => setZoom(false)} />
      )}

      {peutGerer && <GestionBateau bateau={bateau} onMiseAJour={recharger} />}
    </main>
  )
}
