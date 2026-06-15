'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card'
import { HoverEffect } from '@/components/ui/card-hover-effect'
import type { HoverItem } from '@/components/ui/card-hover-effect'
import { Spotlight } from '@/components/ui/spotlight'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useAuth } from '@/contexts/AuthContext'

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHead({
  overline, title, sub, center = true,
}: { overline: string; title: string; sub?: string; center?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className={`mb-10 ${center ? 'text-center' : ''}`}
    >
      <span className="overline-fr mb-3 inline-block">{overline}</span>
      <h2 className="text-4xl md:text-6xl mt-2"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
        {title}
      </h2>
      {sub && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--gray)', maxWidth: 540, margin: '12px auto 0' }}>
          {sub}
        </p>
      )}
    </motion.div>
  )
}

function StatCard({ value, label, sub, delay = 0, color = 'blue' }: {
  value: string; label: string; sub: string; delay?: number; color?: 'blue' | 'red' | 'white'
}) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  const topColor = { blue: '#002395', red: '#ED2939', white: 'rgba(255,255,255,0.3)' }[color]
  const valColor = { blue: '#4a7fff', red: '#ED2939', white: 'var(--white)' }[color]

  useEffect(() => {
    if (!inView) return
    const match = value.match(/\d+/)
    if (!match) { setDisplay(value); return }
    const num    = parseInt(match[0])
    const before = value.slice(0, value.indexOf(match[0]))
    const after  = value.slice(value.indexOf(match[0]) + match[0].length)
    let frame    = 0
    const total  = 80
    const timer  = setInterval(() => {
      frame++
      const eased = 1 - Math.pow(1 - frame / total, 3)
      setDisplay(before + Math.round(eased * num) + after)
      if (frame >= total) { setDisplay(value); clearInterval(timer) }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl text-center cursor-default relative overflow-hidden"
      style={{
        background: 'var(--navy-card)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${topColor}`,
      }}
    >
      <p className="text-5xl mb-1"
        style={{ fontFamily: 'var(--font-bebas)', color: valColor, letterSpacing: '0.02em' }}>
        {display}
      </p>
      <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--white)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
    </motion.div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '5',     label: 'Divisions couvertes', sub: 'Magnus → Féminine Élite', color: 'blue'  as const },
  { value: '1200+', label: 'Gardiens en France',  sub: 'Tous niveaux confondus',  color: 'white' as const },
  { value: '3',     label: 'Workstreams FFHG',    sub: 'Commissions actives',     color: 'blue'  as const },
  { value: '2026',  label: 'Année de fondation',  sub: 'Association loi 1901',    color: 'red'   as const },
]

const FEATURES: HoverItem[] = [
  { link: '/association', icon: '🏒', title: "L'association",     description: "Mission, équipe, axes stratégiques et fonctionnement de l'ANGB.", accent: '#002395' },
  { link: '/association', icon: '🎓', title: 'Formation',         description: "Diplôme d'État gardien, label Club Formateur, réseau d'entraîneurs.", accent: '#ED2939' },
  { link: '/association', icon: '🩺', title: 'Santé',             description: '67% jouent blessés. Protocoles de prévention et suivi médical.', accent: '#002395' },
  { link: '/equipement',  icon: '🛡️', title: 'Bourse équipement', description: 'Achat et vente de matériel entre membres de la communauté.', accent: '#ED2939' },
  { link: '/forum',       icon: '💬', title: 'Forum',             description: 'Échanges entre gardiens, entraîneurs et structures de tous niveaux.', accent: '#002395' },
  { link: '/annuaire',    icon: '📋', title: 'Annuaire',          description: 'Répertoire des gardiens actifs en France par division et région.', accent: '#ED2939' },
]

const GALLERY = [
  {
    src: '/images/cristobal-huet-cup.jpg',
    name: 'Cristobal Huet',
    title: '1ᵉʳ gardien français drafté en NHL',
    badge: '🏆 Stanley Cup 2010',
  },
  {
    src: '/images/antoine keller.jpg',
    name: 'Antoine Keller',
    title: '2ᵉ gardien français drafté en NHL',
    badge: '⭐ NHL',
  },
]

const FOUNDERS = [
  { src: '/images/tonin caubet.jpg',       name: 'Tonin Caubet' },
  { src: '/images/pacôme courtoison.jpeg', name: 'Pacôme Courtoison' },
  { src: '/images/steven catelin.png',     name: 'Steven Catelin' },
  { src: '/images/flo gourdin.jpg',        name: 'Flo Gourdin' },
  { src: '/images/jean jp fontaine.jpg',   name: 'Jean-JP Fontaine' },
  { src: '/images/adrien vazzaz.jpg',      name: 'Adrien Vazzaz' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { openAdhesion } = useAdhesion()
  const { user } = useAuth()
  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">

        {/* Photo Huet (Bercy) en fondu très discret, derrière les dégradés */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'url(/images/huet-bercy.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          opacity: 0.13,
          filter: 'grayscale(55%)',
        }} />

        {/* Gradient bleu France */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 100% 70% at 50% -15%, rgba(0,35,149,0.18) 0%, transparent 70%)',
              'radial-gradient(ellipse 100% 70% at 50% -8%,  rgba(0,35,149,0.26) 0%, transparent 70%)',
              'radial-gradient(ellipse 100% 70% at 50% -15%, rgba(0,35,149,0.18) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grille décorative */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Orbe bleu */}
        <motion.div
          className="absolute right-[8%] top-[20%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,35,149,0.14) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Orbe rouge */}
        <motion.div
          className="absolute left-[5%] bottom-[20%] w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(237,41,57,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* Lignes latérales */}
        <div className="absolute left-0 top-0 bottom-0 w-px opacity-25"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,35,149,0.9), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-px opacity-20"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(237,41,57,0.7), transparent)' }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-20 text-center">

          {/* Badge officiel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] mb-10 border"
            style={{ background: 'rgba(0,35,149,0.12)', borderColor: 'rgba(0,35,149,0.35)', color: 'rgba(150,180,255,0.9)' }}
          >
            <span>🇫🇷</span>
            <span>Association Loi 1901 · Fondée en 2026</span>
          </motion.div>

          {/* Titre */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-none mb-6"
            style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}>
            {['La', 'voix', 'des'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 80, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                style={{ color: 'var(--white)', display: 'inline-block', marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 80, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.51, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ color: '#4a7fff', display: 'inline-block', marginRight: '0.25em' }}
            >
              gardiens
            </motion.span>
            {' '}
            <motion.span
              initial={{ opacity: 0, y: 80, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.63, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ color: 'var(--white)', display: 'inline-block' }}
            >
              français
            </motion.span>
          </h1>

          {/* Ligne tricolore pleine largeur sous le titre */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.0, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="origin-left mb-8 -mt-2"
            style={{ height: 4, background: 'linear-gradient(to right, #002395 0%, #002395 33%, #ffffff 33%, #ffffff 66%, #ED2939 66%, #ED2939 100%)', borderRadius: 2 }}
          />

          {/* Accroche */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="max-w-2xl mx-auto text-base md:text-lg mb-10 leading-relaxed"
            style={{ color: 'var(--gray)' }}
          >
            L&apos;ANGB structure, développe et protège la pratique du poste de gardien de but
            en France — de la formation à la carrière professionnelle.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/association"
              className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(74,127,255,0.35)' }}>
              Découvrir l&apos;ANGB
            </Link>
            <Link href="/annuaire"
              className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-all border hover:bg-white/5 hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'var(--white)' }}>
              Annuaire des gardiens →
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="mt-16 flex justify-center"
          >
            <div className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
              style={{ borderColor: 'var(--gray)' }}>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-2 rounded-full"
                style={{ background: 'var(--gray)' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHead
            overline="L'ANGB en chiffres"
            title="Un mouvement national"
            sub="Fédérer et représenter l'ensemble des gardiens de but du hockey français."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, sub, color }, i) => (
              <StatCard key={label} value={value} label={label} sub={sub} delay={i * 0.1} color={color} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Galerie ─────────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHead
            overline="Légendes françaises"
            title="Les gardiens en action"
            sub="De la D3 au Magnus, jusqu'à la NHL — la communauté des gardiens français."
          />

          <div className="grid grid-cols-2 gap-4">
            {GALLERY.map(({ src, name, title, badge }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <CardContainer containerClassName="w-full">
                  <CardBody
                    className="relative overflow-hidden rounded-2xl"
                    style={{ height: 500, background: 'var(--navy-light)' }}>

                    {/* Photo flottante */}
                    <CardItem translateZ={0} className="absolute inset-0">
                      <Image src={src} alt={name} fill className="object-cover" sizes="50vw" />
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
                    </CardItem>

                    {/* Barre tricolore */}
                    <CardItem translateZ={20} className="absolute top-0 left-0 right-0 h-[3px] flex">
                      <div className="flex-1" style={{ background: '#002395' }} />
                      <div className="flex-1" style={{ background: '#fff' }} />
                      <div className="flex-1" style={{ background: '#ED2939' }} />
                    </CardItem>

                    {/* Badge */}
                    <CardItem translateZ={60} className="absolute top-4 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,35,149,0.9)', color: 'white', backdropFilter: 'blur(4px)' }}>
                        {badge}
                      </span>
                    </CardItem>

                    {/* Nom flottant */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <CardItem translateZ={80}>
                        <p className="font-bold text-3xl md:text-4xl"
                          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.05em', lineHeight: 1 }}>
                          {name}
                        </p>
                      </CardItem>
                      <CardItem translateZ={40} className="mt-1">
                        <p className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {title}
                        </p>
                      </CardItem>
                    </div>
                  </CardBody>
                </CardContainer>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fondateurs ──────────────────────────────────────────────── */}
      <section className="py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHead
            overline="Équipe fondatrice"
            title="Les créateurs de l'ANGB"
          />
          <div className="flex flex-wrap justify-center gap-8">
            {FOUNDERS.map(({ src, name }, i) => (
              <motion.div
                key={name}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden"
                  style={{ border: '2px solid rgba(0,35,149,0.5)', background: 'var(--navy-light)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }}>
                  <Image src={src} alt={name} fill className="object-cover object-top" sizes="80px" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-center" style={{ color: 'var(--white)' }}>
                  {name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features 3D ─────────────────────────────────────────────── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHead
            overline="Nos piliers"
            title="Ce que fait l'ANGB"
            sub="Six axes pour structurer, protéger et développer la communauté des gardiens français."
          />

          <HoverEffect items={FEATURES} />
        </div>
      </section>

      {/* ── CTA Banner — masqué pour les membres déjà connectés ──────── */}
      {!user && (
      <section className="py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center antialiased"
            style={{
              background: 'rgba(7,11,21,0.97)',
              border: '1px solid rgba(0,35,149,0.25)',
            }}
          >
            {/* Grille décorative (fond) */}
            <div
              className="pointer-events-none absolute inset-0 select-none"
              style={{
                backgroundImage: [
                  'linear-gradient(to right, rgba(0,35,149,0.07) 1px, transparent 1px)',
                  'linear-gradient(to bottom, rgba(0,35,149,0.07) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: '40px 40px',
              }}
            />

            {/* Spotlight bleu France */}
            <Spotlight
              className="-top-40 left-0 md:-top-20 md:left-60"
              fill="#002395"
            />
            {/* Second spotlight rouge discret */}
            <Spotlight
              className="-top-20 right-0 md:right-20"
              fill="#ED2939"
            />

            {/* Barre tricolore top */}
            <div className="absolute top-0 left-0 right-0 h-[4px] flex">
              <div className="flex-1" style={{ background: '#002395' }} />
              <div className="flex-1" style={{ background: 'rgba(255,255,255,0.5)' }} />
              <div className="flex-1" style={{ background: '#ED2939' }} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="overline-fr mb-4 inline-block">Adhésion ouverte</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl mb-5 mt-3"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
            >
              Rejoins la communauté
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="max-w-lg mx-auto text-sm leading-relaxed mb-10"
              style={{ color: 'var(--gray)' }}
            >
              Gardien actif, ancien gardien, entraîneur ou structure — l&apos;ANGB est ton association.
              Cotisation à partir de 0€ pour les mineurs, étudiants et membres du bureau.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button onClick={openAdhesion}
                className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
                Rejoindre l&apos;ANGB
              </button>
              <Link href="/forum"
                className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-all border hover:bg-white/5 hover:-translate-y-0.5"
                style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'var(--white)' }}>
                Accéder au forum
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      )}

    </div>
  )
}
