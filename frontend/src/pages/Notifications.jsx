import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function IconeCloche() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

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

  const nbNonLues = notifications.filter((n) => !n.lu).length

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Notifications</h1>
          <p className="mt-2 text-ocean-600">
            {nbNonLues === 0 ? 'Tout est à jour.' : `${nbNonLues} notification${nbNonLues > 1 ? 's' : ''} non lue${nbNonLues > 1 ? 's' : ''}.`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
          <span className="font-display text-3xl leading-none">{notifications.length}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
            Notification{notifications.length > 1 ? 's' : ''}
          </span>
        </div>
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
            className={`card flex items-start gap-4 !p-5 ${n.lu ? 'opacity-60' : ''}`}
          >
            <span className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.lu ? 'bg-ocean-50 text-ocean-400' : 'bg-coral-100 text-coral-600'}`}>
              <IconeCloche />
              {!n.lu && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral-500" />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <p className="text-ocean-800">{n.message}</p>
                {!n.lu && (
                  <button
                    type="button"
                    onClick={() => marquerLu(n.id)}
                    title="Marquer comme lu"
                    aria-label="Marquer comme lu"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ocean-400 transition-all duration-150 hover:scale-110 hover:bg-emerald-500 hover:text-white"
                  >
                    <IconeCheck />
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
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
