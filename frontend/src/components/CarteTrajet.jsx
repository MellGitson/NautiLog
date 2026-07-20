import { Link } from 'react-router-dom'

export default function CarteTrajet({ trajet }) {
  return (
    <article className="card flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-xl">
        {trajet.portDepart.nom} <span className="text-coral-500">→</span> {trajet.portArrivee.nom}
      </h2>
      <p className="text-sm text-ocean-600">Bateau : {trajet.bateau.nom}</p>
      <p className="text-sm text-ocean-600">Départ : {trajet.dateDepart}</p>
      <p className="text-sm text-ocean-600">
        Arrivée : {trajet.dateArrivee ?? <span className="badge-disponible badge">En cours</span>}
      </p>
      {trajet.distanceNm && <p className="text-sm text-ocean-600">Distance : {trajet.distanceNm} nm</p>}
      <Link to={`/trajets/${trajet.id}`} className="mt-2 text-sm font-medium">
        Voir le détail →
      </Link>
    </article>
  )
}
