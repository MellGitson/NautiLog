import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ListeReservations from '../components/ListeReservations'
import ModalNouvelleReservation from '../components/ModalNouvelleReservation'

export default function AdminReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [modaleOuverte, setModaleOuverte] = useState(false)

  const charger = () => {
    api.get('/reservations')
      .then((res) => setReservations(res.data))
      .catch(() => setErreur('Impossible de charger les réservations.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  const nbEnAttente = reservations.filter((r) => r.statut === 'EN_ATTENTE').length

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Réservations</h1>
          <p className="mt-2 text-ocean-600">
            {nbEnAttente === 0
              ? 'Toutes flottes confondues.'
              : `${nbEnAttente} en attente de confirmation, toutes flottes confondues.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setModaleOuverte(true)} className="btn-accent inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouvelle réservation
          </button>
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
            <span className="font-display text-3xl leading-none">{reservations.length}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
              Réservation{reservations.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <ListeReservations reservations={reservations} utilisateur={user} onMiseAJour={charger} />
      )}

      {modaleOuverte && (
        <ModalNouvelleReservation
          onFermer={() => setModaleOuverte(false)}
          onCree={() => { setModaleOuverte(false); charger() }}
        />
      )}
    </main>
  )
}
