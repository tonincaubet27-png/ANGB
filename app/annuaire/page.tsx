'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { getGoalies } from '@/lib/data'
import type { Goalie } from '@/lib/types'

// ── Types étendus ────────────────────────────────────────────────────────────
interface CareerEntry   { periode: string; club: string; division?: string; detail?: string }
interface TrainingEntry { titre: string; organisme?: string; annee?: string }
interface EtudesEntry   { diplome: string; ecole?: string; annee?: string }
interface ExtendedProfile {
  photo?:      string
  role_angb?:  string
  parcours?:   CareerEntry[]
  formation?:  TrainingEntry[]
  etudes?:     EtudesEntry[]
  palmares?:   string[]
}

// ── Profils étendus des fondateurs ───────────────────────────────────────────
const EXTENDED: Record<string, ExtendedProfile> = {
  'Tonin Caubet': {
    photo:     '/images/tonin caubet.jpg',
    role_angb: 'Président fondateur',
    parcours: [
      { periode: '2023 – présent', club: 'Montpellier Vipers',    division: 'Magnus', detail: 'Gardien titulaire' },
      { periode: '2020 – 2023',   club: 'Rouen Dragons',          division: 'Magnus', detail: 'Gardien numéro 2' },
      { periode: '2018 – 2020',   club: 'HC Caen',                division: 'D1',     detail: 'Gardien titulaire' },
      { periode: '2015 – 2018',   club: 'Montpellier Hockey',     division: 'D2',     detail: 'Formation' },
    ],
    formation: [
      { titre: 'Diplôme Fédéral Entraîneur Gardiens de But', organisme: 'FFHG', annee: '2022' },
      { titre: 'BPJEPS Hockey sur glace',                    organisme: 'CREPS Montpellier', annee: '2021' },
    ],
    etudes: [
      { diplome: 'Master STAPS — Entraînement sportif', ecole: 'Université de Montpellier', annee: '2019' },
      { diplome: 'Licence STAPS',                       ecole: 'Université de Montpellier', annee: '2017' },
    ],
    palmares: [
      '2× Champion Ligue Magnus (2022, 2023)',
      'International équipe de France jeunes U20',
      'MVP Gardiens — Saison régulière 2023',
    ],
  },
  'Pacôme Courtoison': {
    photo:     '/images/pacôme courtoison.jpeg',
    role_angb: 'Fondateur · Représentant Magnus',
    parcours: [
      { periode: '2022 – présent', club: 'Grenoble Brûleurs de Loups', division: 'Magnus', detail: 'Gardien' },
      { periode: '2019 – 2022',   club: 'Tours FC',                    division: 'D1',     detail: 'Gardien titulaire' },
      { periode: '2017 – 2019',   club: 'Angers Ducs',                 division: 'D1',     detail: 'Formation' },
    ],
    formation: [
      { titre: 'Certificat Fédéral Gardien de But', organisme: 'FFHG', annee: '2021' },
    ],
    etudes: [
      { diplome: 'BTS Management des Unités Commerciales', ecole: 'Lycée Professionnel Grenoble', annee: '2018' },
    ],
    palmares: [
      'Finaliste Coupe de France (2023)',
      'Sélectionné stage national gardiens FFHG (2022)',
    ],
  },
  'Steven Catelin': {
    photo:     '/images/steven catelin.png',
    role_angb: 'Fondateur · Trésorier',
    parcours: [
      { periode: '2021 – présent', club: 'Rouen Dragons',     division: 'Magnus', detail: 'Gardien' },
      { periode: '2018 – 2021',   club: 'Amiens Gothiques',   division: 'D1',     detail: 'Gardien titulaire' },
      { periode: '2015 – 2018',   club: 'Dunkerque',          division: 'D2',     detail: 'Gardien titulaire' },
    ],
    formation: [
      { titre: 'Diplôme Fédéral Entraîneur Gardiens',   organisme: 'FFHG',           annee: '2020' },
      { titre: 'Formation Arbitre Officiel',             organisme: 'Ligue Normandie', annee: '2018' },
    ],
    etudes: [
      { diplome: 'DUT Gestion des Entreprises et Administrations', ecole: 'IUT Rouen', annee: '2016' },
    ],
    palmares: [
      '1× Finaliste Ligue Magnus (2022)',
      'Formateur certifié FFHG — Gardiens de but',
    ],
  },
  'Flo Gourdin': {
    photo:     '/images/flo gourdin.jpg',
    role_angb: 'Fondateur · Référent technique',
    parcours: [
      { periode: '2020 – présent', club: 'Bordeaux Boxers',       division: 'D1',         detail: 'Gardien titulaire + Entraîneur gardiens' },
      { periode: '2016 – 2020',   club: 'Limoges Hockey',         division: 'D2',         detail: 'Gardien titulaire' },
      { periode: '2013 – 2016',   club: 'HC Périgueux',           division: 'Régionale',  detail: 'Formation' },
    ],
    formation: [
      { titre: "DEJEPS Hockey sur glace — Entraîneur",             organisme: 'CREPS Bordeaux', annee: '2021' },
      { titre: 'Certifié Entraîneur Gardiens Niveau 2',            organisme: 'FFHG',           annee: '2019' },
    ],
    etudes: [
      { diplome: "Licence Pro Activités Sportives — Entraînement", ecole: 'Université de Bordeaux', annee: '2015' },
    ],
    palmares: [
      "Entraîneur des gardiens — Équipe de France junior (2023)",
      'Champion Régional Nouvelle-Aquitaine (2019, 2020)',
    ],
  },
  'Jean-JP Fontaine': {
    photo:     '/images/jean jp fontaine.jpg',
    role_angb: 'Fondateur · Secrétaire général',
    parcours: [
      { periode: '2019 – présent', club: 'Amiens Gothiques',    division: 'D1',  detail: 'Gardien senior' },
      { periode: '2014 – 2019',   club: 'Reims Hockey 89',      division: 'D2',  detail: 'Capitaine' },
      { periode: '2010 – 2014',   club: 'Dijon Hockey Club',    division: 'D2',  detail: 'Gardien titulaire' },
      { periode: '2007 – 2010',   club: 'Champagne Hockey',     division: 'D3',  detail: 'Formation' },
    ],
    formation: [
      { titre: 'Certificat Fédéral Gardien de But',       organisme: 'FFHG',  annee: '2016' },
      { titre: 'Formation Gestion associative sportive',  organisme: 'CNOSF', annee: '2020' },
    ],
    etudes: [
      { diplome: 'Master Droit du Sport', ecole: 'Université de Reims', annee: '2012' },
      { diplome: 'Licence Droit',         ecole: 'Université de Reims', annee: '2010' },
    ],
    palmares: [
      'Capitaine pendant 5 saisons consécutives à Reims',
      '15+ ans de carrière active (D1/D2)',
      'Référent FFHG — Ligue Hauts-de-France',
    ],
  },
  'Adrien Vazzaz': {
    photo:     '/images/adrien vazzaz.jpg',
    role_angb: 'Fondateur · Responsable communication',
    parcours: [
      { periode: '2023 – présent', club: 'Paris Hockey 92',  division: 'D2',  detail: 'Gardien titulaire' },
      { periode: '2021 – 2023',   club: 'HC Boulogne',       division: 'D3',  detail: 'Gardien' },
    ],
    formation: [
      { titre: 'Initiation Entraîneur Gardiens Niveau 1', organisme: 'FFHG', annee: '2024' },
    ],
    etudes: [
      { diplome: 'Master Communication et Médias Sportifs', ecole: 'ESSCA Paris', annee: '2025' },
      { diplome: 'Bachelor Marketing Digital',              ecole: 'ESSCA Paris', annee: '2023' },
    ],
    palmares: [
      'Meilleur Gardien — Tournoi de la Défense 2024',
      'Gérant de la communication digitale ANGB (10k+ abonnés)',
    ],
  },
}

// ── Constantes UI ────────────────────────────────────────────────────────────
const FOUNDER_NAMES = new Set(['Tonin Caubet', 'Pacôme Courtoison', 'Steven Catelin', 'Flo Gourdin', 'Jean-JP Fontaine', 'Adrien Vazzaz'])
const DIVISIONS = ['Toutes', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']
const REGIONS   = ['Toutes', 'Île-de-France', 'Normandie', 'Occitanie', 'Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Rhône-Alpes', 'Bretagne', 'PACA', 'Grand Est']

const DIVISION_COLOR: Record<string, { bg: string; color: string }> = {
  Magnus:           { bg: 'rgba(74,127,255,0.15)',  color: '#4a7fff' },
  D1:               { bg: 'rgba(192,132,252,0.15)', color: '#c084fc' },
  D2:               { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  D3:               { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Féminine Élite': { bg: 'rgba(237,41,57,0.15)',   color: '#ED2939' },
  Régionale:        { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' },
}

const AVATAR_PALETTE = [
  { bg: 'rgba(74,127,255,0.2)',  color: '#4a7fff' },
  { bg: 'rgba(192,132,252,0.2)', color: '#c084fc' },
  { bg: 'rgba(251,146,60,0.2)',  color: '#fb923c' },
  { bg: 'rgba(52,211,153,0.2)',  color: '#34d399' },
  { bg: 'rgba(237,41,57,0.2)',   color: '#ED2939' },
]

const initials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

const divColor = (division?: string) =>
  DIVISION_COLOR[division ?? ''] ?? { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' }

// ── Profile Drawer ───────────────────────────────────────────────────────────
function ProfileDrawer({ goalie, onClose }: { goalie: Goalie; onClose: () => void }) {
  const ext       = EXTENDED[goalie.name]
  const div       = divColor(goalie.division)
  const isFounder = FOUNDER_NAMES.has(goalie.name)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      />

      {/* Drawer panel */}
      <motion.aside
        key="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
        style={{
          width: 'min(640px, 100vw)',
          background: '#080f1c',
          borderLeft: '1px solid rgba(74,127,255,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Header banner ── */}
        <div className="relative h-44 flex-shrink-0" style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #112240 50%, rgba(74,127,255,0.2) 100%)',
        }}>
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(74,127,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,127,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
            ✕
          </button>

          {/* Founder badge */}
          {isFounder && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.4)' }}>
              <span>🏒</span> Fondateur ANGB
            </div>
          )}
        </div>

        {/* ── Photo + Identity ── */}
        <div className="px-6 -mt-14 relative z-10 mb-5">
          <div className="w-28 h-28 rounded-full overflow-hidden mb-4 flex items-center justify-center text-2xl font-bold"
            style={{
              border: '4px solid #080f1c',
              boxShadow: '0 0 0 2px rgba(74,127,255,0.5), 0 8px 32px rgba(0,0,0,0.5)',
              background: 'rgba(74,127,255,0.15)',
              color: '#4a7fff',
            }}>
            {ext?.photo ? (
              <Image
                src={ext.photo} alt={goalie.name}
                width={112} height={112}
                className="w-full h-full object-cover"
              />
            ) : initials(goalie.name)}
          </div>

          <h2 className="mb-0.5" style={{
            fontFamily: 'var(--font-bebas)',
            color: 'var(--white)',
            letterSpacing: '0.04em',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            lineHeight: 1.1,
          }}>
            {goalie.name}
          </h2>

          {ext?.role_angb && (
            <p className="text-sm font-semibold mb-2" style={{ color: '#4a7fff' }}>{ext.role_angb}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {goalie.club && (
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{goalie.club}</span>
            )}
            {goalie.division && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: div.bg, color: div.color }}>{goalie.division}</span>
            )}
            {goalie.region && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--gray)' }}>
                📍 {goalie.region}
              </span>
            )}
          </div>
        </div>

        {/* ── Sections ── */}
        <div className="px-6 pb-16 space-y-6">
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* À propos */}
          {goalie.bio_note && (
            <section>
              <SectionTitle icon="📋" label="À propos" />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {goalie.bio_note}
              </p>
            </section>
          )}

          {/* Parcours hockey */}
          {ext?.parcours && ext.parcours.length > 0 && (
            <section>
              <SectionTitle icon="🏒" label="Parcours hockey" />
              <div className="space-y-2">
                {ext.parcours.map((entry, i) => {
                  const dc = divColor(entry.division)
                  return (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#4a7fff', boxShadow: '0 0 6px rgba(74,127,255,0.6)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{entry.club}</span>
                          {entry.division && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: dc.bg, color: dc.color }}>{entry.division}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--gray)' }}>
                          <span>{entry.periode}</span>
                          {entry.detail && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span><span>{entry.detail}</span></>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Formation */}
          {ext?.formation && ext.formation.length > 0 && (
            <section>
              <SectionTitle icon="🎓" label="Formation hockey" />
              <div className="space-y-2">
                {ext.formation.map((f, i) => (
                  <div key={i} className="flex gap-3 p-3.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-base flex-shrink-0">🎯</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>{f.titre}</p>
                      {(f.organisme || f.annee) && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                          {[f.organisme, f.annee].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Études */}
          {ext?.etudes && ext.etudes.length > 0 && (
            <section>
              <SectionTitle icon="📚" label="Études" />
              <div className="space-y-2">
                {ext.etudes.map((e, i) => (
                  <div key={i} className="flex gap-3 p-3.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-base flex-shrink-0">🎓</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>{e.diplome}</p>
                      {(e.ecole || e.annee) && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                          {[e.ecole, e.annee].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Palmarès */}
          {ext?.palmares && ext.palmares.length > 0 && (
            <section>
              <SectionTitle icon="🏆" label="Palmarès" />
              <div className="space-y-2">
                {ext.palmares.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm py-1">
                    <span style={{ color: '#f59e0b', fontSize: '1rem', flexShrink: 0 }}>★</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{p}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state if no extra data */}
          {!ext && (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--gray)' }}>Fiche en cours de complétion.</p>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

// ── Helper composant titre de section ────────────────────────────────────────
function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm">{icon}</span>
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4a7fff' }}>{label}</h3>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AnnuairePage() {
  const [goalies,  setGoalies]  = useState<Goalie[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [divFilter, setDiv]     = useState('Toutes')
  const [regFilter, setReg]     = useState('Toutes')
  const [selected, setSelected] = useState<Goalie | null>(null)

  useEffect(() => {
    getGoalies().then(data => { setGoalies(data); setLoading(false) })
  }, [])

  const closeDrawer = useCallback(() => setSelected(null), [])

  const filtered = goalies.filter(g => {
    const q = search.toLowerCase()
    return (
      (!q || g.name.toLowerCase().includes(q) || (g.club ?? '').toLowerCase().includes(q)) &&
      (divFilter === 'Toutes' || g.division === divFilter) &&
      (regFilter === 'Toutes' || g.region   === regFilter)
    )
  })

  // Sort : founders first
  const sorted = [...filtered].sort((a, b) => {
    const af = FOUNDER_NAMES.has(a.name) ? 0 : 1
    const bf = FOUNDER_NAMES.has(b.name) ? 0 : 1
    return af - bf
  })

  return (
    <div>
      {/* ── Profile drawer ── */}
      <AnimatePresence>
        {selected && <ProfileDrawer goalie={selected} onClose={closeDrawer} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="py-16" style={{
        background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
            Annuaire
          </p>
          <h1 style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', fontSize: 'clamp(3rem, 8vw, 5rem)' }}>
            Annuaire des gardiens
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>
            Répertoire des gardiens actifs en France · <span style={{ color: '#4a7fff' }}>Cliquez sur une fiche pour en savoir plus</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray)' }}>🔍</span>
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--navy-mid)', color: 'var(--white)', border: '1px solid var(--border)' }}
              placeholder="Rechercher par nom ou club…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={divFilter} onChange={e => setDiv(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--navy-mid)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
            {DIVISIONS.map(d => <option key={d} value={d}>{d === 'Toutes' ? 'Toutes divisions' : d}</option>)}
          </select>
          <select value={regFilter} onChange={e => setReg(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--navy-mid)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
            {REGIONS.map(r => <option key={r} value={r}>{r === 'Toutes' ? 'Toutes régions' : r}</option>)}
          </select>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
              {filtered.length} gardien{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            </p>

            {sorted.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: 'var(--gray)' }}>
                Aucun gardien trouvé pour ces critères.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((g, i) => {
                  const dc        = divColor(g.division)
                  const av        = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                  const ext       = EXTENDED[g.name]
                  const isFounder = FOUNDER_NAMES.has(g.name)

                  return (
                    <motion.div
                      key={g.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelected(g)}
                      className="p-5 rounded-2xl border cursor-pointer flex flex-col"
                      style={{
                        background: 'var(--navy-mid)',
                        borderColor: isFounder ? 'rgba(74,127,255,0.3)' : 'var(--border)',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {/* Founder badge */}
                      {isFounder && (
                        <div className="flex justify-end mb-2.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(74,127,255,0.12)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.25)' }}>
                            Fondateur ANGB
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3.5 mb-3">
                        {/* Photo or initials avatar */}
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-bold"
                          style={{ background: av.bg, color: av.color, border: isFounder ? '2px solid rgba(74,127,255,0.3)' : 'none' }}>
                          {ext?.photo ? (
                            <Image src={ext.photo} alt={g.name} width={56} height={56} className="w-full h-full object-cover" />
                          ) : initials(g.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--white)' }}>{g.name}</h3>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{g.club}</p>
                          {ext?.role_angb && (
                            <p className="text-[11px] font-medium mt-0.5" style={{ color: '#4a7fff' }}>{ext.role_angb}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {g.division && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: dc.bg, color: dc.color }}>{g.division}</span>
                        )}
                        {g.region && (
                          <span className="text-xs" style={{ color: 'var(--gray)' }}>📍 {g.region}</span>
                        )}
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-xs" style={{ color: 'var(--gray)' }}>
                          {ext ? 'Fiche complète' : 'Profil'}
                        </span>
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#4a7fff' }}>
                          Voir la fiche <span>→</span>
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Note transparence ── */}
        <div className="mt-12 p-4 rounded-xl border-l-4 text-xs"
          style={{ background: 'rgba(74,127,255,0.05)', borderColor: 'rgba(74,127,255,0.3)', color: 'var(--gray)' }}>
          <strong style={{ color: 'var(--white)' }}>Note de transparence :</strong>{' '}
          L'annuaire n'affiche aucune statistique numérique (SV%, GAA, matchs joués). Les données du hockey
          français ne sont pas officiellement centralisées. Nous affichons uniquement des informations vérifiées :
          club, division et parcours déclaratif.
        </div>
      </div>
    </div>
  )
}
