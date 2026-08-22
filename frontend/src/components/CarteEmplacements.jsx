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

function IconeAncre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  )
}

function PanneauEmplacement({ emplacement }) {
  const bateau = emplacement?.bateau

  if (!emplacement) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-ocean-400">
        <IconeAncre />
        <p className="text-sm">Cliquez sur une icône pour voir le détail d'un emplacement.</p>
      </div>
    )
  }

  return (
    <div key={emplacement.id} className="animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ocean-800">{emplacement.label}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bateau ? 'bg-ocean-100 text-ocean-700' : 'bg-emerald-100 text-emerald-800'}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: bateau ? couleurType(bateau.type) : COULEUR_LIBRE }} aria-hidden="true" />
          {bateau ? 'Occupé' : 'Libre'}
        </span>
      </div>

      {bateau ? (
        <dl className="mt-4 flex flex-col gap-3">
          <div>
            <dt className="text-xs font-medium text-ocean-400">Bateau</dt>
            <dd className="text-sm font-medium text-ocean-900">{bateau.nom}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ocean-400">Type</dt>
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
            <dt className="text-xs font-medium text-ocean-400">Statut</dt>
            <dd className="text-sm text-ocean-900">{bateau.statut}</dd>
          </div>
          {bateau.proprietaire?.email && (
            <div>
              <dt className="text-xs font-medium text-ocean-400">Propriétaire</dt>
              <dd className="text-sm text-ocean-900">{bateau.proprietaire.email}</dd>
            </div>
          )}
          <Link to={`/bateaux/${bateau.id}`} className="btn-ghost mt-1 !py-1.5 text-center text-sm">
            Voir le bateau →
          </Link>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-ocean-500">Cet emplacement est libre et disponible.</p>
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

  const typesPresents = [...new Set(avecPosition.filter((e) => e.bateau).map((e) => e.bateau.type))]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div>
        <MapContainer
          center={centre}
          zoom={15}
          scrollWheelZoom
          className="relative z-0 h-96 w-full overflow-hidden rounded-2xl border border-ocean-100 shadow-sm"
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

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ocean-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COULEUR_LIBRE }} aria-hidden="true" />
            Libre
          </span>
          {typesPresents.map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: couleurType(type) }} aria-hidden="true" />
              {type}
            </span>
          ))}
        </div>
      </div>

      <aside className="card h-96 overflow-y-auto">
        <PanneauEmplacement emplacement={selection} />
      </aside>
    </div>
  )
}
