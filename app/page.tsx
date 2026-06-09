'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const match = value.match(/\d+/)
    if (!match) { setDisplay(value); return }
    const num    = parseInt(match[0])
    const before = value.slice(0, value.indexOf(match[0]))
    const after  = value.slice(value.indexOf(match[0]) + match[0].length)
    let f = 0
    const t = setInterval(() => {
      f++
      const e = 1 - Math.pow(1 - f / 70, 3)
      setDisplay(before + Math.round(e * num) + after)
      if (f >= 70) { setDisplay(value); clearInterval(t) }
    }, 1000 / 60)
    return () => clearInterval(t)
  }, [inView, value])

  return <span ref={ref}>{display}</span>
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    num: '01', icon: '🎓', title: 'Formation',
    desc: "Diplôme d'État gardien, label Club Formateur, réseau d'entraîneurs certifiés.",
    href: '/association',
  },
  {
    num: '02', icon: '🩺', title: 'Santé & prévention',
    desc: '67% des gardiens jouent blessés. Protocoles médicaux dédiés, suivi du poste.',
    href: '/association',
  },
  {
    num: '03', icon: '🏒', title: 'Vivier & représentation',
    desc: 'Voix au sein de la FFHG, commissions actives, données du poste au niveau national.',
    href: '/association',
  },
  {
    num: '04', icon: '📋', title: 'Annuaire des gardiens',
    desc: 'Répertoire complet par division et région — de la D3 au Magnus.',
    href: '/annuaire',
  },
]

const GALLERY = [
  { src: '/images/christobal huet.jpeg', name: 'Cristobal Huet',  title: 'Champion NHL · Stanley Cup 2010',    num: '01' },
  { src: '/images/antoine keller.jpg',   name: 'Antoine Keller',  title: '1er gardien français drafté en NHL', num: '02' },
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
  return (
    <div style={{ background: 'var(--navy)' }}>

      {/* ──────────────────────────────────────────────────────────── HERO */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden">

        {/* Fond — gradient directionnel */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 80% at 60% 0%, rgba(0,35,149,0.15) 0%, transparent 65%), radial-gradient(ellipse 60% 60% at 10% 80%, rgba(237,41,57,0.08) 0%, transparent 60%)' }} />

        {/* Grille subtile */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Ligne verticale gauche — tricolore */}
        <div className="absolute left-6 md:left-10 top-12 bottom-12 w-[2px]"
          style={{ background: 'linear-gradient(to bottom, transparent, #002395 20%, #fff 50%, #ED2939 80%, transparent)' }} />

        <div className="max-w-7xl mx-auto px-10 md:px-16 w-full pt-24 pb-20">

          {/* Overline */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 24 }}>
            Association Nationale · Gardiens de But · Hockey sur Glace
          </motion.p>

          {/* Titre principal */}
          <h1 style={{ fontFamily: 'var(--font-bebas)', lineHeight: 0.88, marginBottom: 32 }}>
            {[
              { text: 'La voix des',   color: 'var(--white)',  size: 'clamp(4rem, 12vw, 9rem)', delay: 0.1 },
              { text: 'Gardiens',      color: 'var(--white)',  size: 'clamp(5rem, 16vw, 12rem)', delay: 0.2 },
              { text: 'Français',      color: '#ED2939',       size: 'clamp(5rem, 16vw, 12rem)', delay: 0.3 },
            ].map(({ text, color, size, delay }) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block', color, fontSize: size, letterSpacing: '0.03em' }}>
                {text}
              </motion.div>
            ))}
          </h1>

          {/* Description + CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-xl">
            <p style={{ color: 'var(--gray)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              L&apos;ANGB structure, développe et protège la pratique du poste de gardien de but
              en France — de la formation jusqu&apos;à la carrière professionnelle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/association"
                style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--white)', color: '#03060f', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none' }}>
                Découvrir →
              </Link>
              <Link href="/annuaire"
                style={{ display: 'inline-block', padding: '12px 28px', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--white)', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none' }}>
                Annuaire
              </Link>
            </div>
          </motion.div>

          {/* Bande stats inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-wrap gap-8 mt-16 pt-10"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { v: '1200+', l: 'gardiens en France' },
              { v: '5',     l: 'divisions couvertes' },
              { v: '2026',  l: 'année de fondation' },
              { v: 'Loi',   l: '1901 · Association nationale' },
            ].map(({ v, l }) => (
              <div key={l}>
                <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, color: 'var(--white)', letterSpacing: '0.04em' }}>{v} </span>
                <span style={{ fontSize: 11, color: 'var(--gray)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── MANIFESTE */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

            {/* Gauche — citation */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}>
              <div style={{ width: 40, height: 3, background: 'var(--fr-red)', marginBottom: 28 }} />
              <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.05, color: 'var(--white)', letterSpacing: '0.03em' }}>
                Un poste unique.<br />
                Une association<br />
                à sa hauteur.
              </h2>
            </motion.div>

            {/* Droite — texte */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="flex flex-col gap-6 pt-2">
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--gray-light)' }}>
                Le gardien de but est le seul joueur dont la spécificité technique,
                physique et psychologique est fondamentalement différente du reste de l&apos;équipe.
                Pourtant, en France, il est resté longtemps sans représentation dédiée.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--gray)' }}>
                L&apos;ANGB est née pour changer ça. Formation, santé, vivier, équipement —
                nous construisons les outils que la communauté mérite.
              </p>
              <Link href="/association"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white)', textDecoration: 'none', marginTop: 8 }}>
                Notre mission →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────── CHIFFRES */}
      <section style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { v: '1200+', l: 'Gardiens en France',  sub: 'Tous niveaux' },
              { v: '5',     l: 'Divisions',           sub: 'Magnus → Féminine' },
              { v: '3',     l: 'Workstreams FFHG',    sub: 'Commissions actives' },
              { v: '6',     l: 'Fondateurs',          sub: 'Gardiens actifs' },
            ].map(({ v, l, sub }, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="py-10 px-6 text-center"
                style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 56, color: 'var(--white)', letterSpacing: '0.02em', lineHeight: 1 }}>
                  <Counter value={v} delay={i * 0.1} />
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginTop: 6, letterSpacing: '0.05em' }}>{l}</p>
                <p style={{ fontSize: 10, color: 'var(--gray)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────── LÉGENDES PHOTO */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
              Légendes<br />françaises
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray)', maxWidth: 320, lineHeight: 1.6 }}>
              De la France jusqu&apos;à la NHL — les gardiens qui ont tracé la voie.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GALLERY.map(({ src, name, title, num }, i) => (
              <motion.div
                key={name}
                className="relative overflow-hidden rounded-xl group"
                style={{ height: 'clamp(280px, 45vw, 520px)', background: 'var(--navy-light)' }}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Image
                  src={src} alt={name} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="50vw" />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(3,6,15,0.9) 0%, rgba(3,6,15,0.2) 50%, transparent 100%)' }} />
                {/* Numéro */}
                <div className="absolute top-5 right-5"
                  style={{ fontFamily: 'var(--font-bebas)', fontSize: 64, color: 'rgba(255,255,255,0.07)', lineHeight: 1 }}>
                  {num}
                </div>
                {/* Barre tricolore top */}
                <div className="absolute top-0 left-0 right-0 h-[3px] flex">
                  <div className="flex-1" style={{ background: '#002395' }} />
                  <div className="flex-1" style={{ background: '#fff' }} />
                  <div className="flex-1" style={{ background: '#ED2939' }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <p style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', color: 'var(--white)', letterSpacing: '0.05em', lineHeight: 1 }}>
                    {name}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                    {title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────── PILIERS */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
              Nos axes
            </h2>
            <Link href="/association"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gray)', textDecoration: 'none' }}>
              Tout voir →
            </Link>
          </div>

          <div className="flex flex-col">
            {PILLARS.map(({ num, icon, title, desc, href }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}>
                <Link href={href}
                  className="group flex items-start gap-8 md:gap-16 py-8 md:py-10"
                  style={{ borderTop: '1px solid var(--border)', textDecoration: 'none' }}>
                  {/* Numéro */}
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', minWidth: 24, paddingTop: 6 }}>
                    {num}
                  </span>
                  {/* Icône */}
                  <span style={{ fontSize: 22, paddingTop: 4, flexShrink: 0 }}>{icon}</span>
                  {/* Contenu */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-8">
                    <h3 className="group-hover:text-white transition-colors"
                      style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', lineHeight: 1 }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--gray)', maxWidth: 420, lineHeight: 1.65 }}>
                      {desc}
                    </p>
                  </div>
                  {/* Flèche */}
                  <span className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity pt-2"
                    style={{ color: 'var(--white)', fontSize: 18 }}>→</span>
                </Link>
              </motion.div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── FONDATEURS */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>
                À l'origine
              </p>
              <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
                6 gardiens fondateurs
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {FOUNDERS.map(({ src, name }, i) => (
              <motion.div
                key={name}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -4 }}>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden"
                  style={{ background: 'var(--navy-light)' }}>
                  <Image src={src} alt={name} fill className="object-cover object-top" sizes="150px" />
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,35,149,0.25)' }} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--gray-light)', textAlign: 'center', lineHeight: 1.4 }}>
                  {name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── CTA */}
      <section style={{ padding: '120px 0' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 20 }}>
              Adhésion ouverte
            </p>
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(3.5rem, 10vw, 8rem)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 0.9, marginBottom: 24 }}>
              Rejoins<br />
              <span style={{ color: 'var(--fr-red)' }}>l&apos;ANGB</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--gray)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Gardien actif, ancien gardien, entraîneur ou structure —
              cotisation à partir de 0€ pour les mineurs et étudiants.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/association"
                style={{ padding: '14px 32px', background: 'var(--fr-red)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none', boxShadow: '0 8px 32px rgba(237,41,57,0.3)' }}>
                Rejoindre l&apos;ANGB
              </Link>
              <Link href="/forum"
                style={{ padding: '14px 32px', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--white)', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none' }}>
                Forum →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
