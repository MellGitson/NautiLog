import { useEffect, useState } from 'react'
import CartePort from '../components/CartePort'
import api from '../services/api'

export default function ListePorts() {
  const [ports, setPorts] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/ports')
      .then((res) => setPorts(res.data))
      .catch(() => setErreur('Impossible de charger les ports.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <h1>Les ports</h1>

      {chargement && <p>Chargement…</p>}
      {erreur && <p role="alert">{erreur}</p>}

      {!chargement && !erreur && ports.length === 0 && (
        <p>Aucun port disponible.</p>
      )}

      <section>
        {ports.map((port) => (
          <CartePort key={port.id} port={port} />
        ))}
      </section>
    </main>
  )
}
