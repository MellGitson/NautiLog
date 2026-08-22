import { useEffect, useState } from 'react'
import api from '../services/api'
import GestionUtilisateurs from '../components/GestionUtilisateurs'

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = () => {
    api.get('/admin/users')
      .then((res) => setUtilisateurs(res.data))
      .catch(() => setErreur('Impossible de charger les utilisateurs.'))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  return (
    <main>
      <header className="mb-8 flex items-center justify-between gap-6 border-b border-ocean-100 pb-6">
        <div>
          <h1>Utilisateurs</h1>
          <p className="mt-2 text-ocean-600">Rôles, profils et suppression de compte.</p>
        </div>
        <div className="flex shrink-0 flex-col items-center rounded-2xl bg-ocean-900 px-6 py-3 text-white">
          <span className="font-display text-3xl leading-none">{utilisateurs.length}</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ocean-300">Comptes</span>
        </div>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <GestionUtilisateurs utilisateurs={utilisateurs} onMiseAJour={charger} />
      )}
    </main>
  )
}
