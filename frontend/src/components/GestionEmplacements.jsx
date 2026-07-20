import { useEffect, useState } from 'react'
import api from '../services/api'

export default function GestionEmplacements({ port, emplacements, onMiseAJour }) {
  const [bateaux, setBateaux] = useState([])
  const [valeurs, setValeurs] = useState({ label: '', latitude: '', longitude: '', bateauId: '' })
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [modificationEnCours, setModificationEnCours] = useState(null)

  useEffect(() => {
    api.get('/bateaux').then((res) => setBateaux(res.data)).catch(() => {})
  }, [])

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.post(`/ports/${port.id}/emplacements`, {
        label: valeurs.label,
        latitude: valeurs.latitude ? parseFloat(valeurs.latitude) : null,
        longitude: valeurs.longitude ? parseFloat(valeurs.longitude) : null,
        bateauId: valeurs.bateauId ? parseInt(valeurs.bateauId, 10) : null,
      })
      setSucces('Emplacement créé.')
      setValeurs({ label: '', latitude: '', longitude: '', bateauId: '' })
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreurs?.label || "Erreur lors de la création de l'emplacement.")
    } finally {
      setEnCours(false)
    }
  }

  const changerBateau = async (emplacement, bateauId) => {
    setErreur(null)
    setModificationEnCours(emplacement.id)
    try {
      await api.put(`/ports/${port.id}/emplacements/${emplacement.id}`, {
        label: emplacement.label,
        latitude: emplacement.latitude,
        longitude: emplacement.longitude,
        bateauId: bateauId ? parseInt(bateauId, 10) : null,
      })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de mettre à jour l'emplacement "${emplacement.label}".`)
    } finally {
      setModificationEnCours(null)
    }
  }

  return (
    <div className="card mt-6">
      <h2>Gestion des emplacements</h2>
      <p className="mt-1 text-sm text-ocean-500">Réservé aux administrateurs.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
      {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">{succes}</p>}

      {emplacements.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {emplacements.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ocean-100 px-4 py-2">
              <span className="font-medium">{e.label}</span>
              <select
                value={e.bateau?.id ?? ''}
                onChange={(ev) => changerBateau(e, ev.target.value)}
                disabled={modificationEnCours === e.id}
                className="input-field !w-auto !py-1.5 text-sm"
                aria-label={`Bateau assigné à ${e.label}`}
              >
                <option value="">— Libre —</option>
                {bateaux.map((b) => (
                  <option key={b.id} value={b.id}>{b.nom}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={soumettre} className="mt-6 grid grid-cols-1 gap-4 border-t border-ocean-100 pt-6 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-ocean-700 sm:col-span-2">Ajouter un emplacement</h3>
        <div>
          <label htmlFor="label" className="label-field">Nom de l'emplacement</label>
          <input id="label" name="label" value={valeurs.label} onChange={gererChangement} required className="input-field" placeholder="Ponton A-1" />
        </div>
        <div>
          <label htmlFor="bateauId" className="label-field">Bateau (optionnel)</label>
          <select id="bateauId" name="bateauId" value={valeurs.bateauId} onChange={gererChangement} className="input-field">
            <option value="">— Libre —</option>
            {bateaux.map((b) => (
              <option key={b.id} value={b.id}>{b.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="latitude" className="label-field">Latitude</label>
          <input id="latitude" name="latitude" type="number" step="any" value={valeurs.latitude} onChange={gererChangement} className="input-field" />
        </div>
        <div>
          <label htmlFor="longitude" className="label-field">Longitude</label>
          <input id="longitude" name="longitude" type="number" step="any" value={valeurs.longitude} onChange={gererChangement} className="input-field" />
        </div>
        <button type="submit" disabled={enCours} className="btn-primary sm:col-span-2">
          Ajouter l'emplacement
        </button>
      </form>
    </div>
  )
}
