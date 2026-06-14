import { Routes, Route } from 'react-router-dom'
import RouteProtegee from './components/RouteProtegee'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import ListeBateaux from './pages/ListeBateaux'
import DetailBateau from './pages/DetailBateau'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Accueil />} />
      <Route path="/connexion"   element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/bateaux"          element={<RouteProtegee><ListeBateaux /></RouteProtegee>} />
      <Route path="/bateaux/:id"      element={<RouteProtegee><DetailBateau /></RouteProtegee>} />
      <Route path="*"                 element={<NotFound />} />
    </Routes>
  )
}
