import Link from 'next/link'

const STATS = [
  { value: '5',      label: 'Divisions couvertes', sub: 'Magnus → Féminine Élite' },
  { value: '1 200+', label: 'Gardiens en France',  sub: 'Tous niveaux confondus' },
  { value: '3',      label: 'Workstreams FFHG',    sub: 'Commissions actives' },
  { value: '2026',   label: 'Année de fondation',  sub: 'Association loi 1901' },
]

const FEATURES = [
  { href: '/association', icon: '🏒', title: "L'association",    desc: 'Mission, équipe, axes stratégiques et fonctionnement de l\'ANGB.' },
  { href: '/association', icon: '🎓', title: 'Formation',        desc: "Diplôme d'État gardien, label Club Formateur, réseau d'entraîneurs." },
  { href: '/association', icon: '🩺', title: 'Santé',            desc: '67% jouent blessés. Protocoles de prévention et suivi médical.' },
  { href: '/equipement',  icon: '🛡️', title: 'Bourse équipement', desc: 'Achat et vente de matériel entre membres de la communauté.' },
  { href: '/forum',       icon: '💬', title: 'Forum',            desc: 'Échanges entre gardiens, entraîneurs et structures de tous niveaux.' },
  { href: '/annuaire',    icon: '📋', title: 'Annuaire',         desc: 'Répertoire des gardiens actifs en France par division et région.' },
]

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Fond radial bleu */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(74,127,255,0.14) 0%, transparent 70%)',
        }} />
        {/* Ligne décorative gauche */}
        <div className="absolute left-0 top-0 bottom-0 w-px opacity-20" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.8), transparent)',
        }} />
        {/* Ligne décorative droite */}
        <div className="absolute right-0 top-0 bottom-0 w-px opacity-20" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(237,41,57,0.6), transparent)',
        }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{ background: 'rgba(74,127,255,0.1)', borderColor: 'rgba(74,127,255,0.3)', color: 'var(--accent)' }}>
            <span>🇫🇷</span>
            <span>Association Loi 1901 · Fondée en 2026</span>
          </div>

          {/* Titre */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-none mb-6"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.02em' }}>
            La voix des
            <br />
            <span style={{ color: 'var(--accent)' }}>gardiens</span>{' '}
            <span style={{ color: 'var(--white)' }}>français</span>
          </h1>

          {/* Accroche */}
          <p className="max-w-2xl mx-auto text-base md:text-lg mb-10 leading-relaxed" style={{ color: 'var(--gray)' }}>
            L'ANGB structure, développe et protège la pratique du poste de gardien de but
            en France — de la formation à la carrière professionnelle.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/association"
              className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(74,127,255,0.3)' }}>
              Découvrir l'ANGB
            </Link>
            <Link href="/annuaire"
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all border hover:bg-white/5 hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--white)' }}>
              Annuaire des gardiens
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center gap-1 opacity-40">
              <div className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
                style={{ borderColor: 'var(--gray)' }}>
                <div className="w-1 h-2 rounded-full animate-bounce" style={{ background: 'var(--gray)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="p-6 rounded-2xl text-center border transition-colors hover:border-accent/30"
                style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                <p className="text-4xl md:text-5xl mb-1"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.02em' }}>
                  {value}
                </p>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--white)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl text-center mb-3"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Ce que fait l'ANGB
          </h2>
          <p className="text-center text-sm mb-12" style={{ color: 'var(--gray)' }}>
            Six piliers pour structurer la communauté des gardiens français
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ href, icon, title, desc }) => (
              <Link key={title} href={href}
                className="group p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/30"
                style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'var(--navy-light)' }}>
                  {icon}
                </div>
                <h3 className="text-xl mb-2 transition-colors group-hover:text-blue-400"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--gray)' }}>{desc}</p>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  En savoir plus →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16"
            style={{
              background: 'linear-gradient(135deg, rgba(74,127,255,0.18) 0%, rgba(10,14,26,0) 50%, rgba(237,41,57,0.1) 100%)',
              border: '1px solid rgba(74,127,255,0.2)',
            }}>
            {/* Décoration fond */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-5 pointer-events-none"
              style={{ background: 'var(--accent)' }} />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-5 pointer-events-none"
              style={{ background: 'var(--red-fr)' }} />

            <div className="relative text-center">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
                Adhésion ouverte
              </p>
              <h2 className="text-4xl md:text-6xl mb-4"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                Rejoins la communauté
              </h2>
              <p className="max-w-lg mx-auto text-sm mb-8" style={{ color: 'var(--gray)' }}>
                Gardien actif, ancien gardien, entraîneur ou structure — l'ANGB est ton association.
                Cotisation à partir de 0€ pour les mineurs, étudiants et membres du bureau.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/association"
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.25)' }}>
                  Rejoindre l'ANGB
                </Link>
                <Link href="/forum"
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--white)' }}>
                  Accéder au forum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
