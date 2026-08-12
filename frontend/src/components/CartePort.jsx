import { Link } from 'react-router-dom'

export default function CartePort({ port, demandesEnAttente = 0 }) {
  return (
    <article className="card flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2>{port.nom}</h2>
        {demandesEnAttente > 0 && (
          <span className="badge bg-coral-500 text-white">
            {demandesEnAttente} demande{demandesEnAttente > 1 ? 's' : ''} en attente
          </span>
        )}
      </div>
      <p className="text-sm text-ocean-600">Ville : {port.ville}</p>
      <p className="text-sm text-ocean-600">Capacité : {port.capacite} bateaux</p>
      <p className="text-sm text-ocean-600">Bateaux amarrés : {port.bateaux}</p>
      <Link to={`/ports/${port.id}`} className="mt-2 text-sm font-medium">
        Voir le détail →
      </Link>
    </article>
  )
}
