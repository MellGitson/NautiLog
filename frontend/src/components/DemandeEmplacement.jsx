import { useEffect, useState } from 'react'
import api from '../services/api'

export default function DemandeEmplacement({ emplacements, onMiseAJour }) {
  const [mesBateaux, setMesBateaux] = useState([])
  const [bateauId, setBateauId] = useState('')
  const [emplacementId, setEmplacementId] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)

  const libres = emplacements.filter((e) => !e.bateau)

  useEffect(() => {
    api.get('/bateaux').then((res) => setMesBateaux(res.data)).catch(() => {})
  }, [])

  if (libres.length === 0) {
    return (
      <div className="card mt-6">
        <h2>Demander un emplacement</h2>
        <p className="mt-1 text-sm text-ocean-500">Aucun emplacement libre actuellement pour ce port.</p>
      </div>
    )
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.post('/demandes-emplacements', {
        emplacementId: parseInt(emplacementId, 10),
        bateauId: parseInt(bateauId, 10),
      })
      setSucces('Votre demande a été envoyée à l\'administrateur.')
      setBateauId('')
      setEmplacementId('')
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible d\'envoyer la demande.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="card mt-6">
      <h2>Demander un emplacement</h2>
      <p className="mt-1 text-sm text-ocean-500">Choisissez un de vos bateaux et un emplacement libre. Un administrateur validera votre demande.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
      {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">{succes}</p>}

      <form onSubmit={soumettre} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bateauId" className="label-field">Votre bateau</label>
          <select id="bateauId" value={bateauId} onChange={(e) => setBateauId(e.target.value)} required className="input-field">
            <option value="" disabled>Choisir un bateau</option>
            {mesBateaux.map((b) => (
              <option key={b.id} value={b.id}>{b.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="emplacementId" className="label-field">Emplacement libre</label>
          <select id="emplacementId" value={emplacementId} onChange={(e) => setEmplacementId(e.target.value)} required className="input-field">
            <option value="" disabled>Choisir un emplacement</option>
            {libres.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={enCours} className="btn-primary sm:col-span-2">
          Envoyer la demande
        </button>
      </form>
    </div>
  )
}
