import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Admin() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUtilisateurs(res.data))
      .catch(() => setErreur('Impossible de charger les utilisateurs.'))
      .finally(() => setChargement(false))
  }, [])

  return (
    <main>
      <header className="mb-8">
        <h1>Espace administrateur</h1>
        <p className="mt-2 text-ocean-600">Dashboard complet à venir (FE-12). Aperçu des utilisateurs en attendant.</p>
      </header>

      {chargement && <p>Chargement…</p>}
      {erreur && <p className="text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <ul className="flex flex-col gap-2">
          {utilisateurs.map((u) => (
            <li key={u.id} className="rounded-lg border border-ocean-100 bg-white px-4 py-3">
              <span className="font-medium">{u.email}</span>
              <span className="ml-2 text-sm text-ocean-500">{u.roles.join(', ')}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
