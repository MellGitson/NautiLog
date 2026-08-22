import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFormulaire } from '../hooks/useFormulaire'
import PanneauAuth from '../components/PanneauAuth'

export default function Auth() {
  const { connexion, inscription } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const estInscription = location.pathname === '/inscription'

  const { valeurs, erreur, chargement, gererChangement, gererSoumission } = useFormulaire({
    email: '',
    motDePasse: '',
    role: 'ROLE_RENTER',
  })

  const soumettre = gererSoumission(async ({ email, motDePasse, role }) => {
    if (estInscription) {
      await inscription(email, motDePasse, role)
      await connexion(email, motDePasse)
    } else {
      await connexion(email, motDePasse)
    }
    navigate('/bateaux')
  })

  return (
    <main className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl shadow-lg lg:grid-cols-2">
      <PanneauAuth
        titre={estInscription ? 'Rejoignez les plaisanciers NautiLog.' : 'Votre flotte, toujours à portée de main.'}
        texte={
          estInscription
            ? 'Que vous possédiez un bateau ou cherchiez à en louer un, créez votre compte en quelques secondes.'
            : 'Suivez vos bateaux, gérez vos réservations et consultez la météo de vos ports, en un seul endroit.'
        }
      />

      <div key={location.pathname} className="animate-slide-in bg-white p-8 sm:p-10">
        <h1>{estInscription ? 'Inscription' : 'Connexion'}</h1>
        <p className="mt-1 text-sm text-ocean-500">
          {estInscription ? 'Créez votre compte en un instant.' : 'Ravis de vous revoir.'}
        </p>

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
              autoComplete={estInscription ? 'new-password' : 'current-password'}
              className="input-field"
            />
          </div>

          {estInscription && (
            <div>
              <label htmlFor="role" className="label-field">Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${valeurs.role === 'ROLE_RENTER' ? 'border-ocean-400 bg-ocean-50 text-ocean-800' : 'border-ocean-100 text-ocean-500 hover:border-ocean-200'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_RENTER"
                    checked={valeurs.role === 'ROLE_RENTER'}
                    onChange={gererChangement}
                    className="sr-only"
                  />
                  Locataire
                </label>
                <label className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${valeurs.role === 'ROLE_OWNER' ? 'border-ocean-400 bg-ocean-50 text-ocean-800' : 'border-ocean-100 text-ocean-500 hover:border-ocean-200'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_OWNER"
                    checked={valeurs.role === 'ROLE_OWNER'}
                    onChange={gererChangement}
                    className="sr-only"
                  />
                  Propriétaire
                </label>
              </div>
            </div>
          )}

          {erreur && <p role="alert" className="text-sm font-medium text-coral-600">{erreur}</p>}

          <button type="submit" disabled={chargement} className="btn-primary w-full">
            {estInscription
              ? (chargement ? 'Inscription…' : "S'inscrire")
              : (chargement ? 'Connexion…' : 'Se connecter')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ocean-600">
          {estInscription ? (
            <>Déjà un compte ? <Link to="/connexion" className="font-medium">Se connecter</Link></>
          ) : (
            <>Pas encore de compte ? <Link to="/inscription" className="font-medium">S'inscrire</Link></>
          )}
        </p>
      </div>
    </main>
  )
}
