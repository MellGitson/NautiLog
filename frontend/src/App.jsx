import { Routes, Route } from 'react-router-dom'
import RouteProtegee from './components/RouteProtegee'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import ListeBateaux from './pages/ListeBateaux'
import DetailBateau from './pages/DetailBateau'
import ListePorts from './pages/ListePorts'
import DetailPort from './pages/DetailPort'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Accueil />} />
      <Route path="/connexion"   element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/bateaux"          element={<RouteProtegee><ListeBateaux /></RouteProtegee>} />
      <Route path="/bateaux/:id"      element={<RouteProtegee><DetailBateau /></RouteProtegee>} />
      <Route path="/ports"            element={<RouteProtegee><ListePorts /></RouteProtegee>} />
      <Route path="/ports/:id"        element={<RouteProtegee><DetailPort /></RouteProtegee>} />
      <Route path="*"                 element={<NotFound />} />
    </Routes>
  )
}
