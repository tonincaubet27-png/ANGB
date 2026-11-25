export default function ConseilSection() {
  const services = [
    {
      icon: '🤝',
      title: 'Des anciens qui conseillent',
      desc: "Des anciens gardiens, volontaires, partagent gratuitement leur expérience avec les jeunes qui le souhaitent : parcours, vie de gardien, choix à faire.",
    },
    {
      icon: '🎓',
      title: 'Études et sport',
      desc: "Un sujet d'échange entre membres : concilier études et sport, préparer la suite de sa carrière.",
    },
    {
      icon: '🚫',
      title: 'Ce que nous ne faisons pas',
      desc: "Pas de contrat, pas de représentation, pas de mise en relation avec des clubs, aucune rémunération. Seulement de l'entraide.",
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Entraide entre anciens et jeunes
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
          Un ancien gardien connaît les doutes d'un jeune gardien. À l'ANGB, ceux qui le veulent peuvent
          donc donner un coup de main, gratuitement, à ceux qui le demandent.
        </p>
      </div>

      <div
        className="p-5 rounded-xl border-l-4"
        style={{ background: 'rgba(237,41,57,0.09)', borderColor: 'var(--red-fr)' }}
      >
        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--white)' }}>
          L'ANGB n'est pas un agent sportif
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          L'association ne négocie aucun contrat, ne représente aucun joueur et ne reçoit aucune
          rémunération. Elle n'intervient pas entre un gardien et un club. Pour un contrat, adressez-vous
          à un professionnel qualifié. Les règles exactes sont à vérifier auprès du ministère des Sports
          ou de la FFHG.
        </p>
      </div>

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
          Ancien gardien et envie de conseiller un jeune, ou jeune gardien qui cherche un avis ? Écrivez-nous à{' '}
          <a href="mailto:angbcontact@gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
            angbcontact@gmail.com
          </a>.
        </p>
      </div>
    </div>
  )
}
