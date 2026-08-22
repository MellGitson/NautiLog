import { useState } from 'react'
import { Link } from 'react-router-dom'
import { photoBateau } from '../assets/photosBateaux'
import { useAuth } from '../context/AuthContext'
import Lightbox from './Lightbox'

const BADGES = {
  DISPONIBLE: 'badge-disponible',
  LOUÉ: 'badge-loue',
  EN_RÉPARATION: 'badge-reparation',
}

export default function CarteBateau({ bateau, selection }) {
  const { user, aRole } = useAuth()
  const [zoom, setZoom] = useState(false)
  const photo = bateau.photoUrl ? bateau.photoUrl : photoBateau(bateau)
  const estMonBateau = bateau.proprietaire?.email === user?.email
  const enReparation = bateau.statut === 'EN_RÉPARATION'

  return (
    <article className={`relative card !p-0 flex flex-col overflow-hidden ${selection?.checked ? 'ring-2 ring-coral-500' : ''}`}>
      {selection && (
        <label className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow-sm">
          <span className="sr-only">Sélectionner {bateau.nom}</span>
          <input
            type="checkbox"
            checked={selection.checked}
            onChange={() => selection.onToggle(bateau.id)}
            className="h-4 w-4 accent-coral-600"
          />
        </label>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Agrandir la photo de ${bateau.nom}`}
        className={`photo-frame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-inset ${enReparation ? 'opacity-60' : ''}`}
      >
        <img src={photo} alt={`${bateau.nom} (${bateau.type})`} loading="lazy" />
        <span className="absolute right-2 top-2 badge bg-white/90 text-ocean-700">
          {bateau.type}
        </span>
        {estMonBateau && (
          <span className={`absolute top-2 badge bg-coral-500 text-white ${selection ? 'left-11' : 'left-2'}`}>
            Mon bateau
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <h2>{bateau.nom}</h2>
          <span className={BADGES[bateau.statut] ?? 'badge bg-ocean-100 text-ocean-700'}>
            {bateau.statut}
          </span>
        </div>
        {bateau.port && <p className="text-sm text-ocean-600">Port : {bateau.port.nom}</p>}
        {aRole('ROLE_ADMIN') && bateau.misAJourLe && (
          <p className="text-xs text-ocean-400">Mis à jour le {new Date(bateau.misAJourLe).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</p>
        )}
        <Link to={`/bateaux/${bateau.id}`} className="mt-auto text-sm font-medium">
          Voir le détail →
        </Link>
      </div>

      {zoom && (
        <Lightbox src={photo} alt={`${bateau.nom} (${bateau.type})`} onClose={() => setZoom(false)} />
      )}
    </article>
  )
}
