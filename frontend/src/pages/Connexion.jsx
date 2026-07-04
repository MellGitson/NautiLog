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
    <main>
      <h1>Connexion</h1>

      <form onSubmit={soumettre} noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={valeurs.email}
            onChange={gererChangement}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            name="motDePasse"
            value={valeurs.motDePasse}
            onChange={gererChangement}
            required
            autoComplete="current-password"
          />
        </div>

        {erreur && <p role="alert">{erreur}</p>}

        <button type="submit" disabled={chargement}>
          {chargement ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p>
        Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
      </p>
    </main>
  )
}
