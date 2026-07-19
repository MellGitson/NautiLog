import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function NouveauTrajet() {
  const navigate = useNavigate()
  const [bateaux, setBateaux] = useState([])
  const [ports, setPorts] = useState([])
  const [erreurs, setErreurs] = useState({})
  const [erreurGlobale, setErreurGlobale] = useState(null)

  const [form, setForm] = useState({
    bateauId: '',
    portDepartId: '',
    portArriveeId: '',
    dateDepart: '',
    dateArrivee: '',
    distanceNm: '',
    notes: '',
  })

  useEffect(() => {
    api.get('/bateaux').then((res) => setBateaux(res.data))
    api.get('/ports').then((res) => setPorts(res.data))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setErreurGlobale(null)

    const payload = {
      bateauId: parseInt(form.bateauId),
      portDepartId: parseInt(form.portDepartId),
      portArriveeId: parseInt(form.portArriveeId),
      dateDepart: form.dateDepart.replace('T', ' ') + ':00',
      dateArrivee: form.dateArrivee ? form.dateArrivee.replace('T', ' ') + ':00' : null,
      distanceNm: form.distanceNm ? parseFloat(form.distanceNm) : null,
      notes: form.notes || null,
    }

    api.post('/trajets', payload)
      .then(() => navigate('/trajets'))
      .catch((err) => {
        if (err.response?.data?.erreurs) {
          setErreurs(err.response.data.erreurs)
        } else {
          setErreurGlobale('Une erreur est survenue.')
        }
      })
  }

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/trajets" className="text-sm font-medium">← Retour à la liste</Link>

      <div className="card mt-4">
        <h1>Nouveau trajet</h1>

        {erreurGlobale && <p role="alert" className="mt-4 font-medium text-coral-600">{erreurGlobale}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="bateauId" className="label-field">Bateau</label>
            <select id="bateauId" name="bateauId" value={form.bateauId} onChange={handleChange} required className="input-field">
              <option value="">— Sélectionner —</option>
              {bateaux.map((b) => (
                <option key={b.id} value={b.id}>{b.nom}</option>
              ))}
            </select>
            {erreurs.bateauId && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.bateauId}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="portDepartId" className="label-field">Port de départ</label>
              <select id="portDepartId" name="portDepartId" value={form.portDepartId} onChange={handleChange} required className="input-field">
                <option value="">— Sélectionner —</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom} ({p.ville})</option>
                ))}
              </select>
              {erreurs.portDepartId && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.portDepartId}</p>}
            </div>

            <div>
              <label htmlFor="portArriveeId" className="label-field">Port d'arrivée</label>
              <select id="portArriveeId" name="portArriveeId" value={form.portArriveeId} onChange={handleChange} required className="input-field">
                <option value="">— Sélectionner —</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom} ({p.ville})</option>
                ))}
              </select>
              {erreurs.portArriveeId && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.portArriveeId}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dateDepart" className="label-field">Date de départ</label>
              <input id="dateDepart" name="dateDepart" type="datetime-local" value={form.dateDepart} onChange={handleChange} required className="input-field" />
              {erreurs.dateDepart && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.dateDepart}</p>}
            </div>

            <div>
              <label htmlFor="dateArrivee" className="label-field">Date d'arrivée (optionnelle)</label>
              <input id="dateArrivee" name="dateArrivee" type="datetime-local" value={form.dateArrivee} onChange={handleChange} className="input-field" />
              {erreurs.dateArrivee && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.dateArrivee}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="distanceNm" className="label-field">Distance (nm, optionnelle)</label>
            <input id="distanceNm" name="distanceNm" type="number" step="0.1" min="0" value={form.distanceNm} onChange={handleChange} className="input-field" />
            {erreurs.distanceNm && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.distanceNm}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="label-field">Notes (optionnelles)</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={4} className="input-field" />
          </div>

          <button type="submit" className="btn-primary w-full">Enregistrer le trajet</button>
        </form>
      </div>
    </main>
  )
}
