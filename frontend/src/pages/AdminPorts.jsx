import { useEffect, useState } from 'react'
import api from '../services/api'
import CartePort from '../components/CartePort'
import ModalConfirmationSuppression from '../components/ModalConfirmationSuppression'

export default function AdminPorts() {
  const [ports, setPorts] = useState([])
  const [demandesParPort, setDemandesParPort] = useState({})
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [selectionnes, setSelectionnes] = useState([])
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)
  const [erreurSuppression, setErreurSuppression] = useState(null)

  const charger = () => {
    setChargement(true)
    api.get('/ports')
      .then((res) => setPorts(res.data))
      .catch(() => setErreur('Impossible de charger les ports.'))
      .finally(() => setChargement(false))

    api.get('/demandes-emplacements')
      .then((res) => {
        const comptes = {}
        res.data
          .filter((d) => d.statut === 'EN_ATTENTE')
          .forEach((d) => {
            const portId = d.emplacement.port.id
            comptes[portId] = (comptes[portId] ?? 0) + 1
          })
        setDemandesParPort(comptes)
      })
      .catch(() => {})
  }

  useEffect(charger, [])

  const basculerSelection = (id) => {
    setSelectionnes((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const portsSelectionnes = ports.filter((p) => selectionnes.includes(p.id))

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true)
    setErreurSuppression(null)
    try {
      await api.delete('/ports/lot', { data: { ids: selectionnes } })
      setConfirmationOuverte(false)
      setSelectionnes([])
      charger()
    } catch (err) {
      setErreurSuppression(formaterErreurSuppression(err))
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const formaterErreurSuppression = (err) => {
    const message = err.response?.data?.erreur || 'Erreur lors de la suppression.'
    const bloques = err.response?.data?.bloques

    if (!bloques?.length) return message

    const detail = bloques.map((bloque) => {
      const obstacles = bloque.obstacles.map((o) => {
        if (o.type === 'bateau_amarre') return `bateau "${o.bateau}" amarré`
        return `demande en attente pour "${o.bateau}" sur l'emplacement ${o.emplacement} (demandé par ${o.demandeur})`
      })
      return `${bloque.nom} : ${obstacles.join(', ')}`
    }).join(' — ')

    return `${message} ${detail}`
  }

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Ports</h1>
          <p className="mt-2 text-ocean-600">
            {selectionnes.length === 0
              ? 'Cliquez sur un port pour gérer ses emplacements.'
              : `${selectionnes.length} sélectionné(s).`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectionnes.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmationOuverte(true)}
              className="btn-primary !bg-coral-600 hover:!bg-coral-700 inline-flex items-center gap-2"
              aria-label={`Supprimer ${selectionnes.length} port(s) sélectionné(s)`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Supprimer ({selectionnes.length})
            </button>
          )}
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
            <span className="font-display text-3xl leading-none">{ports.length}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
              Port{ports.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ports.map((port) => (
            <CartePort
              key={port.id}
              port={port}
              demandesEnAttente={demandesParPort[port.id] ?? 0}
              selection={{ checked: selectionnes.includes(port.id), onToggle: basculerSelection }}
            />
          ))}
        </section>
      )}

      {confirmationOuverte && (
        <ModalConfirmationSuppression
          titre="Supprimer ces ports ?"
          elements={portsSelectionnes.map((p) => ({ id: p.id, label: `${p.nom} — ${p.ville} (${p.bateaux} bateau(x))` }))}
          enCours={suppressionEnCours}
          erreur={erreurSuppression}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => { setConfirmationOuverte(false); setErreurSuppression(null) }}
        />
      )}
    </main>
  )
}
