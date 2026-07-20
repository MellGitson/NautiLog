import { useState } from 'react'
import api from '../services/api'

const ROLES = ['ROLE_RENTER', 'ROLE_OWNER', 'ROLE_ADMIN']

const LABELS_ROLES = {
  ROLE_RENTER: 'Locataire',
  ROLE_OWNER: 'Propriétaire',
  ROLE_ADMIN: 'Administrateur',
}

function roleActuel(roles) {
  return ROLES.find((r) => roles.includes(r)) ?? 'ROLE_RENTER'
}

export default function GestionUtilisateurs({ utilisateurs, onMiseAJour }) {
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState(null)

  const changerRole = async (utilisateur, nouveauRole) => {
    if (nouveauRole === roleActuel(utilisateur.roles)) return

    setErreur(null)
    setEnCours(utilisateur.id)
    try {
      await api.patch(`/admin/users/${utilisateur.id}/role`, { role: nouveauRole })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de modifier le rôle de ${utilisateur.email}.`)
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div>
      {erreur && <p role="alert" className="mb-3 text-sm font-medium text-coral-600">{erreur}</p>}

      <ul className="flex flex-col gap-2">
        {utilisateurs.map((u) => (
          <li
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ocean-100 bg-white px-4 py-3"
          >
            <div>
              <span className="font-medium">{u.email}</span>
              {(u.firstName || u.lastName) && (
                <span className="ml-2 text-sm text-ocean-500">{u.firstName} {u.lastName}</span>
              )}
              <span className="ml-2 text-xs text-ocean-400">{u.nombreBateaux} bateau(x)</span>
            </div>

            <select
              value={roleActuel(u.roles)}
              onChange={(e) => changerRole(u, e.target.value)}
              disabled={enCours === u.id}
              className="input-field !w-auto !py-1.5 text-sm"
              aria-label={`Rôle de ${u.email}`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{LABELS_ROLES[r]}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}
