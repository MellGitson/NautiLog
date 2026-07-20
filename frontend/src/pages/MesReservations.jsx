import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ListeReservations from '../components/ListeReservations'

export default function MesReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    api.get('/reservations')
      .then((res) => setReservations(res.data))
      .catch(() => setErreur('Impossible de charger les réservations.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  return (
    <main>
      <header className="mb-8">
        <h1>Mes réservations</h1>
        <p className="mt-2 text-ocean-600">Vos demandes de location et les réservations sur vos bateaux.</p>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <ListeReservations reservations={reservations} utilisateur={user} onMiseAJour={charger} />
      )}
    </main>
  )
}
