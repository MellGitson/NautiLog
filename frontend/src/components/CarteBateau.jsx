export default function CarteBateau({ bateau }) {
  return (
    <article>
      <h2>{bateau.nom}</h2>
      <p>Type : {bateau.type}</p>
      <p>Statut : {bateau.statut}</p>
      {bateau.port && <p>Port : {bateau.port.nom}</p>}
    </article>
  )
}
