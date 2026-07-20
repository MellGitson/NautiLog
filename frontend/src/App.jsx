import { Routes, Route } from 'react-router-dom'
import RouteProtegee from './components/RouteProtegee'
import NavBar from './components/NavBar'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import ListeBateaux from './pages/ListeBateaux'
import DetailBateau from './pages/DetailBateau'
import ListePorts from './pages/ListePorts'
import DetailPort from './pages/DetailPort'
import ListeTrajets from './pages/ListeTrajets'
import DetailTrajet from './pages/DetailTrajet'
import NouveauTrajet from './pages/NouveauTrajet'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <NavBar />
      <div id="contenu-principal" className="mx-auto max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/"            element={<Accueil />} />
          <Route path="/connexion"   element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/bateaux"          element={<RouteProtegee><ListeBateaux /></RouteProtegee>} />
          <Route path="/bateaux/:id"      element={<RouteProtegee><DetailBateau /></RouteProtegee>} />
          <Route path="/ports"            element={<RouteProtegee><ListePorts /></RouteProtegee>} />
          <Route path="/ports/:id"        element={<RouteProtegee><DetailPort /></RouteProtegee>} />
          <Route path="/trajets"          element={<RouteProtegee><ListeTrajets /></RouteProtegee>} />
          <Route path="/trajets/nouveau"  element={<RouteProtegee><NouveauTrajet /></RouteProtegee>} />
          <Route path="/trajets/:id"      element={<RouteProtegee><DetailTrajet /></RouteProtegee>} />
          <Route path="*"                 element={<NotFound />} />
        </Routes>
      </div>
    </>
  )
}
