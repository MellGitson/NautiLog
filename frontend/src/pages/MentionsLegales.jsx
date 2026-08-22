import { useState } from 'react'
import ModalContact from '../components/ModalContact'

function IconeBatiment() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  )
}

function IconeServeur() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="4" width="20" height="6" rx="1" />
      <rect x="2" y="14" width="20" height="6" rx="1" />
      <path d="M6 7h.01M6 17h.01" />
    </svg>
  )
}

function IconeCourrier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  )
}

function IconeBouclier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  )
}

export default function MentionsLegales() {
  const [contactOuvert, setContactOuvert] = useState(false)

  return (
    <main className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-700 px-8 py-10 text-white">
        <h1 className="text-white">Mentions légales</h1>
        <p className="mt-2 text-sm text-ocean-300">Informations légales et protection de vos données.</p>
      </div>

      <div className="mt-6 space-y-4">
        <section className="card holo-bloc" style={{ animationDelay: '0s' }}>
          <h2 className="flex items-center gap-2 text-ocean-800">
            <IconeBatiment />
            Éditeur du site
          </h2>
          <p className="mt-2 text-ocean-700">
            NautiLog est un projet développé dans le cadre d'une formation Concepteur Développeur d'Applications (CDA).
            Site accessible à l'adresse <strong>nautilog.fr</strong>.
          </p>
        </section>

        <section className="card holo-bloc" style={{ animationDelay: '-1.5s' }}>
          <h2 className="flex items-center gap-2 text-ocean-800">
            <IconeServeur />
            Hébergement
          </h2>
          <p className="mt-2 text-ocean-700">Le site est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
        </section>

        <section className="card holo-bloc" style={{ animationDelay: '-3.1s' }}>
          <h2 className="flex items-center gap-2 text-ocean-800">
            <IconeCourrier />
            Contact
          </h2>
          <p className="mt-2 text-ocean-700">
            Pour toute question relative au site ou à vos données personnelles, vous pouvez{' '}
            <button type="button" onClick={() => setContactOuvert(true)} className="font-medium text-coral-500 hover:underline">
              nous contacter
            </button>.
          </p>
        </section>

        <section className="card holo-bloc" style={{ animationDelay: '-4.6s' }}>
          <h2 className="flex items-center gap-2 text-ocean-800">
            <IconeBouclier />
            Données personnelles
          </h2>
          <p className="mt-2 text-ocean-700">
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            Le droit à l'oubli est accessible directement depuis votre page de profil.
          </p>
        </section>
      </div>

      {contactOuvert && <ModalContact onFermer={() => setContactOuvert(false)} />}
    </main>
  )
}
