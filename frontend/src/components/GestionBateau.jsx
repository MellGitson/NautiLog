import { useState } from 'react'
import api from '../services/api'

const STATUTS = ['DISPONIBLE', 'LOUÉ', 'EN_RÉPARATION']

export default function GestionBateau({ bateau, onMiseAJour }) {
  const [valeurs, setValeurs] = useState({
    nom: bateau.nom,
    type: bateau.type,
    statut: bateau.statut,
    description: bateau.description ?? '',
  })
  const [fichierPhoto, setFichierPhoto] = useState(null)
  const [reparation, setReparation] = useState({ description: '', date: '' })
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const enregistrerInfos = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.put(`/bateaux/${bateau.id}`, valeurs)
      setSucces('Informations mises à jour.')
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreurs?.nom || err.response?.data?.erreur || 'Erreur lors de la mise à jour.')
    } finally {
      setEnCours(false)
    }
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

      <form onSubmit={enregistrerInfos} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nom" className="label-field">Nom</label>
            <input id="nom" name="nom" value={valeurs.nom} onChange={gererChangement} className="input-field" />
          </div>
          <div>
            <label htmlFor="type" className="label-field">Type</label>
            <input id="type" name="type" value={valeurs.type} onChange={gererChangement} className="input-field" />
          </div>
          <div>
            <label htmlFor="statut" className="label-field">Statut</label>
            <select id="statut" name="statut" value={valeurs.statut} onChange={gererChangement} className="input-field">
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label-field">Description</label>
          <textarea id="description" name="description" value={valeurs.description} onChange={gererChangement} rows={3} className="input-field" />
        </div>
        <button type="submit" disabled={enCours} className="btn-primary">
          Enregistrer les informations
        </button>
      </form>

      <form onSubmit={envoyerPhoto} className="mt-6 space-y-2 border-t border-ocean-100 pt-6">
        <label htmlFor="photo" className="label-field">Changer la photo</label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFichierPhoto(e.target.files[0] ?? null)}
          className="input-field"
        />
        <button type="submit" disabled={enCours || !fichierPhoto} className="btn-primary !mt-3">
          Envoyer la photo
        </button>
      </form>

      <form onSubmit={ajouterReparation} className="mt-6 space-y-4 border-t border-ocean-100 pt-6">
        <h3 className="text-sm font-semibold text-ocean-700">Ajouter une réparation</h3>
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
        <button type="submit" disabled={enCours} className="btn-primary">
          Ajouter la réparation
        </button>
      </form>
    </div>
  )
}
