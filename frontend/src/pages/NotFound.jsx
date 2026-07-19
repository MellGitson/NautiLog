import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex flex-col items-center gap-6 py-24 text-center">
      <span className="text-5xl" aria-hidden="true">🧭</span>
      <h1>404 — Cap perdu</h1>
      <p className="text-ocean-600">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </main>
  )
}
