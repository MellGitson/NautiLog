import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function DetailPort() {
  const { id } = useParams()
  const [port, setPort] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get(`/ports/${id}`)
      .then((res) => setPort(res.data))
      .catch(() => setErreur('Impossible de charger ce port.'))
      .finally(() => setChargement(false))
  }, [id])

  if (chargement) return <p>Chargement…</p>
  if (erreur)     return <p role="alert">{erreur}</p>

  return (
    <main>
      <Link to="/ports">← Retour à la liste</Link>

      <h1>{port.nom}</h1>

      <dl>
        <dt>Ville</dt>
        <dd>{port.ville}</dd>

        <dt>Capacité</dt>
        <dd>{port.capacite} bateaux</dd>

        <dt>Bateaux amarrés</dt>
        <dd>{port.bateaux}</dd>

        <dt>Coordonnées</dt>
        <dd>{port.latitude}, {port.longitude}</dd>
      </dl>
    </main>
  )
}
