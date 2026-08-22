export default function SphereRotative() {
  return (
    <div className="sphere-rotative" aria-hidden="true">
      <span className="sphere-rotative__onde-cyan" />
      <span className="sphere-rotative__onde-cyan" style={{ animationDelay: '1.5s' }} />
      <div className="sphere-rotative__globe">
        <span className="sphere-rotative__meridien" style={{ animationDelay: '0s' }} />
        <span className="sphere-rotative__meridien" style={{ animationDelay: '-2.6s' }} />
        <span className="sphere-rotative__meridien" style={{ animationDelay: '-5.3s' }} />
        <span className="sphere-rotative__point sphere-rotative__point--1" />
        <span className="sphere-rotative__point sphere-rotative__point--2" />
        <span className="sphere-rotative__point sphere-rotative__point--3" />
      </div>
    </div>
  )
}
