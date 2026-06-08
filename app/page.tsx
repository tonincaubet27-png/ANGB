'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────
// Stat card avec compteur animé
// ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, sub, delay = 0 }: { value: string; label: string; sub: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const match = value.match(/\d+/)
    if (!match) { setDisplay(value); return }
    const num = parseInt(match[0])
    const before = value.slice(0, value.indexOf(match[0]))
    const after = value.slice(value.indexOf(match[0]) + match[0].length)
    let frame = 0
    const total = 80
    const timer = setInterval(() => {
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
      whileHover={{ y: -6, borderColor: 'rgba(74,127,255,0.5)' }}
      className="p-6 rounded-2xl text-center border cursor-default"
      style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
    >
      <p className="text-4xl md:text-5xl mb-1"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.02em' }}>
        {display}
      </p>
      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--white)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: '5',      label: 'Divisions couvertes', sub: 'Magnus → Féminine Élite' },
  { value: '1200+',  label: 'Gardiens en France',  sub: 'Tous niveaux confondus' },
  { value: '3',      label: 'Workstreams FFHG',    sub: 'Commissions actives' },
  { value: '2026',   label: 'Année de fondation',  sub: 'Association loi 1901' },
]

const FEATURES = [
  { href: '/association', icon: '🏒', title: "L'association",     desc: "Mission, équipe, axes stratégiques et fonctionnement de l'ANGB." },
  { href: '/association', icon: '🎓', title: 'Formation',         desc: "Diplôme d'État gardien, label Club Formateur, réseau d'entraîneurs." },
  { href: '/association', icon: '🩺', title: 'Santé',             desc: '67% jouent blessés. Protocoles de prévention et suivi médical.' },
  { href: '/equipement',  icon: '🛡️', title: 'Bourse équipement', desc: 'Achat et vente de matériel entre membres de la communauté.' },
  { href: '/forum',       icon: '💬', title: 'Forum',             desc: 'Échanges entre gardiens, entraîneurs et structures de tous niveaux.' },
  { href: '/annuaire',    icon: '📋', title: 'Annuaire',          desc: 'Répertoire des gardiens actifs en France par division et région.' },
]

// Photos officielles — gardiens français
const GALLERY = [
  {
    src: '/images/christobal huet.jpeg',
    alt: 'Cristobal Huet — Champion NHL, Stanley Cup 2010',
    name: 'Cristobal Huet',
    title: 'Champion NHL · Stanley Cup 2010',
    badge: '🏆 Légende française',
    large: true,
  },
  {
    src: '/images/antoine keller.jpg',
    alt: 'Antoine Keller — Premier gardien français drafté en NHL',
    name: 'Antoine Keller',
    title: '1er gardien français drafté en NHL',
    badge: '⭐ Pionnier NHL',
    large: false,
  },
  {
    src: '/images/tonin caubet.jpg',
    alt: 'Tonin Caubet — Président fondateur ANGB',
    name: 'Tonin Caubet',
    title: 'Président fondateur · ANGB',
    badge: '🏒 Fondateur',
    large: false,
  },
]

const FOUNDERS = [
  { src: '/images/pacôme courtoison.jpeg', name: 'Pacôme Courtoison' },
  { src: '/images/steven catelin.png',     name: 'Steven Catelin' },
  { src: '/images/flo gourdin.jpg',        name: 'Flo Gourdin' },
  { src: '/images/jean jp fontaine.jpg',   name: 'Jean-JP Fontaine' },
  { src: '/images/adrien vazzaz.jpg',      name: 'Adrien Vazzaz' },
]

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">

        {/* Gradient pulsant */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse 100% 70% at 50% -15%, rgba(74,127,255,0.16) 0%, transparent 70%)',
              'radial-gradient(ellipse 100% 70% at 50% -8%,  rgba(74,127,255,0.24) 0%, transparent 70%)',
              'radial-gradient(ellipse 100% 70% at 50% -15%, rgba(74,127,255,0.16) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grille décorative */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        {/* Cercle bleu animé */}
        <motion.div
          className="absolute right-[8%] top-[20%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,127,255,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Cercle rouge animé */}
        <motion.div
          className="absolute left-[5%] bottom-[20%] w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(237,41,57,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* Lignes latérales */}
        <div className="absolute left-0 top-0 bottom-0 w-px opacity-20"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.8), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-px opacity-20"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(237,41,57,0.6), transparent)' }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-20 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{ background: 'rgba(74,127,255,0.1)', borderColor: 'rgba(74,127,255,0.3)', color: 'var(--accent)' }}
          >
            <span>🇫🇷</span>
            <span>Association Loi 1901 · Fondée en 2026</span>
          </motion.div>

          {/* Titre — mot par mot */}
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
              style={{ color: 'var(--accent)', display: 'inline-block', marginRight: '0.25em' }}
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

          {/* Accroche */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
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
            transition={{ duration: 0.6, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/association"
              className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(74,127,255,0.35)' }}>
              Découvrir l&apos;ANGB
            </Link>
            <Link href="/annuaire"
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all border hover:bg-white/5 hover:-translate-y-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--white)' }}>
              Annuaire des gardiens
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

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, sub }, i) => (
              <StatCard key={label} value={value} label={label} sub={sub} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Galerie ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-5xl mb-3"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              Les gardiens en action
            </h2>
            <p className="text-sm" style={{ color: 'var(--gray)' }}>
              La communauté des gardiens français — de la D3 au Magnus
            </p>
          </motion.div>

          {/* Grid : grande image gauche (Huet) + Keller + Fondateurs à droite */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3" style={{ height: '580px' }}>
            {GALLERY.map(({ src, alt, name, title, badge, large }, i) => (
              <motion.div
                key={name}
                className={`relative overflow-hidden rounded-2xl group ${large ? 'row-span-2' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ scale: 1.01 }}
                style={{ background: 'var(--navy-light)' }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={large ? '50vw' : '25vw'}
                />
                {/* Overlay dégradé fort en bas */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)' }} />
                {/* Barre tricolore */}
                <div className="absolute top-0 left-0 right-0 h-[3px] flex">
                  <div className="flex-1" style={{ background: '#002395' }} />
                  <div className="flex-1" style={{ background: '#FFFFFF' }} />
                  <div className="flex-1" style={{ background: 'var(--red-fr)' }} />
                </div>
                {/* Badge top-left */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(74,127,255,0.85)', color: 'white', backdropFilter: 'blur(4px)' }}>
                    {badge}
                  </span>
                </div>
                {/* Nom + titre en bas */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className={`font-bold mb-0.5 ${large ? 'text-xl md:text-2xl' : 'text-base'}`}
                    style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                    {name}
                  </p>
                  <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Fondateurs ───────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
              Les créateurs
            </p>
            <h2 className="text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              L&apos;équipe fondatrice de l&apos;ANGB
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {FOUNDERS.map(({ src, name }, i) => (
              <motion.div
                key={name}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2"
                  style={{ borderColor: 'rgba(74,127,255,0.4)', background: 'var(--navy-light)' }}>
                  <Image
                    src={src}
                    alt={name}
                    fill
                    className="object-cover object-top"
                    sizes="80px"
                  />
                </div>
                <p className="text-xs font-semibold text-center" style={{ color: 'var(--white)' }}>
                  {name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl text-center mb-3"
              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              Ce que fait l&apos;ANGB
            </h2>
            <p className="text-center text-sm mb-12" style={{ color: 'var(--gray)' }}>
              Six piliers pour structurer la communauté des gardiens français
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ href, icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link href={href}
                  className="group p-6 rounded-2xl border flex flex-col h-full transition-colors duration-200 hover:border-blue-500/30"
                  style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: 'var(--navy-light)' }}>
                    {icon}
                  </div>
                  <h3 className="text-xl mb-2 transition-colors group-hover:text-blue-400"
                    style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: 'var(--gray)' }}>{desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    En savoir plus →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-10 md:p-16"
            style={{
              background: 'linear-gradient(135deg, rgba(74,127,255,0.18) 0%, rgba(10,14,26,0) 50%, rgba(237,41,57,0.1) 100%)',
              border: '1px solid rgba(74,127,255,0.2)',
            }}
          >
            <motion.div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(74,127,255,0.12) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(237,41,57,0.1) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            />

            <div className="relative text-center">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--accent)' }}
              >
                Adhésion ouverte
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl mb-4"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
              >
                Rejoins la communauté
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="max-w-lg mx-auto text-sm mb-8"
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
                <Link href="/association"
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.25)' }}>
                  Rejoindre l&apos;ANGB
                </Link>
                <Link href="/forum"
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold transition-all border hover:bg-white/5 hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--white)' }}>
                  Accéder au forum
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
