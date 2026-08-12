import { Link } from 'react-router-dom'

export default function CartePort({ port, demandesEnAttente = 0, selection }) {
  return (
    <article className={`relative card flex flex-col gap-3 ${selection?.checked ? 'ring-2 ring-coral-500' : ''}`}>
      {selection && (
        <label className="absolute right-4 top-4 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow-sm">
          <span className="sr-only">Sélectionner {port.nom}</span>
          <input
            type="checkbox"
            checked={selection.checked}
            onChange={() => selection.onToggle(port.id)}
            className="h-4 w-4 accent-coral-600"
          />
        </label>
      )}
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
