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

const iconeEmplacement = (occupe) => L.divIcon({
  className: '',
  html: `<span style="display:flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:9999px;background:${occupe ? '#f8552a' : '#2896b3'};color:white;font-size:0.9rem;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${occupe ? '⚓' : '○'}</span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export default function CarteEmplacements({ port, emplacements }) {
  const centre = [parseFloat(port.latitude), parseFloat(port.longitude)]
  const avecPosition = emplacements.filter((e) => e.latitude !== null && e.longitude !== null)

  return (
    <MapContainer
      center={centre}
      zoom={15}
      scrollWheelZoom
      className="h-96 w-full rounded-2xl border border-ocean-100 shadow-sm"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {avecPosition.map((emplacement) => (
        <Marker
          key={emplacement.id}
          position={[emplacement.latitude, emplacement.longitude]}
          icon={iconeEmplacement(Boolean(emplacement.bateau))}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-ocean-900">{emplacement.label}</p>
              {emplacement.bateau ? (
                <>
                  <p className="text-sm text-ocean-600">{emplacement.bateau.nom}</p>
                  <p className="text-sm text-ocean-600">Statut : {emplacement.bateau.statut}</p>
                  <Link to={`/bateaux/${emplacement.bateau.id}`} className="text-sm font-medium">Voir le bateau →</Link>
                </>
              ) : (
                <p className="text-sm text-ocean-500">Emplacement libre</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
