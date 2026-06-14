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
    <main>
      <h1>Inscription</h1>

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
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="role">Je suis</label>
          <select id="role" name="role" value={valeurs.role} onChange={gererChangement}>
            <option value="ROLE_RENTER">Locataire</option>
            <option value="ROLE_OWNER">Propriétaire</option>
          </select>
        </div>

        {erreur && <p role="alert">{erreur}</p>}

        <button type="submit" disabled={chargement}>
          {chargement ? 'Inscription…' : "S'inscrire"}
        </button>
      </form>

      <p>
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </main>
  )
}
