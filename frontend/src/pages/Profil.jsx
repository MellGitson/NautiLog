import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Profil() {
  const [valeurs, setValeurs] = useState({ firstName: '', lastName: '', phone: '', avatarUrl: '' })
  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurs, setErreurs] = useState({})
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    api.get('/me')
      .then(({ data }) => {
        setValeurs({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          phone: data.phone ?? '',
          avatarUrl: data.avatarUrl ?? '',
        })
      })
      .finally(() => setChargement(false))
  }, [])

  const gererChangement = (e) => {
    const { name, value } = e.target
    setValeurs((prev) => ({ ...prev, [name]: value }))
  }

  const soumettre = async (e) => {
    e.preventDefault()
    setErreurs({})
    setSucces(false)
    setEnregistrement(true)
    try {
      await api.patch('/me', valeurs)
      setSucces(true)
    } catch (err) {
      setErreurs(err.response?.data?.errors ?? {})
    } finally {
      setEnregistrement(false)
    }
  }

  if (chargement) return <main><p>Chargement du profil…</p></main>

  return (
    <main className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-center">Mon profil</h1>

        <form onSubmit={soumettre} noValidate className="mt-6 space-y-4">
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

          <div>
            <label htmlFor="avatarUrl" className="label-field">URL de l'avatar</label>
            <input
              id="avatarUrl"
              type="text"
              name="avatarUrl"
              value={valeurs.avatarUrl}
              onChange={gererChangement}
              className="input-field"
            />
            {erreurs.avatarUrl && <p role="alert" className="mt-1 text-sm font-medium text-coral-600">{erreurs.avatarUrl}</p>}
          </div>

          {succes && <p role="status" className="text-sm font-medium text-ocean-600">Profil mis à jour avec succès.</p>}

          <button type="submit" disabled={enregistrement} className="btn-primary w-full">
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </main>
  )
}
