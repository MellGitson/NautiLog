import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profil() {
  const { deconnexion } = useAuth()
  const navigate = useNavigate()
  const inputPhotoRef = useRef(null)
  const [profil, setProfil] = useState(null)
  const [valeurs, setValeurs] = useState({ firstName: '', lastName: '', phone: '' })
  const [modeEdition, setModeEdition] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurs, setErreurs] = useState({})
  const [succes, setSucces] = useState(false)
  const [enCoursPhoto, setEnCoursPhoto] = useState(false)
  const [erreurPhoto, setErreurPhoto] = useState(null)
  const [confirmationSuppression, setConfirmationSuppression] = useState(false)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  const chargerProfil = () => {
    return api.get('/me').then(({ data }) => {
      setProfil(data)
      setValeurs({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
      })
    })
  }

  useEffect(() => {
    chargerProfil().finally(() => setChargement(false))
  }, [])

  useEffect(() => {
    if (!confirmationSuppression) return
    const gererEchap = (e) => e.key === 'Escape' && setConfirmationSuppression(false)
    document.addEventListener('keydown', gererEchap)
    return () => document.removeEventListener('keydown', gererEchap)
  }, [confirmationSuppression])

  const aDesInfosRenseignees = Boolean(profil?.firstName || profil?.lastName || profil?.phone)

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const annulerEdition = () => {
    setValeurs({
      firstName: profil.firstName ?? '',
      lastName: profil.lastName ?? '',
      phone: profil.phone ?? '',
    })
    setModeEdition(false)
    setErreurs({})
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setErreurs({})
    setSucces(false)
    setEnregistrement(true)
    try {
      const { data } = await api.patch('/me', valeurs)
      setProfil(data)
      setSucces(true)
      setModeEdition(false)
    } catch (err) {
      setErreurs(err.response?.data?.errors ?? {})
    } finally {
      setEnregistrement(false)
    }
  }

  const envoyerPhoto = async (e) => {
    const fichier = e.target.files[0]
    if (!fichier) return
    setErreurPhoto(null)
    setEnCoursPhoto(true)
    try {
      const formData = new FormData()
      formData.append('avatar', fichier)
      const { data } = await api.post('/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfil(data)
    } catch (err) {
      setErreurPhoto(err.response?.data?.erreur || "Erreur lors de l'envoi de la photo.")
    } finally {
      setEnCoursPhoto(false)
      if (inputPhotoRef.current) inputPhotoRef.current.value = ''
    }
  }

  const supprimerCompte = async () => {
    setSuppressionEnCours(true)
    try {
      await api.delete('/me')
      deconnexion()
      navigate('/')
    } finally {
      setSuppressionEnCours(false)
    }
  }

  if (chargement) return <main><p>Chargement du profil…</p></main>

  const initiale = (profil.firstName?.[0] ?? profil.email[0]).toUpperCase()

  return (
    <main className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-center">Mon profil</h1>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            {profil.avatarUrl ? (
              <img src={profil.avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-ocean-500 text-3xl font-semibold text-white">
                {initiale}
              </div>
            )}
            <button
              type="button"
              onClick={() => inputPhotoRef.current?.click()}
              disabled={enCoursPhoto}
              aria-label="Changer la photo de profil"
              title="Changer la photo de profil"
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-ocean-600 text-white shadow-md transition-colors hover:bg-ocean-700 disabled:opacity-60"
            >
              {enCoursPhoto ? (
                <span className="text-xs">…</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </button>
            <input
              ref={inputPhotoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={envoyerPhoto}
              className="hidden"
            />
          </div>
          {erreurPhoto && <p role="alert" className="mt-2 text-sm font-medium text-coral-600">{erreurPhoto}</p>}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ocean-500">Informations personnelles</p>
            {!modeEdition && (
              <button type="button" onClick={() => setModeEdition(true)} className="btn-ghost !px-3 !py-1 text-sm">
                Modifier
              </button>
            )}
          </div>

          {!modeEdition ? (
            !aDesInfosRenseignees ? (
              <p className="mt-3 text-sm text-ocean-400">Veuillez enregistrer vos informations.</p>
            ) : (
              <dl className="mt-3 space-y-3">
                <div>
                  <dt className="text-xs font-medium text-ocean-400">Prénom</dt>
                  <dd className="text-ocean-900">{profil.firstName || <span className="text-ocean-400">Non renseigné</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ocean-400">Nom</dt>
                  <dd className="text-ocean-900">{profil.lastName || <span className="text-ocean-400">Non renseigné</span>}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-ocean-400">Téléphone</dt>
                  <dd className="text-ocean-900">{profil.phone || <span className="text-ocean-400">Non renseigné</span>}</dd>
                </div>
              </dl>
            )
          ) : (
            <form onSubmit={soumettre} noValidate className="mt-3 space-y-4">
              <div>
                <label htmlFor="firstName" className="label-field">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={valeurs.firstName}
                  onChange={gererChangement}
                  className="input-field"
                />
                {erreurs.firstName && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="label-field">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={valeurs.lastName}
                  onChange={gererChangement}
                  className="input-field"
                />
                {erreurs.lastName && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.lastName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="label-field">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={valeurs.phone}
                  onChange={gererChangement}
                  autoComplete="tel"
                  className="input-field"
                />
                {erreurs.phone && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.phone}</p>}
              </div>

              {succes && <p role="status" className="text-sm font-medium text-ocean-600">Profil mis à jour avec succès.</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={enregistrement} className="btn-primary">
                  {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" onClick={annulerEdition} className="btn-ghost">
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 border-t border-ocean-100 pt-4 text-center">
          <button
            type="button"
            onClick={() => setConfirmationSuppression(true)}
            className="text-xs font-medium text-ocean-400 transition-colors hover:text-coral-600"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {confirmationSuppression && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-suppression-compte"
          onClick={() => !suppressionEnCours && setConfirmationSuppression(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-sm border-coral-200"
          >
            <h2 id="titre-suppression-compte" className="text-coral-700">Supprimer mon compte</h2>
            <p className="mt-2 text-sm text-ocean-600">
              Suppression définitive de votre compte et de toutes vos données (bateaux, réservations, historique).
              Cette action est irréversible.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={supprimerCompte}
                disabled={suppressionEnCours}
                className="btn-primary !bg-coral-600 hover:!bg-coral-700"
              >
                {suppressionEnCours ? 'Suppression…' : 'Oui, supprimer définitivement'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmationSuppression(false)}
                disabled={suppressionEnCours}
                className="btn-ghost"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  )
}
