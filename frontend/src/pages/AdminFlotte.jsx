import { useEffect, useState } from 'react'
import api from '../services/api'
import CarteBateau from '../components/CarteBateau'
import ModalConfirmationSuppression from '../components/ModalConfirmationSuppression'

export default function AdminFlotte() {
  const [bateaux, setBateaux] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [selectionnes, setSelectionnes] = useState([])
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)
  const [erreurSuppression, setErreurSuppression] = useState(null)

  const charger = () => {
    setChargement(true)
    api.get('/bateaux')
      .then((res) => setBateaux(res.data))
      .catch(() => setErreur('Impossible de charger la flotte.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  const basculerSelection = (id) => {
    setSelectionnes((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const bateauxSelectionnes = bateaux.filter((b) => selectionnes.includes(b.id))

  const confirmerSuppression = async () => {
    setSuppressionEnCours(true)
    setErreurSuppression(null)
    try {
      await api.delete('/bateaux/lot', { data: { ids: selectionnes } })
      setConfirmationOuverte(false)
      setSelectionnes([])
      charger()
    } catch (err) {
      setErreurSuppression(err.response?.data?.erreur || 'Erreur lors de la suppression.')
    } finally {
      setSuppressionEnCours(false)
    }
  }

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Flotte</h1>
          <p className="mt-2 text-ocean-600">
            {selectionnes.length === 0
              ? 'Cliquez sur un bateau pour gérer son statut, ses photos et son historique.'
              : `${selectionnes.length} sélectionné(s).`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectionnes.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmationOuverte(true)}
              className="btn-primary !bg-coral-600 hover:!bg-coral-700 inline-flex items-center gap-2"
              aria-label={`Supprimer ${selectionnes.length} bateau(x) sélectionné(s)`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Supprimer ({selectionnes.length})
            </button>
          )}
          <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
            <span className="font-display text-3xl leading-none">{bateaux.length}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
              Bateau{bateaux.length > 1 ? 'x' : ''}
            </span>
          </div>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bateaux.map((bateau) => (
            <CarteBateau
              key={bateau.id}
              bateau={bateau}
              selection={{ checked: selectionnes.includes(bateau.id), onToggle: basculerSelection }}
            />
          ))}
        </section>
      )}

      {confirmationOuverte && (
        <ModalConfirmationSuppression
          titre="Supprimer ces bateaux ?"
          elements={bateauxSelectionnes.map((b) => ({ id: b.id, label: `${b.nom} — ${b.type} (${b.statut})` }))}
          enCours={suppressionEnCours}
          erreur={erreurSuppression}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => { setConfirmationOuverte(false); setErreurSuppression(null) }}
        />
      )}
    </main>
  )
}
