import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const gererEchap = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', gererEchap)
    return () => document.removeEventListener('keydown', gererEchap)
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/80 backdrop-blur-sm animate-fade-in"
    >
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] animate-scale-in rounded-2xl object-contain shadow-2xl"
      />
    </div>,
    document.body
  )
}
