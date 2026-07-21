import { useEffect, useState } from 'react'
import { listerSignalements, repondreSignalement } from '../services/signalements'

const LABELS_STATUT = { OUVERT: 'Ouvert', TRAITE: 'Traité' }
const BADGES_STATUT = { OUVERT: 'badge bg-amber-100 text-amber-700', TRAITE: 'badge-disponible' }

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

  return (
    <main>
      <header className="mb-8">
        <h1>Signalements</h1>
        <p className="mt-2 text-ocean-600">{signalements.length} signalement(s) au total.</p>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && signalements.length === 0 && (
        <p className="text-ocean-600">Aucun signalement.</p>
      )}

      <ul className="flex flex-col gap-4">
        {signalements.map((s) => (
          <li key={s.id} className="card">
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium text-ocean-900">
                Réservation du bateau "{s.bateauNom}" — {s.auteurEmail}
              </p>
              <span className={BADGES_STATUT[s.statut]}>{LABELS_STATUT[s.statut]}</span>
            </div>
            <p className="mt-2 text-ocean-700">{s.message}</p>

            {s.statut === 'TRAITE' ? (
              <div className="mt-3 border-t border-ocean-100 pt-3">
                <p className="text-sm font-medium text-ocean-500">Votre réponse :</p>
                <p className="mt-1 text-ocean-800">{s.reponseAdmin}</p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2 border-t border-ocean-100 pt-3">
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
          </li>
        ))}
      </ul>
    </main>
  )
}
