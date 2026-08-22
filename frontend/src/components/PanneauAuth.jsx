import wallpaperEau from '../assets/wallpaper-eaututu.png'

export default function PanneauAuth({ titre, texte }) {
  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
      style={{ backgroundImage: `url(${wallpaperEau})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-950/90 via-ocean-900/80 to-ocean-700/70" aria-hidden="true" />

      <div className="relative z-10 flex items-center gap-2 font-display text-xl font-semibold">
        <span aria-hidden="true">⚓</span> NautiLog
      </div>
      <div key={titre} className="relative z-10 animate-fade-in">
        <p className="font-display text-3xl leading-tight">{titre}</p>
        <p className="mt-4 text-sm text-ocean-300">{texte}</p>
      </div>
      <p className="relative z-10 text-xs text-ocean-400">Naviguez, gérez votre flotte en toute confiance.</p>
    </div>
  )
}
