import { Link } from 'react-router-dom'

export default function CarteTrajet({ trajet }) {
  return (
    <article>
      <h2>{trajet.portDepart.nom} → {trajet.portArrivee.nom}</h2>
      <p>Bateau : {trajet.bateau.nom}</p>
      <p>Départ : {trajet.dateDepart}</p>
      <p>Arrivée : {trajet.dateArrivee ?? 'En cours'}</p>
      {trajet.distanceNm && <p>Distance : {trajet.distanceNm} nm</p>}
      <Link to={`/trajets/${trajet.id}`}>Voir le détail</Link>
    </article>
  )
}
