import { Fragment, useState } from 'react'
import api from '../services/api'
import ModalConfirmationSuppression from './ModalConfirmationSuppression'

const ROLES = ['ROLE_RENTER', 'ROLE_OWNER', 'ROLE_ADMIN']

const LABELS_ROLES = {
  ROLE_RENTER: 'Locataire',
  ROLE_OWNER: 'Propriétaire',
  ROLE_ADMIN: 'Administrateur',
}

const BADGES_ROLES = {
  ROLE_RENTER: 'badge bg-amber-100 text-amber-700',
  ROLE_OWNER: 'badge bg-ocean-600 text-white',
  ROLE_ADMIN: 'badge bg-coral-500 text-white',
}

function roleActuel(roles) {
  return ROLES.find((r) => roles.includes(r)) ?? 'ROLE_RENTER'
}

function ligneVide(utilisateur) {
  return {
    email: utilisateur.email,
    firstName: utilisateur.firstName ?? '',
    lastName: utilisateur.lastName ?? '',
    phone: utilisateur.phone ?? '',
  }
}

export default function GestionUtilisateurs({ utilisateurs, onMiseAJour }) {
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [editionRoleId, setEditionRoleId] = useState(null)
  const [editionProfilId, setEditionProfilId] = useState(null)
  const [valeurs, setValeurs] = useState({})
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState(null)
  const [erreurSuppression, setErreurSuppression] = useState(null)

  const changerRole = async (utilisateur, nouveauRole) => {
    if (nouveauRole === roleActuel(utilisateur.roles)) {
      setEditionRoleId(null)
      return
    }

    setErreur(null)
    setEnCours(utilisateur.id)
    try {
      await api.patch(`/admin/users/${utilisateur.id}/role`, { role: nouveauRole })
      onMiseAJour()
    } catch {
      setErreur(`Impossible de modifier le rôle de ${utilisateur.email}.`)
    } finally {
      setEnCours(null)
      setEditionRoleId(null)
    }
  }

  const ouvrirEditionProfil = (utilisateur) => {
    setErreur(null)
    setValeurs(ligneVide(utilisateur))
    setEditionProfilId(utilisateur.id)
  }

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const enregistrerProfil = async (utilisateurId) => {
    setErreur(null)
    setEnCours(utilisateurId)
    try {
      await api.patch(`/admin/users/${utilisateurId}`, valeurs)
      setEditionProfilId(null)
      onMiseAJour()
    } catch (err) {
      setErreur(err.response?.data?.errors?.email || "Impossible de mettre à jour cet utilisateur.")
    } finally {
      setEnCours(null)
    }
  }

  const confirmerSuppression = async () => {
    setErreurSuppression(null)
    setEnCours(utilisateurASupprimer.id)
    try {
      await api.delete(`/admin/users/${utilisateurASupprimer.id}`)
      setUtilisateurASupprimer(null)
      onMiseAJour()
    } catch (err) {
      setErreurSuppression(err.response?.data?.erreur || "Impossible de supprimer cet utilisateur.")
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div>
      {erreur && <p role="alert" className="mb-3 text-sm font-medium text-coral-600">{erreur}</p>}

      <div className="overflow-x-auto rounded-xl border border-ocean-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ocean-100 bg-ocean-50/60 text-xs uppercase tracking-wide text-ocean-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Utilisateur</th>
              <th scope="col" className="px-4 py-3 font-semibold">Bateaux</th>
              <th scope="col" className="px-4 py-3 font-semibold">Rôle</th>
              <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-50">
            {utilisateurs.map((u) => {
              const role = roleActuel(u.roles)
              const enEditionRole = editionRoleId === u.id
              const enEditionProfil = editionProfilId === u.id

              return (
                <Fragment key={u.id}>
                  <tr className="align-middle">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ocean-900">{u.email}</div>
                      {(u.firstName || u.lastName) && (
                        <div className="text-xs text-ocean-500">{u.firstName} {u.lastName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ocean-700">{u.nombreBateaux}</td>
                    <td className="px-4 py-3">
                      {enEditionRole ? (
                        <select
                          autoFocus
                          value={role}
                          onChange={(e) => changerRole(u, e.target.value)}
                          onBlur={() => setEditionRoleId(null)}
                          disabled={enCours === u.id}
                          className="input-field !w-auto !py-1 text-sm"
                          aria-label={`Rôle de ${u.email}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{LABELS_ROLES[r]}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={BADGES_ROLES[role]}>{LABELS_ROLES[role]}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        {!enEditionRole && (
                          <button
                            type="button"
                            onClick={() => setEditionRoleId(u.id)}
                            disabled={enCours === u.id}
                            className="text-sm font-medium text-ocean-600 hover:text-coral-500"
                          >
                            Rôle
                          </button>
                        )}
                        {!enEditionProfil && (
                          <button
                            type="button"
                            onClick={() => ouvrirEditionProfil(u)}
                            disabled={enCours === u.id}
                            className="text-sm font-medium text-ocean-600 hover:text-coral-500"
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setUtilisateurASupprimer(u)}
                          disabled={enCours === u.id}
                          className="text-sm font-medium text-coral-600 hover:text-coral-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>

                  {enEditionProfil && (
                    <tr className="bg-ocean-50/40">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                          <div>
                            <label htmlFor={`email-${u.id}`} className="label-field">Email</label>
                            <input id={`email-${u.id}`} name="email" value={valeurs.email} onChange={gererChangement} className="input-field" />
                          </div>
                          <div>
                            <label htmlFor={`firstName-${u.id}`} className="label-field">Prénom</label>
                            <input id={`firstName-${u.id}`} name="firstName" value={valeurs.firstName} onChange={gererChangement} className="input-field" />
                          </div>
                          <div>
                            <label htmlFor={`lastName-${u.id}`} className="label-field">Nom</label>
                            <input id={`lastName-${u.id}`} name="lastName" value={valeurs.lastName} onChange={gererChangement} className="input-field" />
                          </div>
                          <div>
                            <label htmlFor={`phone-${u.id}`} className="label-field">Téléphone</label>
                            <input id={`phone-${u.id}`} name="phone" value={valeurs.phone} onChange={gererChangement} className="input-field" />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-3">
                          <button
                            type="button"
                            onClick={() => enregistrerProfil(u.id)}
                            disabled={enCours === u.id}
                            className="btn-primary !px-4 !py-1.5 text-sm"
                          >
                            {enCours === u.id ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditionProfilId(null)}
                            className="btn-ghost !px-4 !py-1.5 text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {utilisateurASupprimer && (
        <ModalConfirmationSuppression
          titre="Supprimer cet utilisateur ?"
          elements={[{ id: utilisateurASupprimer.id, label: utilisateurASupprimer.email }]}
          enCours={enCours === utilisateurASupprimer.id}
          erreur={erreurSuppression}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setUtilisateurASupprimer(null)}
        />
      )}
    </div>
  )
}
