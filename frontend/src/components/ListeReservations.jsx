import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const LABELS_STATUT = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
}

const BADGES_STATUT = {
  EN_ATTENTE: 'badge bg-amber-100 text-amber-700',
  CONFIRMEE: 'badge-disponible',
  ANNULEE: 'badge bg-ocean-100 text-ocean-500',
}

export default function ListeReservations({ reservations, utilisateur, onMiseAJour }) {
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState(null)

  const changerStatut = async (reservation, statut) => {
    setErreur(null)
    setEnCours(reservation.id)
    try {
      await api.patch(`/reservations/${reservation.id}/statut`, { statut })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de mettre à jour la réservation #${reservation.id}.`)
    } finally {
      setEnCours(null)
    }
  }

  if (reservations.length === 0) {
    return <p className="text-ocean-600">Aucune réservation.</p>
  }

  return (
    <div>
      {erreur && <p role="alert" className="mb-3 text-sm font-medium text-coral-600">{erreur}</p>}

      <div className="overflow-x-auto rounded-xl border border-ocean-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ocean-100 bg-ocean-50/60 text-xs uppercase tracking-wide text-ocean-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Bateau</th>
              <th scope="col" className="px-4 py-3 font-semibold">Locataire</th>
              <th scope="col" className="px-4 py-3 font-semibold">Période</th>
              <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
              <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-50">
            {reservations.map((r) => {
              const estLocataire = r.locataire.email === utilisateur?.email
              const peutConfirmer = !estLocataire && r.statut === 'EN_ATTENTE'
              const peutAnnuler = r.statut !== 'ANNULEE'

              return (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <Link to={`/bateaux/${r.bateau.id}`} className="font-medium text-ocean-900 hover:text-coral-500">
                      {r.bateau.nom}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ocean-700">{r.locataire.email}</td>
                  <td className="px-4 py-3 text-ocean-700">{r.dateDebut} → {r.dateFin}</td>
                  <td className="px-4 py-3">
                    <span className={BADGES_STATUT[r.statut]}>{LABELS_STATUT[r.statut]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      {peutConfirmer && (
                        <button
                          type="button"
                          onClick={() => changerStatut(r, 'CONFIRMEE')}
                          disabled={enCours === r.id}
                          className="text-sm font-medium text-ocean-600 hover:text-coral-500"
                        >
                          Confirmer
                        </button>
                      )}
                      {peutAnnuler && (
                        <button
                          type="button"
                          onClick={() => changerStatut(r, 'ANNULEE')}
                          disabled={enCours === r.id}
                          className="text-sm font-medium text-coral-600 hover:text-coral-700"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
