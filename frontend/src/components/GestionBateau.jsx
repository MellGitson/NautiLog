import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUTS = ['DISPONIBLE', 'LOUÉ', 'EN_RÉPARATION']

const STYLES_STATUT = {
  DISPONIBLE: { actif: 'bg-ocean-500 text-white', inactif: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100' },
  LOUÉ: { actif: 'bg-coral-500 text-white', inactif: 'bg-coral-50 text-coral-700 hover:bg-coral-100' },
  EN_RÉPARATION: { actif: 'bg-amber-500 text-white', inactif: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
}

export default function GestionBateau({ bateau, onMiseAJour }) {
  const { aRole } = useAuth()
  const seulAdminPeutChangerStatut = bateau.statut === 'EN_RÉPARATION' && !aRole('ROLE_ADMIN')
  const [valeurs, setValeurs] = useState({
    nom: bateau.nom,
    type: bateau.type,
    statut: bateau.statut,
    description: bateau.description ?? '',
  })
  const [modeEditionInfos, setModeEditionInfos] = useState(false)
  const [modeEditionPhoto, setModeEditionPhoto] = useState(false)
  const [modeAjoutReparation, setModeAjoutReparation] = useState(false)
  const [fichierPhoto, setFichierPhoto] = useState(null)
  const [reparation, setReparation] = useState({ description: '', date: '' })
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [statutEnCours, setStatutEnCours] = useState(false)

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const changerStatut = async (statut) => {
    if (statut === valeurs.statut || statutEnCours || seulAdminPeutChangerStatut) return
    setErreur(null)
    setSucces(null)
    setStatutEnCours(true)
    try {
      await api.put(`/bateaux/${bateau.id}`, { ...valeurs, statut })
      setValeurs((prev) => ({ ...prev, statut }))
      setSucces('Statut mis à jour.')
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du changement de statut.')
    } finally {
      setStatutEnCours(false)
    }
  }

  const enregistrerInfos = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.put(`/bateaux/${bateau.id}`, valeurs)
      setSucces('Informations mises à jour.')
      setModeEditionInfos(false)
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreurs?.nom || err.response?.data?.erreur || 'Erreur lors de la mise à jour.')
    } finally {
      setEnCours(false)
    }
  }

  const annulerEditionInfos = () => {
    setValeurs((prev) => ({ ...prev, nom: bateau.nom, type: bateau.type, description: bateau.description ?? '' }))
    setModeEditionInfos(false)
    setErreur(null)
  }

  const envoyerPhoto = async (e) => {
    e.preventDefault()
    if (!fichierPhoto) return
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      const formData = new FormData()
      formData.append('photo', fichierPhoto)
      await api.post(`/bateaux/${bateau.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSucces('Photo mise à jour.')
      setFichierPhoto(null)
      setModeEditionPhoto(false)
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Erreur lors de l'envoi de la photo.")
    } finally {
      setEnCours(false)
    }
  }

  const ajouterReparation = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.post(`/bateaux/${bateau.id}/reparations`, reparation)
      setSucces('Réparation ajoutée.')
      setReparation({ description: '', date: '' })
      setModeAjoutReparation(false)
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreurs?.description || 'Erreur lors de l\'ajout de la réparation.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="card mt-6">
      <h2>Gestion du bateau</h2>
      <p className="mt-1 text-sm text-ocean-500">Réservé au propriétaire et aux administrateurs.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
      {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">{succes}</p>}

      <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
        <p className="text-sm font-medium text-ocean-500">Statut</p>
        {seulAdminPeutChangerStatut && (
          <p className="mt-1 text-xs text-ocean-400">Seul un administrateur peut modifier le statut d'un bateau en réparation.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Changer le statut du bateau">
          {STATUTS.map((s) => {
            const style = STYLES_STATUT[s]
            const actif = valeurs.statut === s
            return (
              <button
                key={s}
                type="button"
                disabled={statutEnCours || seulAdminPeutChangerStatut}
                onClick={() => changerStatut(s)}
                aria-pressed={actif}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${actif ? style.actif : style.inactif}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ocean-500">Informations générales</p>
          {!modeEditionInfos && (
            <button type="button" onClick={() => setModeEditionInfos(true)} className="btn-ghost !px-3 !py-1 text-sm">
              Modifier
            </button>
          )}
        </div>

        {!modeEditionInfos ? (
          <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-ocean-400">Nom</dt>
              <dd className="text-ocean-900">{bateau.nom}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ocean-400">Type</dt>
              <dd className="text-ocean-900">{bateau.type}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-ocean-400">Description</dt>
              <dd className="text-ocean-900">{bateau.description || <span className="text-ocean-400">Aucune description.</span>}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={enregistrerInfos} className="mt-3 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nom" className="label-field">Nom</label>
                <input id="nom" name="nom" value={valeurs.nom} onChange={gererChangement} className="input-field" />
              </div>
              <div>
                <label htmlFor="type" className="label-field">Type</label>
                <input id="type" name="type" value={valeurs.type} onChange={gererChangement} className="input-field" />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="label-field">Description</label>
              <textarea id="description" name="description" value={valeurs.description} onChange={gererChangement} rows={3} className="input-field" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={enCours} className="btn-primary">
                Enregistrer
              </button>
              <button type="button" onClick={annulerEditionInfos} className="btn-ghost">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ocean-500">Photo</p>
          {!modeEditionPhoto && (
            <button type="button" onClick={() => setModeEditionPhoto(true)} className="btn-ghost !px-3 !py-1 text-sm">
              Changer
            </button>
          )}
        </div>

        {!modeEditionPhoto ? (
          <div className="mt-3 flex items-center gap-3">
            {bateau.photoUrl ? (
              <img src={bateau.photoUrl} alt={bateau.nom} className="h-16 w-24 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-ocean-50 text-xs text-ocean-400">
                Photo par défaut
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={envoyerPhoto} className="mt-3 space-y-2">
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFichierPhoto(e.target.files[0] ?? null)}
              className="input-field"
            />
            <div className="flex gap-2 !mt-3">
              <button type="submit" disabled={enCours || !fichierPhoto} className="btn-primary">
                Envoyer
              </button>
              <button type="button" onClick={() => { setModeEditionPhoto(false); setFichierPhoto(null) }} className="btn-ghost">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-ocean-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ocean-500">Réparations</p>
          {!modeAjoutReparation && (
            <button type="button" onClick={() => setModeAjoutReparation(true)} className="btn-ghost !px-3 !py-1 text-sm">
              + Ajouter
            </button>
          )}
        </div>

        {bateau.reparations.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {bateau.reparations.map((r) => (
              <li key={r.id} className="text-sm text-ocean-700">
                <span className="font-medium">{r.date}</span> — {r.description}
              </li>
            ))}
          </ul>
        ) : (
          !modeAjoutReparation && <p className="mt-3 text-sm text-ocean-400">Aucune réparation enregistrée.</p>
        )}

        {modeAjoutReparation && (
          <form onSubmit={ajouterReparation} className="mt-4 space-y-4 border-t border-ocean-100 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="reparationDate" className="label-field">Date</label>
                <input
                  id="reparationDate"
                  type="date"
                  value={reparation.date}
                  onChange={(e) => setReparation((prev) => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="reparationDescription" className="label-field">Description</label>
                <input
                  id="reparationDescription"
                  value={reparation.description}
                  onChange={(e) => setReparation((prev) => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={enCours} className="btn-primary">
                Enregistrer
              </button>
              <button type="button" onClick={() => { setModeAjoutReparation(false); setReparation({ description: '', date: '' }) }} className="btn-ghost">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
