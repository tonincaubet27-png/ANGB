import Link from 'next/link'

// Cette page ne reprend que ce que la recherche permet d'affirmer. Chaque sujet renvoie à un article sourcé (/savoir).
export default function SanteSection() {
  const stats = [
    { value: '69 %', label: 'ont eu un problème de hanche ou d’aine', sub: 'au cours d’une saison, parmi 101 gardiens d’élite suivis en Suède' },
    { value: '36 %', label: 'un problème « substantiel »', sub: 'même étude' },
    { value: '83 %', label: 'des problèmes venaient de l’usure', sub: 'même étude (83,1 %), pas d’un choc isolé' },
  ]

  const sujets = [
    {
      icon: '🦴',
      title: 'Hanches et aine',
      desc: 'Ce que montre une étude sur des gardiens d’élite, ses limites, et pourquoi une douleur qui revient ne s’ignore pas.',
    },
    {
      icon: '🧠',
      title: 'Commotion',
      desc: 'Les outils publiés en 2023 par des experts internationaux pour reconnaître une commotion, et le réflexe à avoir dans le doute.',
    },
    {
      icon: '😴',
      title: 'Sommeil et récupération',
      desc: 'Ce que disent les experts sur le sommeil des sportifs, et ce qu’on ne sait pas encore pour les enfants.',
    },
    {
      icon: '🏃',
      title: 'Échauffement et prévention',
      desc: 'Une grande revue d’études sur les programmes de prévention des blessures chez les jeunes sportifs.',
    },
  ]

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Santé et prévention
        </h2>
        <p className="text-sm mb-8 max-w-2xl leading-relaxed" style={{ color: 'var(--gray)' }}>
          Nous ne donnons ici que ce que la recherche permet d’affirmer. Chaque sujet renvoie à un article
          avec ses sources, ses limites et ce qu’on ne sait pas encore.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ value, label, sub }) => (
            <div key={label} className="p-6 rounded-2xl text-center border" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
              <p className="text-5xl mb-1" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--red-fr)', letterSpacing: '0.02em' }}>{value}</p>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--white)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--gray)' }}>
          Source : Wörner et coll., Orthopaedic Journal of Sports Medicine, 2019. Étude sur des gardiens d’élite suédois :
          elle ne dit rien de précis sur les enfants.
        </p>
      </div>

      <div>
        <h3 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Nos articles santé
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sujets.map(({ icon, title, desc }) => (
            <Link key={title} href="/savoir?rubrique=Santé"
              className="p-5 rounded-2xl border transition-colors hover:bg-white/5 block"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <h4 className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{title}</h4>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
            </Link>
          ))}
        </div>
        <p className="text-xs mt-6 leading-relaxed rounded-xl p-4" style={{ color: 'var(--gray)', background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
          ⚕️ Ces informations sont générales et ne remplacent pas l’avis d’un médecin ou d’un kinésithérapeute.
        </p>
      </div>
    </div>
  )
}
