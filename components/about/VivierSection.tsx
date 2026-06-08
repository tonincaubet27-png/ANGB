export default function VivierSection() {
  const initiatives = [
    {
      icon: '📋',
      title: 'Bourse Jeunes en Lumière (JFL)',
      desc: "Répertoire des jeunes gardiens à fort potentiel, accessible aux recruteurs et clubs de divisions supérieures. Inscription sur dossier.",
      badge: 'Actif',
      color: '#34d399',
    },
    {
      icon: '🔄',
      title: 'Système de prêt Magnus → D1',
      desc: "Faciliter les prêts de gardiens professionnels vers la D1 pour leur permettre du temps de jeu qualitatif. L'ANGB joue le rôle d'intermédiaire.",
      badge: 'En développement',
      color: '#fb923c',
    },
    {
      icon: '🏒',
      title: 'Hockey féminin',
      desc: "Soutien spécifique au développement des gardiennes de but en France. Connexion avec la structure de l'équipe de France féminine.",
      badge: 'Priorité 2026',
      color: 'var(--accent)',
    },
    {
      icon: '🪑',
      title: 'Gardiens backups',
      desc: "Attention particulière aux numéros 2 et 3, souvent délaissés dans les plans de développement. Réseau de partage de glace et d'opportunités.",
      badge: 'Actif',
      color: '#c084fc',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Vivier français
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
          La France a du talent. L'ANGB s'assure qu'il ne passe pas entre les mailles du filet.
          Quatre initiatives concrètes pour structurer le pipeline des gardiens français.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {initiatives.map(({ icon, title, desc, badge, color }) => (
          <div
            key={title}
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{title}</h3>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 uppercase tracking-wider"
                style={{ background: `${color}20`, color }}
              >
                {badge}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
          </div>
        ))}
      </div>

      <div
        className="p-5 rounded-xl border-l-4"
        style={{ background: 'rgba(74,127,255,0.07)', borderColor: 'var(--accent)' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          <strong style={{ color: 'var(--white)' }}>Objectif 2027 :</strong>{' '}
          cartographier 100% des gardiens actifs en Magnus, D1 et D2 dans notre base de données.
          Faire de l'ANGB la référence nationale incontournable pour les recruteurs.
        </p>
      </div>
    </div>
  )
}
