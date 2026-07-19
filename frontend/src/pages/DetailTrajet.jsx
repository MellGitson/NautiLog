import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailTrajet() {
  const { id } = useParams()
  const [trajet, setTrajet] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/trajets/${id}`)
      .then((res) => setTrajet(res.data))
      .catch(() => setErreur('Impossible de charger ce trajet.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p>Chargement…</p>
  if (erreur)     return <p role="alert">{erreur}</p>

  return (
    <main>
      <Link to="/trajets">← Retour à la liste</Link>

      <h1>{trajet.portDepart.nom} → {trajet.portArrivee.nom}</h1>

      <dl>
        <dt>Bateau</dt>
        <dd>{trajet.bateau.nom}</dd>

        <dt>Port de départ</dt>
        <dd>{trajet.portDepart.nom} ({trajet.portDepart.ville})</dd>

        <dt>Port d'arrivée</dt>
        <dd>{trajet.portArrivee.nom} ({trajet.portArrivee.ville})</dd>

        <dt>Date de départ</dt>
        <dd>{trajet.dateDepart}</dd>

        <dt>Date d'arrivée</dt>
        <dd>{trajet.dateArrivee ?? 'En cours'}</dd>

        {trajet.distanceNm && (
          <>
            <dt>Distance</dt>
            <dd>{trajet.distanceNm} nm</dd>
          </>
        )}

        {trajet.notes && (
          <>
            <dt>Notes</dt>
            <dd>{trajet.notes}</dd>
          </>
        )}

        <dt>Enregistré le</dt>
        <dd>{trajet.creeLe}</dd>
      </dl>
    </main>
  )
}
