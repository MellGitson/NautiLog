import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main>
      <h1>404 — Page introuvable</h1>
      <Link to="/">Retour à l'accueil</Link>
    </main>
  )
}
