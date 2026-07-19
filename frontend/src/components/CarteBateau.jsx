import { Link } from 'react-router-dom'

const BADGES = {
  DISPONIBLE: 'badge-disponible',
  LOUÉ: 'badge-loue',
  EN_RÉPARATION: 'badge-reparation',
}

export default function CarteBateau({ bateau }) {
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h2>{bateau.nom}</h2>
        <span className={BADGES[bateau.statut] ?? 'badge bg-ocean-100 text-ocean-700'}>
          {bateau.statut}
        </span>
      </div>
      <p className="text-sm text-ocean-600">Type : {bateau.type}</p>
      {bateau.port && <p className="text-sm text-ocean-600">Port : {bateau.port.nom}</p>}
      <Link to={`/bateaux/${bateau.id}`} className="mt-2 text-sm font-medium">
        Voir le détail →
      </Link>
    </article>
  )
}
