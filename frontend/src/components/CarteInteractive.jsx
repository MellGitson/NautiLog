import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const CENTRE_MEDITERRANEE = [43.4, 5.5]
const ZOOM_INITIAL = 8

export default function CarteInteractive({ ports }) {
  return (
    <MapContainer
      center={CENTRE_MEDITERRANEE}
      zoom={ZOOM_INITIAL}
      scrollWheelZoom
      className="relative z-0 h-[28rem] w-full overflow-hidden rounded-2xl border border-ocean-100 shadow-sm"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {ports.map((port) => (
        <Marker key={port.id} position={[parseFloat(port.latitude), parseFloat(port.longitude)]}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-ocean-900">{port.nom}</p>
              <p className="text-sm text-ocean-600">{port.ville}</p>
              <p className="text-sm text-ocean-600">Capacité : {port.capacite} bateaux</p>
              <p className="text-sm text-ocean-600">Bateaux amarrés : {port.bateaux}</p>
              <Link to={`/ports/${port.id}`} className="text-sm font-medium">Voir le détail →</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
