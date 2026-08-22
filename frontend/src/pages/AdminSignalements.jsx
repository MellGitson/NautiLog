import { useEffect, useState } from 'react'
import { listerSignalements, repondreSignalement } from '../services/signalements'

const LABELS_STATUT = { OUVERT: 'Ouvert', TRAITE: 'Traité' }
const STYLE_STATUT = {
  OUVERT: 'bg-amber-100 text-amber-800',
  TRAITE: 'bg-emerald-100 text-emerald-800',
}

function IconeDrapeau() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M4 22V4" />
      <path d="M4 4h14l-2 4 2 4H4" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export default function AdminSignalements() {
  const [signalements, setSignalements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [reponses, setReponses] = useState({})
  const [envoiEnCours, setEnvoiEnCours] = useState(null)

  const charger = () => {
    listerSignalements()
      .then((res) => setSignalements(res.data))
      .catch(() => setErreur('Impossible de charger les signalements.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  const envoyerReponse = async (id) => {
    setEnvoiEnCours(id)
    try {
      await repondreSignalement(id, reponses[id] ?? '')
      charger()
    } catch {
      setErreur(`Impossible de répondre au signalement #${id}.`)
    } finally {
      setEnvoiEnCours(null)
    }
  }

  const nbOuverts = signalements.filter((s) => s.statut === 'OUVERT').length

  return (
    <main>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Signalements</h1>
          <p className="mt-2 text-ocean-600">
            {nbOuverts === 0
              ? 'Tous les signalements ont été traités.'
              : `${nbOuverts} signalement${nbOuverts > 1 ? 's' : ''} en attente de réponse.`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
          <span className="font-display text-3xl leading-none">{signalements.length}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">
            Signalement{signalements.length > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && signalements.length === 0 && (
        <p className="text-ocean-600">Aucun signalement.</p>
      )}

      <ul className="flex flex-col gap-4">
        {signalements.map((s) => {
          const traite = s.statut === 'TRAITE'
          return (
            <li key={s.id} className={`card !p-0 overflow-hidden ${traite ? 'opacity-80' : ''}`}>
              <div className="flex items-start justify-between gap-4 border-b border-ocean-50 bg-ocean-50/40 px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${traite ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <IconeDrapeau />
                  </span>
                  <div>
                    <p className="font-medium text-ocean-900">
                      Réservation du bateau "{s.bateauNom}"
                    </p>
                    <p className="text-sm text-ocean-500">{s.auteurEmail}</p>
                  </div>
                </div>
                <span className={`inline-flex shrink-0 animate-fade-in items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STYLE_STATUT[s.statut]}`}>
                  {s.statut === 'OUVERT' ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                    </span>
                  ) : (
                    <IconeCheck />
                  )}
                  {LABELS_STATUT[s.statut]}
                </span>
              </div>

              <div className="px-6 py-4">
                <p className="text-ocean-700">{s.message}</p>

                {traite ? (
                  <div className="mt-4 rounded-xl bg-emerald-50/60 p-4">
                    <p className="text-sm font-medium text-emerald-700">Votre réponse</p>
                    <p className="mt-1 text-ocean-800">{s.reponseAdmin}</p>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <textarea
                      className="input-field"
                      rows={2}
                      placeholder="Votre réponse au propriétaire…"
                      value={reponses[s.id] ?? ''}
                      onChange={(e) => setReponses({ ...reponses, [s.id]: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => envoyerReponse(s.id)}
                      disabled={envoiEnCours === s.id || !(reponses[s.id]?.trim())}
                      className="btn-accent self-start !px-4 !py-1.5 text-sm"
                    >
                      Répondre
                    </button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
