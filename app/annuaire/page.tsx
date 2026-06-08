'use client'

import { useState, useEffect } from 'react'
import { getGoalies } from '@/lib/data'
import type { Goalie } from '@/lib/types'

const DIVISIONS = ['Toutes', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']
const REGIONS   = ['Toutes', 'Île-de-France', 'Normandie', 'Occitanie', 'Nouvelle-Aquitaine', 'Rhône-Alpes', 'Bretagne', 'PACA', 'Auvergne-Rhône-Alpes', 'Grand Est']

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

export default function AnnuairePage() {
  const [goalies, setGoalies] = useState<Goalie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [divFilter, setDiv]   = useState('Toutes')
  const [regFilter, setReg]   = useState('Toutes')

  useEffect(() => {
    getGoalies().then(data => { setGoalies(data); setLoading(false) })
  }, [])

  const filtered = goalies.filter(g => {
    const q = search.toLowerCase()
    const matchQ = !q || g.name.toLowerCase().includes(q) || (g.club ?? '').toLowerCase().includes(q)
    const matchD = divFilter === 'Toutes' || g.division === divFilter
    const matchR = regFilter === 'Toutes' || g.region   === regFilter
    return matchQ && matchD && matchR
  })

  return (
    <div>
      {/* Header */}
      <div className="py-16" style={{ background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Annuaire</p>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Annuaire</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>Répertoire des gardiens actifs en France</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray)' }}>🔍</span>
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--navy-mid)', color: 'var(--white)', border: '1px solid var(--border)' }}
              placeholder="Rechercher par nom ou club…"
              value={search} onChange={e => setSearch(e.target.value)} />
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
              {filtered.length} gardien{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <p className="text-center py-16 text-sm" style={{ color: 'var(--gray)' }}>
                Aucun gardien trouvé pour ces critères.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((g, i) => {
                  const div     = DIVISION_COLOR[g.division ?? ''] ?? { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' }
                  const avatar  = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                  return (
                    <div key={g.id} className="p-5 rounded-2xl border hover:border-accent/30 transition-colors"
                      style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                          style={{ background: avatar.bg, color: avatar.color }}>
                          {initials(g.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{g.name}</h3>
                          <p className="text-xs" style={{ color: 'var(--gray)' }}>{g.club}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {g.division && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: div.bg, color: div.color }}>
                            {g.division}
                          </span>
                        )}
                        {g.region && (
                          <span className="text-xs" style={{ color: 'var(--gray)' }}>{g.region}</span>
                        )}
                      </div>
                      {g.bio_note && (
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{g.bio_note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Note transparence */}
        <div className="mt-10 p-4 rounded-xl border-l-4 text-xs"
          style={{ background: 'rgba(74,127,255,0.05)', borderColor: 'rgba(74,127,255,0.3)', color: 'var(--gray)' }}>
          <strong style={{ color: 'var(--white)' }}>Note de transparence :</strong>{' '}
          L'annuaire n'affiche aucune statistique numérique (SV%, GAA, matchs joués). Les données
          du hockey français ne sont pas officiellement centralisées. Nous affichons uniquement
          des informations vérifiées : club, division et note biographique libre.
        </div>
      </div>
    </div>
  )
}
