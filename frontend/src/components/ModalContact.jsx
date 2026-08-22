import { useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api'

export default function ModalContact({ onFermer }) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [envoye, setEnvoye] = useState(false)

  const envoyer = async (e) => {
    e.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      await api.post('/contact', { nom, email, message })
      setEnvoye(true)
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible d'envoyer le message. Réessayez plus tard.")
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-contact"
      onClick={() => !envoiEnCours && onFermer()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 backdrop-blur-sm p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="card w-full max-w-md">
        {envoye ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h2 id="titre-contact">Message envoyé</h2>
            <p className="text-sm text-ocean-600">Merci, nous vous répondrons dès que possible.</p>
            <button type="button" onClick={onFermer} className="btn-ghost mt-2">Fermer</button>
          </div>
        ) : (
          <>
            <h2 id="titre-contact">Nous contacter</h2>
            <p className="mt-1 text-sm text-ocean-600">Une question, une remarque ? Écrivez-nous.</p>

            <form onSubmit={envoyer} className="mt-4 flex flex-col gap-3">
              <div>
                <label htmlFor="contact-nom" className="label-field">Nom</label>
                <input
                  id="contact-nom"
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="label-field">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="label-field">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                />
              </div>

              {erreur && <p role="alert" className="text-sm font-medium text-coral-600">{erreur}</p>}

              <div className="mt-2 flex gap-3">
                <button type="submit" disabled={envoiEnCours} className="btn-accent">
                  {envoiEnCours ? 'Envoi…' : 'Envoyer'}
                </button>
                <button type="button" onClick={onFermer} disabled={envoiEnCours} className="btn-ghost">
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
