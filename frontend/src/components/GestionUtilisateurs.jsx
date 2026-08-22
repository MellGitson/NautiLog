import { Fragment, useState } from 'react'
import api from '../services/api'
import ModalConfirmationSuppression from './ModalConfirmationSuppression'

const ROLES = ['ROLE_RENTER', 'ROLE_OWNER', 'ROLE_ADMIN']

const LABELS_ROLES = {
  ROLE_RENTER: 'Locataire',
  ROLE_OWNER: 'Propriétaire',
  ROLE_ADMIN: 'Administrateur',
}

const POINT_ROLES = {
  ROLE_RENTER: 'bg-amber-500',
  ROLE_OWNER: 'bg-ocean-500',
  ROLE_ADMIN: 'bg-coral-500',
}

function IconeCrayon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconeCle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  )
}

function IconeCorbeille() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
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
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${role === 'ROLE_ADMIN' ? 'bg-coral-500' : 'bg-ocean-500'}`}>
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium text-ocean-900">{u.email}</div>
                          {(u.firstName || u.lastName) && (
                            <div className="text-xs text-ocean-500">{u.firstName} {u.lastName}</div>
                          )}
                        </div>
                      </div>
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
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-ocean-800">
                          <span className={`h-1.5 w-1.5 rounded-full ${POINT_ROLES[role]}`} aria-hidden="true" />
                          {LABELS_ROLES[role]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!enEditionRole && (
                          <button
                            type="button"
                            onClick={() => setEditionRoleId(u.id)}
                            disabled={enCours === u.id}
                            title={`Changer le rôle de ${u.email}`}
                            aria-label={`Changer le rôle de ${u.email}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ocean-500 transition-colors hover:bg-ocean-50 hover:text-ocean-700 disabled:opacity-40"
                          >
                            <IconeCle />
                          </button>
                        )}
                        {!enEditionProfil && (
                          <button
                            type="button"
                            onClick={() => ouvrirEditionProfil(u)}
                            disabled={enCours === u.id}
                            title={`Modifier ${u.email}`}
                            aria-label={`Modifier ${u.email}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ocean-500 transition-colors hover:bg-ocean-50 hover:text-ocean-700 disabled:opacity-40"
                          >
                            <IconeCrayon />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setUtilisateurASupprimer(u)}
                          disabled={enCours === u.id}
                          title={`Supprimer ${u.email}`}
                          aria-label={`Supprimer ${u.email}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-coral-400 transition-colors hover:bg-coral-50 hover:text-coral-600 disabled:opacity-40"
                        >
                          <IconeCorbeille />
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
