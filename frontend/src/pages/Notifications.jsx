import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    api.get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => setErreur('Impossible de charger les notifications.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  const marquerLu = async (id) => {
    await api.patch(`/notifications/${id}/lu`)
    charger()
  }

  return (
    <main>
      <header className="mb-8">
        <h1>Notifications</h1>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && notifications.length === 0 && (
        <p className="text-ocean-600">Aucune notification.</p>
      )}

      <ul className="flex flex-col gap-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`card ${n.lu ? 'opacity-60' : 'border-coral-200'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-ocean-800">{n.message}</p>
              {!n.lu && (
                <button
                  type="button"
                  onClick={() => marquerLu(n.id)}
                  className="shrink-0 text-sm font-medium text-ocean-600 hover:text-coral-500"
                >
                  Marquer comme lu
                </button>
              )}
            </div>

            {n.reservationId && (
              <p className="mt-2">
                <Link to="/reservations" className="text-sm font-medium text-ocean-700 hover:text-coral-500">
                  Voir mes réservations →
                </Link>
              </p>
            )}

            {n.suggestions && n.suggestions.length > 0 && (
              <div className="mt-3 border-t border-ocean-100 pt-3">
                <p className="text-sm font-medium text-ocean-500">Bateaux disponibles dans le même port :</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {n.suggestions.map((s) => (
                    <li key={s.id}>
                      <Link to={`/bateaux/${s.id}`} className="text-sm font-medium text-ocean-700 hover:text-coral-500">
                        {s.nom} {s.port && `— ${s.port}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-xs text-ocean-400">{n.creeLe}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
