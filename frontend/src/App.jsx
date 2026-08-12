import { Routes, Route } from 'react-router-dom'
import RouteProtegee from './components/RouteProtegee'
import NavBar from './components/NavBar'
import Accueil from './pages/Accueil'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import ListeBateaux from './pages/ListeBateaux'
import NouveauBateau from './pages/NouveauBateau'
import DetailBateau from './pages/DetailBateau'
import ListePorts from './pages/ListePorts'
import DetailPort from './pages/DetailPort'
import ListeTrajets from './pages/ListeTrajets'
import DetailTrajet from './pages/DetailTrajet'
import NouveauTrajet from './pages/NouveauTrajet'
import AdminLayout from './components/AdminLayout'
import AdminOverview from './pages/AdminOverview'
import AdminFlotte from './pages/AdminFlotte'
import AdminPorts from './pages/AdminPorts'
import AdminUtilisateurs from './pages/AdminUtilisateurs'
import AdminReservations from './pages/AdminReservations'
import AdminSignalements from './pages/AdminSignalements'
import Profil from './pages/Profil'
import MesReservations from './pages/MesReservations'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <RouteProtegee role="ROLE_ADMIN">
              <AdminLayout />
            </RouteProtegee>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="flotte" element={<AdminFlotte />} />
          <Route path="ports" element={<AdminPorts />} />
          <Route path="utilisateurs" element={<AdminUtilisateurs />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="signalements" element={<AdminSignalements />} />
        </Route>

        <Route
          path="*"
          element={
            <div id="contenu-principal" className="mx-auto max-w-5xl px-6 py-10">
              <Routes>
                <Route path="/"            element={<Accueil />} />
                <Route path="/connexion"   element={<Connexion />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/bateaux"          element={<RouteProtegee><ListeBateaux /></RouteProtegee>} />
                <Route path="/bateaux/nouveau"  element={<RouteProtegee role="ROLE_OWNER"><NouveauBateau /></RouteProtegee>} />
                <Route path="/bateaux/:id"      element={<RouteProtegee><DetailBateau /></RouteProtegee>} />
                <Route path="/ports"            element={<RouteProtegee><ListePorts /></RouteProtegee>} />
                <Route path="/ports/:id"        element={<RouteProtegee><DetailPort /></RouteProtegee>} />
                <Route path="/trajets"          element={<RouteProtegee><ListeTrajets /></RouteProtegee>} />
                <Route path="/trajets/nouveau"  element={<RouteProtegee><NouveauTrajet /></RouteProtegee>} />
                <Route path="/trajets/:id"      element={<RouteProtegee><DetailTrajet /></RouteProtegee>} />
                <Route path="/reservations"     element={<RouteProtegee><MesReservations /></RouteProtegee>} />
                <Route path="/notifications"    element={<RouteProtegee><Notifications /></RouteProtegee>} />
                <Route path="/profil"           element={<RouteProtegee><Profil /></RouteProtegee>} />
                <Route path="*"                 element={<NotFound />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </>
  )
}
