import { useEffect, useState } from 'react'
import api from '../services/api'
import CarteBateau from '../components/CarteBateau'

export default function AdminFlotte() {
  const [bateaux, setBateaux] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/bateaux')
      .then((res) => setBateaux(res.data))
      .catch(() => setErreur('Impossible de charger la flotte.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header className="mb-8">
        <h1>Flotte</h1>
        <p className="mt-2 text-ocean-600">{bateaux.length} bateau(x) au total. Cliquez sur un bateau pour gérer son statut, ses photos et son historique.</p>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bateaux.map((bateau) => (
            <CarteBateau key={bateau.id} bateau={bateau} />
          ))}
        </section>
      )}
    </main>
  )
}
