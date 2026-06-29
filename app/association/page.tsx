'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useAuth } from '@/contexts/AuthContext'
import { useContent } from '@/contexts/ContentContext'
import MissionSection from '@/components/about/MissionSection'
import FormationSection from '@/components/about/FormationSection'
import SanteSection from '@/components/about/SanteSection'
import VivierSection from '@/components/about/VivierSection'
import StatsSection from '@/components/about/StatsSection'
import ConseilSection from '@/components/about/ConseilSection'
import EquipeSection from '@/components/about/EquipeSection'
import RessourcesSection from '@/components/about/RessourcesSection'

const MODULES = [
  { id: 'mission',    label: 'Mission & axes',   icon: '🎯', tag: 'Vision',         component: MissionSection },
  { id: 'formation',  label: 'Formation',        icon: '🎓', tag: 'DE gardien',      component: FormationSection },
  { id: 'sante',      label: 'Santé',            icon: '🩺', tag: 'Prévention',      component: SanteSection },
  { id: 'vivier',     label: 'Vivier français',  icon: '🌱', tag: 'Détection',       component: VivierSection },
  { id: 'stats',      label: 'Statistiques',     icon: '📊', tag: 'Données',         component: StatsSection },
  { id: 'conseil',    label: 'Conseil carrière', icon: '💼', tag: 'Accompagnement',  component: ConseilSection },
  { id: 'ressources', label: 'Ressources',       icon: '📚', tag: 'FFHG',            component: RessourcesSection },
  { id: 'equipe',     label: "L'équipe",         icon: '👥', tag: 'Bureau',          component: EquipeSection },
]

const KPIS = [
  { value: 1200, suffix: '+', label: 'Gardiens en France', sub: 'estimation' },
  { value: 5,    suffix: '',  label: 'Divisions couvertes', sub: 'Magnus → Féminine' },
  { value: 67,   suffix: '%', label: 'Jouent blessés',      sub: 'priorité santé' },
  { value: 7,    suffix: '',  label: 'Axes pilotés',        sub: 'commissions ANGB' },
]

function AnimatedStat({ value, suffix, label, sub, delay = 0 }: {
  value: number; suffix: string; label: string; sub: string; delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let frame = 0
    const total = 55
    const t = setInterval(() => {
      frame++
      const e = 1 - Math.pow(1 - frame / total, 3)
      setN(Math.round(e * value))
      if (frame >= total) { setN(value); clearInterval(t) }
    }, 16)
    return () => clearInterval(t)
  }, [inView, value])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(to right,#002395,#4a7fff,#ED2939)' }} />
      <p className="text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-bebas)', color: '#4a7fff', letterSpacing: '0.02em', lineHeight: 1 }}>{n}{suffix}</p>
      <p className="text-sm font-semibold mt-1.5" style={{ color: 'var(--white)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
    </motion.div>
  )
}

export default function AssociationPage() {
  const [active, setActive] = useState('mission')
  const { openAdhesion } = useAdhesion()
  const { user } = useAuth()
  const c = useContent()
  const ActiveSection = MODULES.find(m => m.id === active)?.component ?? MissionSection

  return (
    <div>
      {/* ── Header tech ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Photo Fabrice Lhenry en fondu */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'url(/images/fabrice-lhenry.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 22%',
          opacity: 0.2,
          filter: 'grayscale(28%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
        }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <motion.div className="absolute -top-24 right-[8%] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(0,35,149,0.28) 0%,transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <span className="overline-fr mb-3 inline-block">L&apos;association · tableau de bord</span>
            <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>ANGB</h1>
            <p className="mt-2 max-w-xl text-sm" style={{ color: 'var(--gray)' }}>
              {c('assoc.header.sub')}
            </p>
          </div>
          {!user && (
            <button onClick={openAdhesion}
              className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
              Rejoindre l&apos;ANGB
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* ── KPIs animés ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          {KPIS.map((k, i) => <AnimatedStat key={k.label} {...k} delay={i * 0.08} />)}
        </div>

        {/* ── Tableau de bord : modules + contenu ─────────────────────── */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Modules sélectionnables */}
          <div className="flex md:flex-col gap-2 md:w-72 flex-shrink-0 overflow-x-auto no-visible-scrollbar pb-1 md:pb-0">
            {MODULES.map(m => {
              const on = active === m.id
              return (
                <button key={m.id} onClick={() => setActive(m.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left flex-shrink-0 transition-all"
                  style={{
                    background: on ? 'rgba(74,127,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${on ? 'rgba(74,127,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: on ? '0 0 22px rgba(74,127,255,0.18)' : 'none',
                    minWidth: 168,
                  }}>
                  <span className="text-xl">{m.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold" style={{ color: on ? 'var(--white)' : 'rgba(255,255,255,0.82)' }}>{m.label}</span>
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: on ? '#4a7fff' : 'var(--gray)' }}>{m.tag}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Panneau de contenu */}
          <div className="flex-1 min-w-0 rounded-2xl p-6 md:p-8"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}>
                <ActiveSection />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── CTA bas (masqué si connecté) ────────────────────────────── */}
        {!user && (
          <div className="mt-12 rounded-2xl p-8 md:p-10 text-center" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <h3 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              Prêt à rejoindre l&apos;ANGB ?
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--gray)' }}>
              Adhésion gratuite la première année · gardiens, anciens gardiens, entraîneurs, parents et structures.
            </p>
            <button onClick={openAdhesion}
              className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
              Rejoindre l&apos;ANGB
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
