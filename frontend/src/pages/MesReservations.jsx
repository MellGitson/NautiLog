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
      <header className="mb-8 flex items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Mes réservations</h1>
          <p className="mt-2 text-ocean-600">Vos demandes de location et les réservations sur vos bateaux.</p>
        </div>
        <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
          <span className="font-display text-3xl leading-none">{reservations.length}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
            Réservation{reservations.length > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <ListeReservations reservations={reservations} utilisateur={user} onMiseAJour={charger} />
      )}
    </main>
  )
}
