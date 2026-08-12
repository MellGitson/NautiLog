import { useEffect, useState } from 'react'
import api from '../services/api'

export default function GestionEmplacements({ port, emplacements, onMiseAJour }) {
  const [demandes, setDemandes] = useState([])
  const [label, setLabel] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [demandeEnCours, setDemandeEnCours] = useState(null)

  const chargerDemandes = () => {
    api.get('/demandes-emplacements')
      .then((res) => setDemandes(res.data.filter((d) => d.statut === 'EN_ATTENTE' && d.emplacement.port.id === port.id)))
      .catch(() => {})
  }

  useEffect(chargerDemandes, [port.id])

  const ajouterEmplacement = async (e) => {
    e.preventDefault()
    setErreur(null)
    setSucces(null)
    setEnCours(true)
    try {
      await api.post(`/ports/${port.id}/emplacements`, { label })
      setSucces('Emplacement créé.')
      setLabel('')
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreurs?.label || "Erreur lors de la création de l'emplacement.")
    } finally {
      setEnCours(false)
    }
  }

  const libererEmplacement = async (emplacement) => {
    setErreur(null)
    try {
      await api.put(`/ports/${port.id}/emplacements/${emplacement.id}`, {
        label: emplacement.label,
        latitude: emplacement.latitude,
        longitude: emplacement.longitude,
        bateauId: null,
      })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de libérer l'emplacement "${emplacement.label}".`)
    }
  }

  const supprimerEmplacement = async (emplacement) => {
    if (!window.confirm(`Supprimer l'emplacement "${emplacement.label}" ?`)) return
    setErreur(null)
    try {
      await api.delete(`/ports/${port.id}/emplacements/${emplacement.id}`)
      onMiseAJour()
    } catch {
      setErreur(`Impossible de supprimer l'emplacement "${emplacement.label}".`)
    }
  }

  const traiterDemande = async (demande, statut) => {
    setErreur(null)
    setDemandeEnCours(demande.id)
    try {
      await api.patch(`/demandes-emplacements/${demande.id}/statut`, { statut })
      chargerDemandes()
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de traiter cette demande.')
    } finally {
      setDemandeEnCours(null)
    }
  }

  return (
    <div className="card mt-6">
      <h2>Gestion des emplacements</h2>
      <p className="mt-1 text-sm text-ocean-500">Réservé aux administrateurs.</p>

      {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
      {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">{succes}</p>}

      {demandes.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-ocean-700">Demandes en attente</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {demandes.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ocean-100 px-4 py-2">
                <span>
                  <span className="font-medium">{d.bateau.nom}</span> pour l'emplacement <span className="font-medium">{d.emplacement.label}</span>
                  <span className="block text-xs text-ocean-500">Demandé par {d.demandeur.email}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={demandeEnCours === d.id}
                    onClick={() => traiterDemande(d, 'APPROUVEE')}
                    className="btn-primary !px-3 !py-1 text-sm"
                  >
                    Approuver
                  </button>
                  <button
                    type="button"
                    disabled={demandeEnCours === d.id}
                    onClick={() => traiterDemande(d, 'REFUSEE')}
                    className="btn-ghost !px-3 !py-1 text-sm"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {emplacements.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-ocean-700">Emplacements existants</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {emplacements.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ocean-100 px-4 py-2">
                <span className="font-medium">{e.label}</span>
                <div className="flex items-center gap-3">
                  {e.bateau ? (
                    <>
                      <span className="text-sm text-ocean-600">{e.bateau.nom}</span>
                      <button type="button" onClick={() => libererEmplacement(e)} className="btn-ghost !px-3 !py-1 text-sm">
                        Libérer
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-ocean-500">Libre</span>
                  )}
                  <button
                    type="button"
                    onClick={() => supprimerEmplacement(e)}
                    className="btn-ghost !px-3 !py-1 text-sm text-coral-600"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={ajouterEmplacement} className="mt-6 flex flex-wrap items-end gap-4 border-t border-ocean-100 pt-6">
        <div className="flex-1">
          <label htmlFor="label" className="label-field">Ajouter un emplacement</label>
          <input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="input-field"
            placeholder="Ponton A-1"
          />
        </div>
        <button type="submit" disabled={enCours} className="btn-primary">
          Ajouter
        </button>
      </form>
    </div>
  )
}
