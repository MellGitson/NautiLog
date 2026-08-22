import { Link } from 'react-router-dom'

export default function CartePort({ port, demandesEnAttente = 0, selection }) {
  const tauxOccupation = port.capacite > 0 ? Math.round((port.bateaux / port.capacite) * 100) : 0

  return (
    <article className={`relief-eau-sombre relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-700 text-white transition-transform hover:-translate-y-1 ${selection?.checked ? 'ring-2 ring-coral-400' : ''}`}>
      {selection && (
        <label className="absolute right-4 top-4 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow-sm">
          <span className="sr-only">Sélectionner {port.nom}</span>
          <input
            type="checkbox"
            checked={selection.checked}
            onChange={() => selection.onToggle(port.id)}
            className="h-4 w-4 accent-coral-600"
          />
        </label>
      )}

      <div className="p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-ocean-300">{port.ville}</span>
        <h2 className="mt-1 text-white">{port.nom}</h2>
        {demandesEnAttente > 0 && (
          <span className="badge mt-2 bg-coral-500 text-white">
            {demandesEnAttente} demande{demandesEnAttente > 1 ? 's' : ''} en attente
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-ocean-700 px-6 py-4">
        <div className="flex items-center justify-between text-xs text-ocean-300">
          <span>{port.bateaux} / {port.capacite} bateaux</span>
          <span>{tauxOccupation}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-coral-500" style={{ width: `${Math.min(tauxOccupation, 100)}%` }} />
        </div>
        <Link to={`/ports/${port.id}`} className="mt-4 inline-flex text-sm font-medium text-white hover:text-coral-300">
          Voir le détail →
        </Link>
      </div>
    </article>
  )
}
