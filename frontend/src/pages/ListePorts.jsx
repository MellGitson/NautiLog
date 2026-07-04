import { useEffect, useState } from 'react'
import CartePort from '../components/CartePort'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function ListePorts() {
  const { deconnexion } = useAuth()
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
      <header>
        <h1>Les ports</h1>
        <button onClick={deconnexion}>Se déconnecter</button>
      </header>

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
