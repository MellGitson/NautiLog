import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { photoBateau } from '../assets/photosBateaux'
import { useAuth } from '../context/AuthContext'
import Lightbox from '../components/Lightbox'
import GestionBateau from '../components/GestionBateau'
import FormulaireReservation from '../components/FormulaireReservation'

const BADGES = {
  DISPONIBLE: 'badge-disponible',
  LOUÉ: 'badge-loue',
  EN_RÉPARATION: 'badge-reparation',
}

function IconePdf() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h1a1.5 1.5 0 0 0 0-3H9v5" />
      <path d="M13 17v-5h2" />
      <path d="M13 15h1.5" />
      <path d="M18 12v5" />
      <path d="M18 14h1.5" />
    </svg>
  )
}

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
  const enReparation = bateau.statut === 'EN_RÉPARATION'

  const telechargerPdf = async () => {
    const { data } = await api.get(`/bateaux/${id}/export-pdf`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const lien = document.createElement('a')
    lien.href = url
    lien.download = `fiche-bateau-${bateau.id}.pdf`
    lien.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/bateaux" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4 !p-0 overflow-hidden">
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={`Agrandir la photo de ${bateau.nom}`}
          className={`photo-frame aspect-[16/9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-inset ${enReparation ? 'opacity-60' : ''}`}
        >
          <img src={photo} alt={`${bateau.nom} (${bateau.type})`} />
        </button>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1>{bateau.nom}</h1>
                {peutGerer && bateau.proprietaire.email === user?.email && (
                  <span className="badge bg-coral-500 text-white">Mon bateau</span>
                )}
                {peutGerer && aRole('ROLE_ADMIN') && bateau.proprietaire.email !== user?.email && (
                  <span className="badge bg-ocean-500 text-white">Vue administrateur</span>
                )}
              </div>
              <p className="mt-1 text-sm text-ocean-500">
                {bateau.type}{bateau.port && ` · ${bateau.port.nom}, ${bateau.port.ville}`}
              </p>
            </div>
            <span className={BADGES[bateau.statut] ?? 'badge bg-ocean-100 text-ocean-700'}>{bateau.statut}</span>
          </div>

          {bateau.description && (
            <p className="mt-5 text-ocean-700">{bateau.description}</p>
          )}

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-ocean-100 pt-5 text-sm">
            <div>
              <dt className="text-ocean-400">Propriétaire</dt>
              <dd className="mt-0.5 font-medium text-ocean-800">{bateau.proprietaire.email}</dd>
            </div>
            <div>
              <dt className="text-ocean-400">Enregistré le</dt>
              <dd className="mt-0.5 font-medium text-ocean-800">{bateau.creeLe}</dd>
            </div>
          </dl>

          {bateau.reparations.length > 0 && (
            <div className="mt-6 border-t border-ocean-100 pt-5">
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

      {peutGerer && (
        <button type="button" onClick={telechargerPdf} className="btn-ghost mt-4 inline-flex items-center gap-2 !px-4 !py-1.5 text-sm">
          <IconePdf />
          Télécharger la fiche bateau (PDF)
        </button>
      )}

      {peutGerer && <GestionBateau bateau={bateau} onMiseAJour={recharger} />}

      {!peutGerer && <FormulaireReservation bateau={bateau} />}
    </main>
  )
}
