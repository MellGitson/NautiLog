import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import CarteBateau from '../components/CarteBateau'
import api from '../services/api'

export default function ListeBateaux() {
  const { deconnexion } = useAuth()
  const [bateaux, setBateaux] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/bateaux')
      .then((res) => setBateaux(res.data))
      .catch(() => setErreur('Impossible de charger les bateaux.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header>
        <h1>Mes bateaux</h1>
        <button onClick={deconnexion}>Se déconnecter</button>
      </header>

      {chargement && <p>Chargement…</p>}
      {erreur && <p role="alert">{erreur}</p>}

      {!chargement && !erreur && bateaux.length === 0 && (
        <p>Vous n'avez pas encore de bateau.</p>
      )}

      <section>
        {bateaux.map((bateau) => (
          <CarteBateau key={bateau.id} bateau={bateau} />
        ))}
      </section>
    </main>
  )
}
