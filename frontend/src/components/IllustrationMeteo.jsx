export default function IllustrationMeteo() {
  return (
    <div className="illustration-meteo" aria-hidden="true">
      <div className="illustration-meteo__soleil" />
      <div className="illustration-meteo__soleil illustration-meteo__soleil--halo" />

      <div className="illustration-meteo__nuage illustration-meteo__nuage--back">
        <span className="illustration-meteo__bulle illustration-meteo__bulle--left-back" />
        <span className="illustration-meteo__bulle illustration-meteo__bulle--right-back" />
      </div>
      <div className="illustration-meteo__nuage illustration-meteo__nuage--front">
        <span className="illustration-meteo__bulle illustration-meteo__bulle--left-front" />
        <span className="illustration-meteo__bulle illustration-meteo__bulle--right-front" />
      </div>
    </div>
  )
}
