export default function FormationSection() {
  const steps = [
    {
      title: 'Diplôme d\'État Gardien de But',
      desc: 'L\'ANGB milite pour la création d\'un DE spécialisé gardien de but, distinct du DE Hockey généraliste. Un parcours qualifiant reconnu par l\'État et la FFHG.',
      badge: 'En cours de négociation',
      badgeColor: '#fb923c',
    },
    {
      title: 'Label Club Formateur',
      desc: 'Un référentiel de qualité pour les clubs qui investissent dans la formation des jeunes gardiens. Critères : temps de glace dédié, entraîneur qualifié, suivi individuel.',
      badge: 'Phase de définition',
      badgeColor: '#c084fc',
    },
    {
      title: 'Réseau d\'entraîneurs',
      desc: 'Mise en relation des entraîneurs gardiens certifiés avec les clubs qui en ont besoin. Annuaire national, partage de ressources pédagogiques.',
      badge: 'Actif',
      badgeColor: '#34d399',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Problème */}
      <div
        className="p-6 rounded-2xl border-l-4"
        style={{ background: 'var(--navy-mid)', borderColor: 'var(--red-fr)' }}
      >
        <h3
          className="text-xl mb-3"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Le constat actuel
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          En France, il n'existe pas de diplôme d'État spécifique au poste de gardien de but
          au hockey sur glace. Les entraîneurs gardiens se forment sur le tas, au gré des
          opportunités et des voyages à l'étranger. Les clubs manquent de références pour
          évaluer les compétences d'un entraîneur gardien. L'ANGB change cela.
        </p>
      </div>

      {/* 3 initiatives */}
      <div className="grid gap-4">
        {steps.map(({ title, desc, badge, badgeColor }) => (
          <div
            key={title}
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h4 className="font-semibold" style={{ color: 'var(--white)' }}>{title}</h4>
              <span
                className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium"
                style={{ background: `${badgeColor}20`, color: badgeColor }}
              >
                {badge}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="text-xs italic" style={{ color: 'var(--gray)' }}>
        L'ANGB travaille en collaboration avec la FFHG et les instances régionales pour
        construire ces dispositifs. Tout avancement sera communiqué aux membres.
      </p>
    </div>
  )
}
