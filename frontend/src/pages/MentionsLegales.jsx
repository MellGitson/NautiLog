export default function MentionsLegales() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 py-4 text-ocean-700">
      <h1 className="font-display text-2xl font-bold text-ocean-800">Mentions légales</h1>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ocean-800">Éditeur du site</h2>
        <p>
          NautiLog est un projet développé dans le cadre d'une formation Concepteur Développeur d'Applications (CDA).
          Site accessible à l'adresse <strong>nautilog.fr</strong>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ocean-800">Hébergement</h2>
        <p>Le site est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ocean-800">Contact</h2>
        <p>
          Pour toute question relative au site ou à vos données personnelles, vous pouvez nous contacter à
          l'adresse : <a href="mailto:contact@nautilog.fr" className="text-coral-500 hover:underline">contact@nautilog.fr</a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold text-ocean-800">Données personnelles</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
          Le droit à l'oubli est accessible directement depuis votre page de profil.
        </p>
      </section>
    </main>
  )
}
