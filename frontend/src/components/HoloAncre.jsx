export default function HoloAncre({ taille = 'grande' }) {
  const classeTaille = taille === 'petite' ? 'holo-ancre--petite' : taille === 'moyenne' ? 'holo-ancre--moyenne' : ''

  return (
    <div className={`holo-ancre ${classeTaille}`} aria-hidden="true">
      <div className="holo-ancre__carte">
        <span className="holo-ancre__couche holo-ancre__couche--back">⚓</span>
        <span className="holo-ancre__couche holo-ancre__couche--mid">⚓</span>
        <span className="holo-ancre__couche holo-ancre__couche--front">⚓</span>
      </div>
    </div>
  )
}
