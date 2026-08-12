import { createPortal } from 'react-dom'

export default function ModalConfirmationSuppression({ titre, elements, enCours, erreur, onConfirmer, onAnnuler }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-suppression-lot"
      onClick={() => !enCours && onAnnuler()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 backdrop-blur-sm p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="card w-full max-w-md border-coral-200">
        <h2 id="titre-suppression-lot" className="text-coral-700">{titre}</h2>
        <p className="mt-2 text-sm text-ocean-600">
          Cette action est irréversible. Vous êtes sur le point de supprimer :
        </p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-ocean-100 bg-ocean-50/50 p-3 text-sm text-ocean-800">
          {elements.map((el) => (
            <li key={el.id}>{el.label}</li>
          ))}
        </ul>

        {erreur && <p role="alert" className="mt-3 text-sm font-medium text-coral-600">{erreur}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onConfirmer}
            disabled={enCours}
            className="btn-primary !bg-coral-600 hover:!bg-coral-700"
          >
            {enCours ? 'Suppression…' : `Oui, supprimer (${elements.length})`}
          </button>
          <button type="button" onClick={onAnnuler} disabled={enCours} className="btn-ghost">
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
