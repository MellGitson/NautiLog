import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const TYPES = ['Vedette', 'Voilier', 'Zodiac', 'Bateau de pêche']
const STATUTS = ['DISPONIBLE', 'LOUÉ', 'EN_RÉPARATION']

const STYLES_STATUT = {
  DISPONIBLE: { actif: 'bg-ocean-500 text-white', inactif: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' },
  LOUÉ: { actif: 'bg-coral-500 text-white', inactif: 'bg-coral-50 text-coral-700 hover:bg-coral-100' },
  EN_RÉPARATION: { actif: 'bg-amber-500 text-white', inactif: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
}

export default function NouveauBateau() {
  const navigate = useNavigate()
  const { aRole } = useAuth()
  const doitChoisirProprietaire = aRole('ROLE_ADMIN') && !aRole('ROLE_OWNER')
  const inputPhotoRef = useRef(null)
  const [ports, setPorts] = useState([])
  const [proprietaires, setProprietaires] = useState([])
  const [erreurs, setErreurs] = useState({})
  const [erreurGlobale, setErreurGlobale] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [fichierPhoto, setFichierPhoto] = useState(null)
  const [apercuPhoto, setApercuPhoto] = useState(null)

  const [form, setForm] = useState({
    nom: '',
    type: '',
    statut: 'DISPONIBLE',
    portId: '',
    description: '',
    proprietaireId: '',
  })

  useEffect(() => {
    api.get('/ports').then((res) => setPorts(res.data))
  }, [])

  useEffect(() => {
    if (!doitChoisirProprietaire) return
    api.get('/admin/users').then((res) => {
      setProprietaires(res.data.filter((u) => u.roles.includes('ROLE_OWNER')))
    }).catch(() => {})
  }, [doitChoisirProprietaire])

  useEffect(() => {
    if (!fichierPhoto) {
      setApercuPhoto(null)
      return
    }
    const url = URL.createObjectURL(fichierPhoto)
    setApercuPhoto(url)
    return () => URL.revokeObjectURL(url)
  }, [fichierPhoto])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErreurs({})
    setErreurGlobale(null)
    setEnCours(true)

    const formData = new FormData()
    formData.append('nom', form.nom)
    formData.append('type', form.type)
    formData.append('statut', form.statut)
    if (form.portId) formData.append('portId', form.portId)
    if (form.description) formData.append('description', form.description)
    if (doitChoisirProprietaire && form.proprietaireId) formData.append('proprietaireId', form.proprietaireId)
    if (fichierPhoto) formData.append('photo', fichierPhoto)

    api.post('/bateaux', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
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

      <form onSubmit={handleSubmit} className="card !p-0 mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-700 px-6 py-8 text-white">
          <h1 className="text-white">Ajouter un bateau</h1>
          <p className="mt-1 text-sm text-ocean-300">Renseignez les informations de votre nouveau bateau.</p>
        </div>

        {erreurGlobale && <p role="alert" className="mx-6 mt-5 font-medium text-coral-600">{erreurGlobale}</p>}

        <div className="border-t border-ocean-100 px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
            <IconePoint />
            Statut
          </p>
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

        <div className="border-t border-ocean-100 px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
            <IconeInfo />
            Informations générales
          </p>
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

            {doitChoisirProprietaire && (
              <div>
                <label htmlFor="proprietaireId" className="label-field">Propriétaire</label>
                <select id="proprietaireId" name="proprietaireId" value={form.proprietaireId} onChange={handleChange} required className="input-field">
                  <option value="" disabled>Choisir un propriétaire…</option>
                  {proprietaires.map((p) => (
                    <option key={p.id} value={p.id}>{p.email}</option>
                  ))}
                </select>
                {erreurs.proprietaireId && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.proprietaireId}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-ocean-100 px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
            <IconePhoto />
            Photo
          </p>
          <button
            type="button"
            onClick={() => inputPhotoRef.current?.click()}
            className="mt-3 flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-ocean-200 p-4 text-left transition-colors hover:border-ocean-400 hover:bg-ocean-50/50"
          >
            {apercuPhoto ? (
              <img src={apercuPhoto} alt="Aperçu" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-ocean-50 text-ocean-300">
                <IconePhoto grande />
              </div>
            )}
            <span className="text-sm font-medium text-ocean-600">
              {apercuPhoto ? 'Changer la photo' : 'Cliquez pour choisir une photo'}
            </span>
            <input
              ref={inputPhotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFichierPhoto(e.target.files[0] ?? null)}
              className="hidden"
            />
          </button>
          {erreurs.photo && <p role="alert" className="mt-2 text-sm font-medium text-coral-600">{erreurs.photo}</p>}
        </div>

        <div className="border-t border-ocean-100 px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
            <IconeAncre />
            Emplacement
          </p>
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

        <div className="px-6 py-5">
          <button type="submit" disabled={enCours} className="btn-primary w-full">
            {enCours ? 'Ajout…' : 'Ajouter le bateau'}
          </button>
        </div>
      </form>
    </main>
  )
}

function IconePoint() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ocean-400" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconeInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ocean-400" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function IconePhoto({ grande = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={grande ? 'h-6 w-6' : 'h-4 w-4 text-ocean-400'} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  )
}

function IconeAncre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ocean-400" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  )
}
