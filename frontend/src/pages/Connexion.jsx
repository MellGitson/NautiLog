import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFormulaire } from '../hooks/useFormulaire'

export default function Connexion() {
  const { connexion } = useAuth()
  const navigate = useNavigate()
  const { valeurs, erreur, chargement, gererChangement, gererSoumission } = useFormulaire({
    email: '',
    motDePasse: '',
  })

  const soumettre = gererSoumission(async ({ email, motDePasse }) => {
    await connexion(email, motDePasse)
    navigate('/bateaux')
  })

  return (
    <main className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-center">Connexion</h1>

        <form onSubmit={soumettre} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label-field">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={valeurs.email}
              onChange={gererChangement}
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="motDePasse" className="label-field">Mot de passe</label>
            <input
              id="motDePasse"
              type="password"
              name="motDePasse"
              value={valeurs.motDePasse}
              onChange={gererChangement}
              required
              autoComplete="current-password"
              className="input-field"
            />
          </div>

          {erreur && <p role="alert" className="text-sm font-medium text-coral-600">{erreur}</p>}

          <button type="submit" disabled={chargement} className="btn-primary w-full">
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ocean-600">
          Pas encore de compte ? <Link to="/inscription" className="font-medium">S'inscrire</Link>
        </p>
      </div>
    </main>
  )
}
