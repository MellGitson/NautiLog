import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CarteTrajet from '../components/CarteTrajet'
import api from '../services/api'

export default function ListeTrajets() {
  const { deconnexion } = useAuth()
  const [trajets, setTrajets] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/trajets')
      .then((res) => setTrajets(res.data))
      .catch(() => setErreur('Impossible de charger les trajets.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header>
        <h1>Mes trajets</h1>
        <div>
          <Link to="/trajets/nouveau">Nouveau trajet</Link>
          <button onClick={deconnexion}>Se déconnecter</button>
        </div>
      </header>

      {chargement && <p>Chargement…</p>}
      {erreur && <p role="alert">{erreur}</p>}

      {!chargement && !erreur && trajets.length === 0 && (
        <p>Aucun trajet enregistré.</p>
      )}

      <section>
        {trajets.map((trajet) => (
          <CarteTrajet key={trajet.id} trajet={trajet} />
        ))}
      </section>
    </main>
  )
}
