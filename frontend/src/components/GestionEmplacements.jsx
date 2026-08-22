import { useEffect, useState } from 'react'
import api from '../services/api'

function IconeAncre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function IconeCroix() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function IconeCorbeille() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

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
    <div className="card !p-0 mt-6 overflow-hidden">
      <div className="border-b border-ocean-100 px-6 py-5">
        <h2>Gestion des emplacements</h2>
        <p className="mt-1 text-sm text-ocean-500">Réservé aux administrateurs.</p>

        {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}
        {succes && <p role="status" className="mt-3 text-sm font-medium text-ocean-600">{succes}</p>}
      </div>

      {demandes.length > 0 && (
        <div className="border-b border-ocean-100 bg-amber-50/40 px-6 py-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            {demandes.length} demande{demandes.length > 1 ? 's' : ''} en attente
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {demandes.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3">
                <span className="text-sm">
                  <span className="font-medium text-ocean-900">{d.bateau.nom}</span>
                  <span className="text-ocean-500"> pour </span>
                  <span className="font-medium text-ocean-900">{d.emplacement.label}</span>
                  <span className="block text-xs text-ocean-500">Demandé par {d.demandeur.email}</span>
                </span>
                <div className="inline-flex items-center gap-0.5 rounded-lg border border-ocean-100 bg-white p-0.5">
                  <button
                    type="button"
                    disabled={demandeEnCours === d.id}
                    onClick={() => traiterDemande(d, 'APPROUVEE')}
                    title="Approuver"
                    aria-label="Approuver"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-500 transition-all duration-150 hover:scale-110 hover:bg-emerald-500 hover:text-white disabled:opacity-40"
                  >
                    <IconeCheck />
                  </button>
                  <button
                    type="button"
                    disabled={demandeEnCours === d.id}
                    onClick={() => traiterDemande(d, 'REFUSEE')}
                    title="Refuser"
                    aria-label="Refuser"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-coral-400 transition-all duration-150 hover:scale-110 hover:bg-coral-500 hover:text-white disabled:opacity-40"
                  >
                    <IconeCroix />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {emplacements.length > 0 && (
        <div className="border-b border-ocean-100 px-6 py-5">
          <h3 className="text-sm font-semibold text-ocean-700">Emplacements existants</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {emplacements.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ocean-100 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${e.bateau ? 'bg-ocean-100 text-ocean-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    <IconeAncre />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ocean-900">{e.label}</p>
                    <p className={`text-xs ${e.bateau ? 'text-ocean-500' : 'text-emerald-600'}`}>
                      {e.bateau ? e.bateau.nom : 'Libre'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {e.bateau && (
                    <button
                      type="button"
                      onClick={() => libererEmplacement(e)}
                      title="Libérer cet emplacement"
                      className="btn-ghost !px-3 !py-1.5 text-sm"
                    >
                      Libérer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => supprimerEmplacement(e)}
                    title="Supprimer l'emplacement"
                    aria-label="Supprimer l'emplacement"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-ocean-400 transition-all duration-150 hover:scale-110 hover:bg-coral-500 hover:text-white"
                  >
                    <IconeCorbeille />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={ajouterEmplacement} className="flex flex-wrap items-end gap-4 px-6 py-5">
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
