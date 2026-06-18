import Link from 'next/link'

export default function RessourcesSection() {
  const docs = [
    { icon: '🩺', title: 'Protocoles médicaux', desc: 'Gestion des commotions cérébrales et suivi médical du gardien, documents officiels FFHG.' },
    { icon: '📋', title: 'Règlements sportifs', desc: 'Règlement des activités sportives et règlement disciplinaire général de la FFHG.' },
    { icon: '⚖️', title: 'Charte éthique', desc: 'Charte éthique et de déontologie de la fédération, applicable à tous les licenciés.' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
          Ressources officielles
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
          L&apos;ANGB centralise les textes réglementaires, protocoles médicaux et guides officiels
          de la FFHG utiles aux gardiens et à leur staff. À connaître et à garder accessibles en déplacement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {docs.map(({ icon, title, desc }) => (
          <div key={title} className="p-5 rounded-2xl border" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
            <span className="text-3xl mb-3 block">{icon}</span>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--white)' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--gray)' }}>
          Tous les documents officiels FFHG sont rassemblés sur une page dédiée.
        </p>
        <Link href="/ressources"
          className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.08em] text-white text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{ background: 'var(--accent)' }}>
          Ouvrir les ressources →
        </Link>
      </div>
    </div>
  )
}
