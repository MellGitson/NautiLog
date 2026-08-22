import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api'

export default function ModalNouvelleReservation({ onFermer, onCree }) {
  const [bateaux, setBateaux] = useState([])
  const [locataires, setLocataires] = useState([])
  const [bateauId, setBateauId] = useState('')
  const [locataireId, setLocataireId] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState(null)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    api.get('/bateaux').then((res) => setBateaux(res.data)).catch(() => {})
    api.get('/admin/users').then((res) => {
      setLocataires(res.data.filter((u) => u.roles.includes('ROLE_RENTER') || u.roles.includes('ROLE_OWNER')))
    }).catch(() => {})
  }, [])

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setEnCours(true)
    try {
      await api.post('/reservations', {
        bateauId: Number(bateauId),
        locataireId: Number(locataireId),
        dateDebut,
        dateFin,
      })
      onCree()
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-nouvelle-reservation"
      onClick={() => !enCours && onFermer()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 backdrop-blur-sm p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="card w-full max-w-md">
        <h2 id="titre-nouvelle-reservation">Nouvelle réservation</h2>
        <p className="mt-1 text-sm text-ocean-600">Créez une réservation pour le compte d'un utilisateur.</p>

        <form onSubmit={soumettre} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="locataire" className="label-field">Locataire</label>
            <select
              id="locataire"
              required
              value={locataireId}
              onChange={(e) => setLocataireId(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>Choisir un utilisateur…</option>
              {locataires.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bateau" className="label-field">Bateau</label>
            <select
              id="bateau"
              required
              value={bateauId}
              onChange={(e) => setBateauId(e.target.value)}
              className="input-field"
            >
              <option value="" disabled>Choisir un bateau…</option>
              {bateaux.map((b) => (
                <option key={b.id} value={b.id}>{b.nom} ({b.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateDebut" className="label-field">Du</label>
              <input id="dateDebut" type="date" required value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="dateFin" className="label-field">Au</label>
              <input id="dateFin" type="date" required value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="input-field" />
            </div>
          </div>

          {erreur && <p role="alert" className="text-sm font-medium text-coral-600">{erreur}</p>}

          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={enCours} className="btn-primary">
              {enCours ? 'Création…' : 'Créer la réservation'}
            </button>
            <button type="button" onClick={onFermer} disabled={enCours} className="btn-ghost">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
