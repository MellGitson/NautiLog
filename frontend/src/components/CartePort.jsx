import { Link } from 'react-router-dom'

export default function CartePort({ port }) {
  return (
    <article>
      <h2>{port.nom}</h2>
      <p>Ville : {port.ville}</p>
      <p>Capacité : {port.capacite} bateaux</p>
      <p>Bateaux amarrés : {port.bateaux}</p>
      <Link to={`/ports/${port.id}`}>Voir le détail</Link>
    </article>
  )
}
