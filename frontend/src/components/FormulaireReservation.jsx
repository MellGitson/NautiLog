import { useState } from 'react'
import api from '../services/api'

function IconeCalendrier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
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

export default function FormulaireReservation({ bateau }) {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(false)
  const [enCours, setEnCours] = useState(false)

  if (bateau.statut === 'EN_RÉPARATION') {
    return (
      <div className="card mt-6 opacity-50">
        <h2>Réserver ce bateau</h2>
        <p className="mt-1 text-sm text-ocean-500">Ce bateau est en réparation et ne peut pas être réservé pour le moment.</p>
      </div>
    )
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(false)
    setEnCours(true)
    try {
      await api.post('/reservations', {
        bateauId: bateau.id,
        dateDebut,
        dateFin,
      })
      setSucces(true)
      setDateDebut('')
      setDateFin('')
    } catch (err) {
      setErreur(
        err.response?.data?.erreur
        || err.response?.data?.erreurs?.dateFin
        || err.response?.data?.erreurs?.dateDebut
        || 'Impossible de créer la réservation.'
      )
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="card mt-6">
      <h2 className="flex items-center gap-2">
        <IconeCalendrier />
        Réserver ce bateau
      </h2>
      <p className="mt-1 text-sm text-ocean-500">Votre demande sera soumise au propriétaire pour confirmation.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}

      {succes ? (
        <div className="mt-4 flex animate-fade-in items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <IconeCheck />
          </span>
          <p className="text-sm font-medium text-emerald-800">
            Demande de réservation envoyée. Vous serez notifié dès sa confirmation.
          </p>
        </div>
      ) : (
        <form onSubmit={soumettre} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="dateDebut" className="label-field">Du</label>
            <input id="dateDebut" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required className="input-field" />
          </div>
          <div>
            <label htmlFor="dateFin" className="label-field">Au</label>
            <input id="dateFin" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required className="input-field" />
          </div>
          <button type="submit" disabled={enCours} className="btn-primary self-end">
            {enCours ? 'Envoi…' : 'Demander la réservation'}
          </button>
        </form>
      )}
    </div>
  )
}
