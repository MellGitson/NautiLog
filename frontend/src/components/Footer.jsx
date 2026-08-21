import { Link } from 'react-router-dom'

export default function Footer() {
  const annee = new Date().getFullYear()

  return (
    <footer className="border-t border-ocean-100 bg-white/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-ocean-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-display font-semibold text-ocean-800">
          <span aria-hidden="true">⚓</span> NautiLog
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/mentions-legales" className="hover:text-coral-500">Mentions légales</Link>
          <a href="mailto:contact@nautilog.fr" className="hover:text-coral-500">Contact</a>
        </nav>

        <p className="text-ocean-500">&copy; {annee} NautiLog. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
