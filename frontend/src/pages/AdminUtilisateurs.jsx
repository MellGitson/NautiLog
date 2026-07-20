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
      <header className="mb-8">
        <h1>Utilisateurs</h1>
        <p className="mt-2 text-ocean-600">{utilisateurs.length} utilisateur(s) inscrit(s).</p>
      </header>

      {chargement && <p className="text-ocean-600">Chargement…</p>}
      {erreur && <p role="alert" className="font-medium text-coral-600">{erreur}</p>}

      {!chargement && !erreur && (
        <GestionUtilisateurs utilisateurs={utilisateurs} onMiseAJour={charger} />
      )}
    </main>
  )
}
