import { useState } from 'react'
import api from '../services/api'

export default function FormulaireReservation({ bateau }) {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(false)
  const [enCours, setEnCours] = useState(false)

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
      <h2>Réserver ce bateau</h2>
      <p className="mt-1 text-sm text-ocean-500">Votre demande sera soumise au propriétaire pour confirmation.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
      {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">Demande de réservation envoyée.</p>}

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
    </div>
  )
}
