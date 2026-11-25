'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useAuth } from '@/contexts/AuthContext'
import { useContent } from '@/contexts/ContentContext'
import { CometCard } from '@/components/ui/comet-card'
import { Magnetic } from '@/components/ui/motion-kit'

// Page courte et positive : l'essentiel visible sans défiler longtemps.
// Aucune promesse de projet ni chiffre non vérifiable.

const VALEURS = [
  { icon: '🌱', titre: 'Progresser', texte: 'Des repères simples pour apprendre le poste, saison après saison.', href: '/savoir', lien: 'Les savoirs', couleur: '#5b8dff' },
  { icon: '💪', titre: 'Être bien', texte: 'Prendre soin de son corps et de sa tête, avec des infos sourcées.', href: '/savoir?rubrique=Santé', lien: 'Santé', couleur: '#ED2939' },
  { icon: '🔥', titre: 'Se faire plaisir', texte: 'Garder l’envie de revenir dans le but, match après match.', href: '/forum', lien: 'Le forum', couleur: '#fbbf24' },
  { icon: '🤝', titre: 'S’entraider', texte: 'Des anciens qui conseillent les jeunes, gratuitement.', href: '#entraide', lien: 'L’entraide', couleur: '#34d399' },
]

const OUTILS = [
  { icon: '📚', titre: 'Savoirs du gardien', texte: 'Le poste, l’équipement, la santé.', href: '/savoir' },
  { icon: '🛡️', titre: 'Bourse d’équipement', texte: 'Entre familles, sans commission.', href: '/equipement' },
  { icon: '💬', titre: 'Forum', texte: 'Échanger entre gardiens et parents.', href: '/forum' },
  { icon: '🏟️', titre: 'Stages', texte: 'Des événements non lucratifs.', href: '/stages' },
]

const FAITS = [
  { v: '2026', l: 'Fondée' },
  { v: 'Loi 1901', l: 'Non lucrative' },
  { v: 'Gratuit', l: '1re année' },
  { v: 'Sans', l: 'commission' },
]

const appear = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
}

export default function AssociationPage() {
  const { openAdhesion } = useAdhesion()
  const { user } = useAuth()
  const c = useContent()

  return (
    <div>
      {/* ── En-tête : le message ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'url(/images/fabrice-lhenry.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 22%',
          opacity: 0.22, maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
        }} />
        <motion.div className="absolute -top-24 right-[6%] w-96 h-96 rounded-full pointer-events-none hidden md:block"
          style={{ background: 'radial-gradient(circle, rgba(91,141,255,0.3) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          <span className="overline-fr mb-4 inline-block">{c('assoc.header.overline')}</span>
          <h1 className="text-5xl md:text-8xl" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.03em', lineHeight: 0.95 }}>
            <motion.span className="block" style={{ color: '#7aa2ff' }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>Faire grandir</motion.span>
            <motion.span className="block" style={{ color: 'var(--white)' }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>les gardiens,</motion.span>
            <motion.span className="block" style={{ color: '#ff5a67' }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>avec le sourire.</motion.span>
          </h1>
          <motion.p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed" style={{ color: 'var(--gray)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            L&apos;ANGB a été créée en 2026 par des gardiens, pour les gardiens et leurs familles. Progresser, être bien,
            prendre du plaisir : tout ce qui aide un gardien, surtout un jeune, au même endroit.
          </motion.p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {!user && (
              <Magnetic><button onClick={openAdhesion} className="btn-sport px-7 py-3.5 text-sm">Rejoindre l&apos;ANGB</button></Magnetic>
            )}
            <Magnetic><Link href="/savoir" className="btn-sport-ghost px-7 py-3.5 text-sm">Découvrir les savoirs</Link></Magnetic>
          </div>

          {/* Faits courts */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
            {FAITS.map((f, i) => (
              <motion.div key={f.l} custom={i} variants={appear} initial="hidden" animate="show"
                className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <p className="text-2xl md:text-3xl leading-none" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.03em' }}>{f.v}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--gray)' }}>{f.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-14 space-y-16">
        {/* ── Nos 4 envies ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-3xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Ce qui nous anime
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((v, i) => (
              <motion.div key={v.titre} custom={i} variants={appear} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
                <CometCard rotateDepth={8} translateDepth={6} className="h-full">
                  <Link href={v.href} className="group block h-full rounded-2xl p-5 relative overflow-hidden"
                    style={{ background: 'var(--navy-card)', border: '1px solid var(--border)' }}>
                    <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: v.couleur }} />
                    <span className="text-3xl inline-block transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{v.icon}</span>
                    <h3 className="mt-3 text-2xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>{v.titre}</h3>
                    <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--gray)' }}>{v.texte}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-4 transition-transform group-hover:translate-x-1" style={{ color: v.couleur }}>{v.lien} →</p>
                  </Link>
                </CometCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Ce que tu trouves ici ───────────────────────────────────── */}
        <section>
          <h2 className="text-3xl md:text-5xl mb-6" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Ce que tu trouves ici
          </h2>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {OUTILS.map((o, i) => (
              <motion.div key={o.titre} custom={i} variants={appear} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
                <Link href={o.href} className="group flex items-center gap-3 rounded-2xl p-4 h-full transition-all duration-200 hover:-translate-y-1"
                  style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors group-hover:bg-[rgba(91,141,255,0.25)]"
                    style={{ background: 'rgba(91,141,255,0.12)' }}>{o.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold" style={{ color: 'var(--white)' }}>{o.titre}</span>
                    <span className="block text-xs" style={{ color: 'var(--gray)' }}>{o.texte}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Entraide ─────────────────────────────────────────────────── */}
        <section id="entraide" className="scroll-mt-24 rounded-3xl p-6 md:p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(91,141,255,0.16), rgba(237,41,57,0.1))', border: '1px solid var(--border-mid)' }}>
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-center">
            <div>
              <h2 className="text-3xl md:text-5xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                Les anciens aident les jeunes
              </h2>
              <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: 'var(--gray)' }}>
                Un ancien gardien connaît les doutes d&apos;un jeune. Ceux qui le veulent donnent un coup de main, gratuitement,
                à ceux qui le demandent : parcours, études, vie de gardien.
              </p>
              <a href={`mailto:${c('contact.email')}`} className="btn-sport-ghost mt-5 px-6 py-3 text-xs">Proposer ou demander de l&apos;aide</a>
            </div>
            <p className="text-xs leading-relaxed rounded-2xl p-4" style={{ background: 'rgba(15,27,51,0.6)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--white)' }}>L&apos;ANGB n&apos;est pas un agent sportif.</strong> Pas de contrat, pas de représentation,
              pas de mise en relation avec des clubs, aucune rémunération. Pour un contrat, adresse-toi à un professionnel qualifié.
            </p>
          </div>
        </section>

        {/* ── Infos pratiques ─────────────────────────────────────────── */}
        <section className="flex flex-wrap gap-3 text-sm">
          <Link href="/reglement" className="btn-sport-ghost px-5 py-2.5 text-xs">📜 Statuts et règlement</Link>
          <Link href="/ressources" className="btn-sport-ghost px-5 py-2.5 text-xs">📚 Ressources officielles</Link>
          <a href={`mailto:${c('contact.email')}`} className="btn-sport-ghost px-5 py-2.5 text-xs">✉️ {c('contact.email')}</a>
        </section>

        {/* ── Appel final ──────────────────────────────────────────────── */}
        {!user && (
          <section className="rounded-3xl p-8 md:p-12 text-center" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <h3 className="text-3xl md:text-5xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              {c('assoc.cta.title')}
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--gray)' }}>{c('assoc.cta.sub')}</p>
            <button onClick={openAdhesion} className="btn-sport px-8 py-3.5 text-sm">Rejoindre l&apos;ANGB</button>
          </section>
        )}
      </div>
    </div>
  )
}
