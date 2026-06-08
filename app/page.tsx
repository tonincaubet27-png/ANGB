import Link from 'next/link'

const STATS = [
  { value: '5', label: 'Divisions couvertes', sub: 'Magnus → Féminine Élite' },
  { value: '1 200+', label: 'Gardiens en France', sub: 'Tous niveaux confondus' },
  { value: '3', label: 'Workstreams FFHG', sub: 'Commissions actives' },
  { value: '2026', label: 'Année de fondation', sub: 'Association loi 1901' },
]

const FEATURES = [
  {
    href: '/association',
    icon: '🏒',
    title: "L'association",
    desc: 'Mission, équipe, axes stratégiques et fonctionnement.',
  },
  {
    href: '/association',
    icon: '🎓',
    title: 'Formation',
    desc: "DE gardien, label Club Formateur, réseau d'entraîneurs.",
  },
  {
    href: '/association',
    icon: '🩺',
    title: 'Santé',
    desc: 'Risques spécifiques du poste, protocoles et prévention.',
  },
  {
    href: '/equipement',
    icon: '🛡️',
    title: 'Bourse équipement',
    desc: 'Vente et achat de matériel de gardien entre pairs.',
  },
  {
    href: '/forum',
    icon: '💬',
    title: 'Forum',
    desc: 'Échanges entre gardiens, entraîneurs et structures.',
  },
  {
    href: '/annuaire',
    icon: '📋',
    title: 'Annuaire',
    desc: 'Répertoire des gardiens actifs en France par division.',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,127,255,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{
              background: 'rgba(74,127,255,0.1)',
              borderColor: 'rgba(74,127,255,0.3)',
              color: 'var(--accent)',
            }}
          >
            <span>🇫🇷</span>
            <span>Association Loi 1901 · Fondée en 2026</span>
          </div>

          <h1
            className="text-6xl md:text-8xl lg:text-9xl leading-none mb-6"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.02em' }}
          >
            La voix des
            <br />
            <span style={{ color: 'var(--accent)' }}>gardiens</span> français
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg mb-10" style={{ color: 'var(--gray)' }}>
            L'ANGB structure, développe et protège la pratique du poste de gardien de but
            en France — de la formation à la carrière professionnelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/association"
              className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              Découvrir l'ANGB
            </Link>
            <Link
              href="/annuaire"
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all border hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--white)' }}
            >
              Annuaire des gardiens
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, sub }) => (
              <div
                key={label}
                className="p-6 rounded-2xl text-center border"
                style={{
                  background: 'var(--navy-mid)',
                  borderColor: 'var(--border)',
                }}
              >
                <p
                  className="text-4xl md:text-5xl mb-1"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.02em' }}
                >
                  {value}
                </p>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--white)' }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: 'var(--gray)' }}>
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2
            className="text-3xl md:text-5xl text-center mb-4"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
          >
            Ce que fait l'ANGB
          </h2>
          <p className="text-center text-sm mb-12" style={{ color: 'var(--gray)' }}>
            Six piliers pour structurer la communauté des gardiens français
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ href, icon, title, desc }) => (
              <Link
                key={title}
                href={href}
                className="group p-6 rounded-2xl border transition-all hover:border-accent/40"
                style={{
                  background: 'var(--navy-mid)',
                  borderColor: 'var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: 'var(--navy-light)' }}
                >
                  {icon}
                </div>
                <h3
                  className="text-xl mb-2 group-hover:text-accent transition-colors"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
                  {desc}
                </p>
                <div
                  className="mt-4 text-xs font-medium flex items-center gap-1 transition-colors group-hover:text-accent"
                  style={{ color: 'var(--gray)' }}
                >
                  En savoir plus →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(74,127,255,0.2) 0%, rgba(237,41,57,0.1) 100%)',
              border: '1px solid rgba(74,127,255,0.2)',
            }}
          >
            <h2
              className="text-4xl md:text-6xl mb-4"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
            >
              Rejoins la communauté
            </h2>
            <p className="max-w-lg mx-auto text-sm mb-8" style={{ color: 'var(--gray)' }}>
              Que tu sois gardien actif, ancien gardien, entraîneur ou structure,
              l'ANGB est ton association. Adhésion à partir de 0€.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/association"
                className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >
                Rejoindre l'ANGB
              </Link>
              <Link
                href="/forum"
                className="px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--white)' }}
              >
                Accéder au forum
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
