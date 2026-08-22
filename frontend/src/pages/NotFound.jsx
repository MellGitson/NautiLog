import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="relative flex flex-col items-center gap-6 py-24 text-center">
      <span className="goutte-eau pointer-events-none absolute -top-2 left-1/3 h-10 w-10" aria-hidden="true" />
      <span className="goutte-eau pointer-events-none absolute bottom-8 right-1/3 h-6 w-6" style={{ animationDelay: '1.5s' }} aria-hidden="true" />

      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ocean-50 text-5xl" aria-hidden="true">
        🧭
      </span>
      <div>
        <h1>404 — Cap perdu</h1>
        <p className="mt-2 text-ocean-600">Cette page n'existe pas ou a été déplacée.</p>
      </div>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </main>
  )
}
