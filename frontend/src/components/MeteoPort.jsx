import { useEffect, useState } from 'react'
import { getMeteo } from '../services/meteo'

function IconeTemperature() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0Z" />
    </svg>
  )
}

function IconeVent({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      style={{ transform: `rotate(${direction}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  )
}

function IconeVague() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M2 16c1.5 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0 3.5-1.5 5 0" />
      <path d="M2 11c1.5 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0 3.5-1.5 5 0" />
    </svg>
  )
}

export default function MeteoPort({ portId }) {
  const [meteo, setMeteo] = useState(null)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    let annule = false
    getMeteo(portId)
      .then((data) => { if (!annule) setMeteo(data) })
      .catch(() => { if (!annule) setErreur(true) })
    return () => { annule = true }
  }, [portId])

  if (erreur) return <p className="text-xs text-ocean-400">Météo indisponible</p>
  if (!meteo) return <p className="text-xs text-ocean-400">Météo…</p>

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ocean-700">
      <span className="flex items-center gap-1 font-semibold text-ocean-900">
        <IconeTemperature />
        {Math.round(meteo.temperature)}°C
      </span>
      <span className="flex items-center gap-1">
        <IconeVent direction={meteo.directionVent} />
        {Math.round(meteo.vitesseVent)} km/h
      </span>
      <span className="badge flex items-center gap-1 bg-ocean-100 text-ocean-700">
        <IconeVague />
        mer {meteo.etatMer}
      </span>
    </div>
  )
}
