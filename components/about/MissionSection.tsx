export default function MissionSection() {
  const axes = [
    {
      num: '01',
      title: 'Formation',
      desc: "Structurer le parcours de formation des gardiens, du niveau local au professionnel. Développer le diplôme d'État spécialisé gardien de but.",
      color: 'var(--accent)',
    },
    {
      num: '02',
      title: 'Santé & Prévention',
      desc: "Sensibiliser aux risques spécifiques du poste. Développer des protocoles de prévention adaptés à la réalité des gardiens.",
      color: '#34d399',
    },
    {
      num: '03',
      title: 'Vivier & Développement',
      desc: "Identifier et soutenir les jeunes gardiens à fort potentiel. Structurer les passerelles entre divisions.",
      color: '#fb923c',
    },
    {
      num: '04',
      title: 'Statistiques & Analyse',
      desc: "Créer une cartographie nationale des gardiens. Développer des métriques adaptées au hockey français.",
      color: '#c084fc',
    },
    {
      num: '05',
      title: 'Conseil & Accompagnement',
      desc: "Accompagner les gardiens dans leur carrière, dans le respect strict du cadre légal de l'agent sportif.",
      color: 'var(--red-fr)',
    },
  ]

  const benefits = [
    { icon: '🛡️', text: 'Représentation officielle auprès de la FFHG' },
    { icon: '🤝', text: 'Réseau national de gardiens et entraîneurs' },
    { icon: '📚', text: "Accès aux ressources formation et outils d'analyse" },
    { icon: '🩺', text: 'Accompagnement santé et prévention' },
    { icon: '💼', text: 'Conseils carrière dans le cadre légal' },
    { icon: '🏆', text: "Défense des intérêts du poste à l'échelon national" },
  ]

  return (
    <div className="space-y-12">
      {/* Vision */}
      <div>
        <h2
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Notre vision
        </h2>
        <p className="text-base leading-relaxed max-w-3xl" style={{ color: 'var(--gray)' }}>
          L'ANGB naît d'un constat simple : le gardien de but est le poste le plus spécialisé
          du hockey sur glace, et pourtant le moins structuré institutionnellement en France.
          Notre ambition est de changer cela — en créant une structure dédiée qui parle d'une
          seule voix pour plus de 1 200 gardiens.
        </p>
      </div>

      {/* Axes */}
      <div>
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          5 axes stratégiques
        </h3>
        <div className="space-y-3">
          {axes.map(({ num, title, desc, color }) => (
            <div
              key={num}
              className="flex gap-4 p-5 rounded-xl border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <span
                className="text-2xl flex-shrink-0 w-10"
                style={{ fontFamily: 'var(--font-bebas)', color, letterSpacing: '0.05em' }}
              >
                {num}
              </span>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--white)' }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bénéfices */}
      <div>
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Pourquoi adhérer ?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
