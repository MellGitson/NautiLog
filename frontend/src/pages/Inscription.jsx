import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFormulaire } from '../hooks/useFormulaire'

export default function Inscription() {
  const { inscription, connexion } = useAuth()
  const navigate = useNavigate()
  const { valeurs, erreur, chargement, gererChangement, gererSoumission } = useFormulaire({
    email: '',
    motDePasse: '',
    role: 'ROLE_RENTER',
  })

  const soumettre = gererSoumission(async ({ email, motDePasse, role }) => {
    await inscription(email, motDePasse, role)
    await connexion(email, motDePasse)
    navigate('/bateaux')
  })

  return (
    <main className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-center">Inscription</h1>

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
              autoComplete="new-password"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="role" className="label-field">Je suis</label>
            <select id="role" name="role" value={valeurs.role} onChange={gererChangement} className="input-field">
              <option value="ROLE_RENTER">Locataire</option>
              <option value="ROLE_OWNER">Propriétaire</option>
            </select>
          </div>

          {erreur && <p role="alert" className="text-sm font-medium text-coral-600">{erreur}</p>}

          <button type="submit" disabled={chargement} className="btn-primary w-full">
            {chargement ? 'Inscription…' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ocean-600">
          Déjà un compte ? <Link to="/connexion" className="font-medium">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}
