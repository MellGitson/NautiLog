import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { creerSignalement } from '../services/signalements'
import { useAuth } from '../context/AuthContext'

const LABELS_STATUT = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
}

const STYLE_STATUT = {
  EN_ATTENTE: 'bg-amber-100 text-amber-800',
  CONFIRMEE: 'bg-emerald-100 text-emerald-800',
  ANNULEE: 'bg-ocean-50 text-ocean-400',
}

function IconeCalendrier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
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

function IconeCroix() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function IconeDrapeau() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M4 22V4" />
      <path d="M4 4h14l-2 4 2 4H4" />
    </svg>
  )
}

export default function ListeReservations({ reservations, utilisateur, onMiseAJour }) {
  const { aRole } = useAuth()
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [signalementOuvert, setSignalementOuvert] = useState(null)
  const [messageSignalement, setMessageSignalement] = useState('')
  const [envoiSignalement, setEnvoiSignalement] = useState(false)
  const [confirmationSignalement, setConfirmationSignalement] = useState(null)

  const changerStatut = async (reservation, statut) => {
    setErreur(null)
    setEnCours(reservation.id)
    try {
      await api.patch(`/reservations/${reservation.id}/statut`, { statut })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de mettre à jour la réservation #${reservation.id}.`)
    } finally {
      setEnCours(null)
    }
  }

  const ouvrirSignalement = (id) => {
    setSignalementOuvert(id)
    setMessageSignalement('')
    setConfirmationSignalement(null)
  }

  const envoyerSignalement = async (reservation) => {
    setErreur(null)
    setEnvoiSignalement(true)
    try {
      await creerSignalement(reservation.id, messageSignalement)
      setSignalementOuvert(null)
      setConfirmationSignalement(reservation.id)
    } catch {
      setErreur(`Impossible d'envoyer le signalement pour la réservation #${reservation.id}.`)
    } finally {
      setEnvoiSignalement(false)
    }
  }

  if (reservations.length === 0) {
    return <p className="text-ocean-600">Aucune réservation.</p>
  }

  return (
    <div>
      {erreur && <p role="alert" className="mb-3 text-sm font-medium text-coral-600">{erreur}</p>}

      <div className="overflow-x-auto rounded-xl border border-ocean-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ocean-100 bg-ocean-50/60 text-xs uppercase tracking-wide text-ocean-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Bateau</th>
              <th scope="col" className="px-4 py-3 font-semibold">Locataire</th>
              <th scope="col" className="px-4 py-3 font-semibold">Période</th>
              <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
              <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-50">
            {reservations.map((r) => {
              const estLocataire = r.locataire.email === utilisateur?.email
              const peutConfirmer = !estLocataire && r.statut === 'EN_ATTENTE'
              const peutAnnuler = r.statut !== 'ANNULEE'
              const peutSignaler = !aRole('ROLE_ADMIN')

              return (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Link to={`/bateaux/${r.bateau.id}`} className="font-medium text-ocean-900 hover:text-coral-500">
                      {r.bateau.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ocean-700">{r.locataire.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-50 px-2.5 py-1 text-xs font-medium text-ocean-700">
                      <IconeCalendrier />
                      {r.dateDebut} <span className="text-ocean-400">→</span> {r.dateFin}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex animate-fade-in items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLE_STATUT[r.statut]}`}>
                      {r.statut === 'EN_ATTENTE' && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                        </span>
                      )}
                      {LABELS_STATUT[r.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-0.5 rounded-lg border border-ocean-100 bg-white p-0.5">
                      {peutConfirmer && (
                        <button
                          type="button"
                          onClick={() => changerStatut(r, 'CONFIRMEE')}
                          disabled={enCours === r.id}
                          title="Confirmer la réservation"
                          aria-label="Confirmer la réservation"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-500 transition-all duration-150 hover:scale-110 hover:bg-emerald-500 hover:text-white disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-emerald-500"
                        >
                          <IconeCheck />
                        </button>
                      )}
                      {peutAnnuler && (
                        <button
                          type="button"
                          onClick={() => changerStatut(r, 'ANNULEE')}
                          disabled={enCours === r.id}
                          title="Annuler la réservation"
                          aria-label="Annuler la réservation"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-coral-400 transition-all duration-150 hover:scale-110 hover:bg-coral-500 hover:text-white disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-coral-400"
                        >
                          <IconeCroix />
                        </button>
                      )}
                      {peutSignaler && signalementOuvert !== r.id && (
                        <button
                          type="button"
                          onClick={() => ouvrirSignalement(r.id)}
                          title="Signaler un problème"
                          aria-label="Signaler un problème"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-ocean-500 transition-all duration-150 hover:scale-110 hover:bg-ocean-500 hover:text-white"
                        >
                          <IconeDrapeau />
                        </button>
                      )}
                      {!peutConfirmer && !peutAnnuler && !(peutSignaler && signalementOuvert !== r.id) && (
                        <span className="px-2 py-1 text-xs text-ocean-300">—</span>
                      )}
                    </div>

                    {peutSignaler && signalementOuvert === r.id && (
                      <div className="mt-3 flex flex-col gap-2">
                        <textarea
                          className="input-field"
                          rows={2}
                          placeholder="Décrivez le problème…"
                          value={messageSignalement}
                          onChange={(e) => setMessageSignalement(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => envoyerSignalement(r)}
                            disabled={envoiSignalement || !messageSignalement.trim()}
                            className="btn-accent !px-4 !py-1.5 text-sm"
                          >
                            Envoyer
                          </button>
                          <button
                            type="button"
                            onClick={() => setSignalementOuvert(null)}
                            className="text-sm font-medium text-ocean-500 hover:text-coral-500"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}

                    {peutSignaler && confirmationSignalement === r.id && (
                      <p className="mt-2 text-sm text-ocean-600">
                        Signalement envoyé, l'administrateur vous répondra prochainement.
                      </p>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
