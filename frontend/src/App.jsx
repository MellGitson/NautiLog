import { Routes, Route, Navigate } from 'react-router-dom'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import ListeBateaux from './pages/ListeBateaux'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<Accueil />} />
      <Route path="/connexion"  element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/bateaux"    element={<ListeBateaux />} />
      <Route path="*"           element={<NotFound />} />
    </Routes>
  )
}
