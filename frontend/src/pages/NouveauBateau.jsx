import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const TYPES = ['Vedette', 'Voilier', 'Zodiac', 'Bateau de pêche']
const STATUTS = ['DISPONIBLE', 'LOUÉ', 'EN_RÉPARATION']

const STYLES_STATUT = {
  DISPONIBLE: { actif: 'bg-ocean-500 text-white', inactif: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' },
  LOUÉ: { actif: 'bg-coral-500 text-white', inactif: 'bg-coral-50 text-coral-700 hover:bg-coral-100' },
  EN_RÉPARATION: { actif: 'bg-amber-500 text-white', inactif: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
}

export default function NouveauBateau() {
  const navigate = useNavigate()
  const [ports, setPorts] = useState([])
  const [erreurs, setErreurs] = useState({})
  const [erreurGlobale, setErreurGlobale] = useState(null)
  const [enCours, setEnCours] = useState(false)

  const [form, setForm] = useState({
    nom: '',
    type: '',
    statut: 'DISPONIBLE',
    portId: '',
    description: '',
  })

  useEffect(() => {
    api.get('/ports').then((res) => setPorts(res.data))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setErreurGlobale(null)
    setEnCours(true)

    const payload = {
      nom: form.nom,
      type: form.type,
      statut: form.statut,
      portId: form.portId ? parseInt(form.portId, 10) : null,
      description: form.description || null,
    }

    api.post('/bateaux', payload)
      .then((res) => navigate(`/bateaux/${res.data.id}`))
      .catch((err) => {
        if (err.response?.data?.erreurs) {
          setErreurs(err.response.data.erreurs)
        } else {
          setErreurGlobale(err.response?.data?.erreur || 'Une erreur est survenue.')
        }
      })
      .finally(() => setEnCours(false))
  }

  return (
    <main className="mx-auto max-w-2xl">
      <Link to="/bateaux" className="text-sm font-medium">← Retour à la liste</Link>

      <form onSubmit={handleSubmit} className="card mt-4">
        <h1>Ajouter un bateau</h1>

        {erreurGlobale && <p role="alert" className="mt-4 font-medium text-coral-600">{erreurGlobale}</p>}

        <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
          <p className="text-sm font-medium text-ocean-500">Statut</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Statut du bateau">
            {STATUTS.map((s) => {
              const style = STYLES_STATUT[s]
              const actif = form.statut === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, statut: s })}
                  aria-pressed={actif}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${actif ? style.actif : style.inactif}`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
          <p className="text-sm font-medium text-ocean-500">Informations générales</p>
          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="nom" className="label-field">Nom</label>
              <input id="nom" name="nom" value={form.nom} onChange={handleChange} required className="input-field" />
              {erreurs.nom && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.nom}</p>}
            </div>

            <div>
              <label htmlFor="type" className="label-field">Type</label>
              <select id="type" name="type" value={form.type} onChange={handleChange} required className="input-field">
                <option value="">— Sélectionner —</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {erreurs.type && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.type}</p>}
            </div>

            <div>
              <label htmlFor="description" className="label-field">Description (optionnelle)</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} className="input-field" />
              {erreurs.description && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.description}</p>}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
          <p className="text-sm font-medium text-ocean-500">Emplacement</p>
          <div className="mt-3">
            <label htmlFor="portId" className="label-field">Port (optionnel)</label>
            <select id="portId" name="portId" value={form.portId} onChange={handleChange} className="input-field">
              <option value="">— Aucun —</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} ({p.ville})</option>
              ))}
            </select>
            {erreurs.portId && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.portId}</p>}
          </div>
        </div>

        <button type="submit" disabled={enCours} className="btn-primary mt-5 w-full">Ajouter le bateau</button>
      </form>
    </main>
  )
}
