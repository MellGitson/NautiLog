import { useEffect, useState } from 'react'
import CarteBateau from '../components/CarteBateau'
import api from '../services/api'

export default function ListeBateaux() {
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
      <header className="mb-8">
        <h1>Mes bateaux</h1>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && bateaux.length === 0 && (
        <p className="text-ocean-600">Vous n'avez pas encore de bateau.</p>
      )}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bateaux.map((bateau) => (
          <CarteBateau key={bateau.id} bateau={bateau} />
        ))}
      </section>
    </main>
  )
}
