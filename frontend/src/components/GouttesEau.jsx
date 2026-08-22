const GOUTTES = [
  { top: '8%', left: '4%', taille: 90, retard: '0s' },
  { top: '22%', left: '88%', taille: 60, retard: '1.2s' },
  { top: '68%', left: '6%', taille: 70, retard: '0.6s' },
  { top: '80%', left: '92%', taille: 100, retard: '1.8s' },
  { top: '45%', left: '95%', taille: 45, retard: '2.4s' },
]

export default function GouttesEau() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {GOUTTES.map((g, i) => (
        <span
          key={i}
          className="goutte-eau"
          style={{
            top: g.top,
            left: g.left,
            width: g.taille,
            height: g.taille,
            animationDelay: g.retard,
          }}
        />
      ))}
    </div>
  )
}
