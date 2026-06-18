export default function EquipeSection() {
  const bureau = [
    {
      initials: 'TC',
      name: 'Tonin Caubet',
      role: 'Président fondateur',
      desc: 'Gardien professionnel · Ex-Rouen Dragons · 2× Champion Ligue Magnus',
      color: 'var(--accent)',
    },
    {
      initials: 'JM',
      name: 'Julien Martin',
      role: 'Vice-président',
      desc: 'Gardien professionnel · Rouen Dragons · Expérience internationale clubs',
      color: '#34d399',
    },
    {
      initials: 'SR',
      name: 'Sophie Renard',
      role: 'Secrétaire générale',
      desc: 'Internationale · Capitaine EDF féminine jeunes · Paris Valkyries',
      color: '#c084fc',
    },
    {
      initials: 'AB',
      name: 'Alexandre Bonnard',
      role: 'Trésorier',
      desc: 'Titulaire Bordeaux Boxers · D1 · Formation Bordeaux',
      color: '#fb923c',
    },
  ]

  const referents = [
    { initials: 'ML', name: 'Mathis Laurent',   region: 'Normandie',    division: 'D1' },
    { initials: 'HC', name: 'Hugo Chauveau',    region: 'Rhône-Alpes',  division: 'D2' },
    { initials: 'TD', name: 'Thomas Dumont',    region: 'Île-de-France', division: 'D1' },
    { initials: 'PR', name: 'Pierre Renault',   region: 'Bretagne',     division: 'D3' },
  ]

  const commissions = [
    { title: 'Commission Formation', desc: "DE gardien, Label Club Formateur, ressources pédagogiques" },
    { title: 'Commission Santé', desc: "Protocoles, partenaires médicaux, protocole commotion" },
    { title: 'Commission Vivier', desc: "JFL, passerelles divisions, hockey féminin" },
    { title: 'Commission Stats', desc: "Outils d'analyse, cartographie, métriques ajustées" },
  ]

  return (
    <div className="space-y-12">
      {/* Bureau */}
      <div>
        <h2
          className="text-4xl md:text-5xl mb-6"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Bureau fondateur
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bureau.map(({ initials, name, role, desc, color }) => (
            <div
              key={name}
              className="flex gap-4 p-5 rounded-2xl border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                style={{ background: `${color}20`, color }}
              >
                {initials}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{name}</p>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color }}
                >
                  {role}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Référents régionaux */}
      <div>
        <h3
          className="text-2xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Référents régionaux
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {referents.map(({ initials, name, region, division }) => (
            <div
              key={name}
              className="p-4 rounded-xl border text-center"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
                style={{ background: 'var(--navy-light)', color: 'var(--gray)' }}
              >
                {initials}
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--white)' }}>{name}</p>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>{region}</p>
              <span
                className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(74,127,255,0.15)', color: 'var(--accent)' }}
              >
                {division}
              </span>
            </div>
          ))}
          <div
            className="p-4 rounded-xl border border-dashed text-center flex items-center justify-center col-span-2 sm:col-span-4"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <p className="text-xs" style={{ color: 'var(--gray)' }}>
              Postes ouverts dans toutes les régions · <a href="mailto:angbcontact@gmail.com" style={{ color: 'var(--accent)' }}>angbcontact@gmail.com</a>
            </p>
          </div>
        </div>
      </div>

      {/* Commissions */}
      <div>
        <h3
          className="text-2xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Commissions
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {commissions.map(({ title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-xl border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--white)' }}>{title}</p>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
