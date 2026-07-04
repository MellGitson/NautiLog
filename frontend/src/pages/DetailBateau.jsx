import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailBateau() {
  const { id } = useParams()
  const [bateau, setBateau] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/bateaux/${id}`)
      .then((res) => setBateau(res.data))
      .catch(() => setErreur('Impossible de charger ce bateau.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p>Chargement…</p>
  if (erreur)     return <p role="alert">{erreur}</p>

  return (
    <main>
      <Link to="/bateaux">← Retour à la liste</Link>

      <h1>{bateau.nom}</h1>

      <dl>
        <dt>Type</dt>
        <dd>{bateau.type}</dd>

        <dt>Statut</dt>
        <dd>{bateau.statut}</dd>

        <dt>Créé le</dt>
        <dd>{bateau.creeLe}</dd>

        <dt>Propriétaire</dt>
        <dd>{bateau.proprietaire.email}</dd>

        {bateau.port && (
          <>
            <dt>Port</dt>
            <dd>{bateau.port.nom} — {bateau.port.ville}</dd>
          </>
        )}
      </dl>
    </main>
  )
}
