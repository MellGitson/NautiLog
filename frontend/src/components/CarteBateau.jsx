import { useState } from 'react'
import { Link } from 'react-router-dom'
import { photoBateau } from '../assets/photosBateaux'
import Lightbox from './Lightbox'

const BADGES = {
  DISPONIBLE: 'badge-disponible',
  LOUÉ: 'badge-loue',
  EN_RÉPARATION: 'badge-reparation',
}

export default function CarteBateau({ bateau }) {
  const [zoom, setZoom] = useState(false)
  const photo = photoBateau(bateau)

  return (
    <article className="card !p-0 flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Agrandir la photo de ${bateau.nom}`}
        className="photo-frame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-400 focus-visible:ring-inset"
      >
        <img src={photo} alt={`${bateau.nom} (${bateau.type})`} loading="lazy" />
        <span className="absolute right-2 top-2 badge bg-white/85 text-ocean-700 backdrop-blur-sm">
          {bateau.type}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <h2>{bateau.nom}</h2>
          <span className={BADGES[bateau.statut] ?? 'badge bg-ocean-100 text-ocean-700'}>
            {bateau.statut}
          </span>
        </div>
        {bateau.port && <p className="text-sm text-ocean-600">Port : {bateau.port.nom}</p>}
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
