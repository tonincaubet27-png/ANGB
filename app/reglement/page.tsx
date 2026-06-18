import Link from 'next/link'
import { StatutsContent, ReglementContent } from '@/components/legal/reglement'

export const metadata = {
  title: 'Statuts & règlement intérieur · ANGB',
  description: "Statuts et règlement intérieur de l'Association Nationale des Gardiens de But : bienveillance, conduite en ligne, RGPD, sanctions.",
}

export default function ReglementPage() {
  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="py-14" style={{ background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Cadre & valeurs</span>
          <h1 className="text-4xl md:text-6xl mt-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Statuts & règlement intérieur
          </h1>
          <p className="mt-3 text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
            L&apos;ANGB, c&apos;est de l&apos;entraide entre gardiens dans le respect et la bienveillance. Ces textes encadrent
            la vie de l&apos;association et les espaces communautaires (forum, annuaire, messagerie, équipement).
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* Charte de bienveillance (résumé) */}
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#34d399' }}>🤝 Charte de bienveillance</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
            Respect, fair-play et entraide entre gardiens. <strong style={{ color: 'var(--white)' }}>Insultes, agressivité,
            harcèlement, discrimination et dénigrement sont interdits</strong> et peuvent entraîner un avertissement,
            la suppression de contenu, une suspension, voire la <strong style={{ color: 'var(--white)' }}>radiation et la
            suppression de l&apos;adhésion</strong> (règlement intérieur, art. 2, 7 et 8).
          </p>
        </div>

        {/* Statuts */}
        <section className="p-6 md:p-8 rounded-2xl" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl mb-5" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Statuts de l&apos;ANGB
          </h2>
          <StatutsContent />
        </section>

        {/* Règlement intérieur */}
        <section className="p-6 md:p-8 rounded-2xl" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl mb-5" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Règlement intérieur
          </h2>
          <ReglementContent />
        </section>

        <p className="text-center text-xs" style={{ color: 'var(--gray)' }}>
          Questions ? <a href="mailto:angbcontact@gmail.com" style={{ color: 'var(--accent)' }}>angbcontact@gmail.com</a>
          {' · '}
          <Link href="/politique-confidentialite" style={{ color: 'var(--accent)' }}>Politique de confidentialité</Link>
        </p>
      </div>
    </main>
  )
}
