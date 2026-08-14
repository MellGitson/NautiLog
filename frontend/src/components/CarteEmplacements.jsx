import { useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'

const COULEURS_TYPE = {
  Voilier: '#2896b3',
  Catamaran: '#7c3aed',
  Yacht: '#c026d3',
  'Bateau à moteur': '#f8552a',
  Vedette: '#138e40',
  Zodiac: '#ca8a04',
}
const COULEUR_PAR_DEFAUT = '#64748b'
const COULEUR_LIBRE = '#24e24a'

const couleurType = (type) => COULEURS_TYPE[type] ?? COULEUR_PAR_DEFAUT

const SVG_BATEAU = (couleur) => `
  <svg viewBox="0 0 32 32" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="${couleur}" stroke="white" stroke-width="1.5" />
    <path fill="white"
      d="M10 20 C10 20 11.5 23.5 16 23.5 C20.5 23.5 22 20 22 20 Z" />
    <line x1="16" y1="20" x2="16" y2="10" stroke="white" stroke-width="2" stroke-linecap="round" />
    <path fill="white"
      d="M16 10.5 L20.5 19.3 L16 19.3 Z" />
  </svg>
`

const iconeEmplacement = (bateau) => {
  const couleur = bateau ? couleurType(bateau.type) : COULEUR_LIBRE

  return L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5));">${SVG_BATEAU(couleur)}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function PanneauEmplacement({ emplacement }) {
  const bateau = emplacement?.bateau

  if (!emplacement) {
    return <p className="text-sm text-ocean-500">Cliquez sur une icône pour voir le détail d'un emplacement.</p>
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-ocean-800">{emplacement.label}</h3>

      {bateau ? (
        <dl className="mt-3 flex flex-col gap-2">
          <div>
            <dt className="text-xs font-medium text-ocean-500">Bateau</dt>
            <dd className="text-sm text-ocean-900">{bateau.nom}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ocean-500">Type</dt>
            <dd className="flex items-center gap-1.5 text-sm text-ocean-900">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: couleurType(bateau.type) }}
                aria-hidden="true"
              />
              {bateau.type}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ocean-500">Statut</dt>
            <dd className="text-sm text-ocean-900">{bateau.statut}</dd>
          </div>
          {bateau.proprietaire?.email && (
            <div>
              <dt className="text-xs font-medium text-ocean-500">Propriétaire</dt>
              <dd className="text-sm text-ocean-900">{bateau.proprietaire.email}</dd>
            </div>
          )}
          <Link to={`/bateaux/${bateau.id}`} className="mt-1 text-sm font-medium">
            Voir le bateau →
          </Link>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-ocean-500">Emplacement libre</p>
      )}
    </div>
  )
}

export default function CarteEmplacements({ port, emplacements }) {
  const { user, aRole } = useAuth()
  const [selection, setSelection] = useState(null)
  const centre = [parseFloat(port.latitude), parseFloat(port.longitude)]

  const visibles = aRole('ROLE_ADMIN')
    ? emplacements
    : emplacements.filter((e) => !e.bateau || e.bateau.proprietaire?.email === user?.email)

  const avecPosition = visibles.filter((e) => e.latitude !== null && e.longitude !== null)

  if (avecPosition.length === 0) {
    return <p className="text-ocean-600">Aucun emplacement localisé sur la carte pour le moment.</p>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
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
            icon={iconeEmplacement(emplacement.bateau)}
            eventHandlers={{ click: () => setSelection(emplacement) }}
          />
        ))}
      </MapContainer>

      <aside className="card h-96 overflow-y-auto">
        <PanneauEmplacement emplacement={selection} />
      </aside>
    </div>
  )
}
