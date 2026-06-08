export default function ConseilSection() {
  const services = [
    {
      icon: '🤝',
      title: 'Mise en relation',
      desc: "L'ANGB facilite les contacts entre gardiens et clubs. Pas d'intermédiation financière — uniquement du réseau.",
    },
    {
      icon: '📋',
      title: 'Lecture de contrats',
      desc: "Nous orientons les gardiens vers des professionnels compétents (avocats, agents certifiés) pour la relecture de leurs contrats.",
    },
    {
      icon: '🎓',
      title: 'Double carrière',
      desc: "Conseils sur la gestion études/sport, reconversion anticipée, partenariats avec les dispositifs CNOSF et FFHG.",
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Conseil carrière
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
          L'ANGB accompagne les gardiens dans leur carrière. Notre rôle est celui d'une
          association — conseil, orientation, mise en réseau — dans le respect strict du
          cadre légal.
        </p>
      </div>

      {/* Avertissement légal */}
      <div
        className="p-5 rounded-xl border-l-4"
        style={{ background: 'rgba(237,41,57,0.07)', borderColor: 'var(--red-fr)' }}
      >
        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--white)' }}>
          Limite légale importante
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          L'ANGB n'est <strong style={{ color: 'var(--white)' }}>pas un agent sportif</strong> et
          ne peut pas se substituer à un agent certifié pour la négociation de contrats professionnels.
          Toute prestation de représentation rémunérée nécessite la licence d'agent sportif délivrée
          par la FFHG. L'ANGB oriente uniquement vers des professionnels certifiés.
        </p>
      </div>

      {/* Services */}
      <div className="grid gap-4 sm:grid-cols-3">
        {services.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="p-5 rounded-2xl border"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
          >
            <span className="text-3xl mb-3 block">{icon}</span>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--white)' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
          </div>
        ))}
      </div>

      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--gray)' }}>
          Pour toute demande d'accompagnement, contactez-nous à{' '}
          <a href="mailto:contact@angb.fr" className="underline" style={{ color: 'var(--accent)' }}>
            contact@angb.fr
          </a>
          {' '}— le bureau répondra dans les 48h ouvrées.
        </p>
      </div>
    </div>
  )
}
