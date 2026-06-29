'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeaderPhoto from '@/components/HeaderPhoto'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useContent } from '@/contexts/ContentContext'
import CoachesMap, { coachRegion, REGIONS_FR, type Coach } from '@/components/CoachesMap'

const ini = (n: string) => n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
const DIV_COLOR: Record<string, string> = {
  Magnus: '#4a7fff', D1: '#c084fc', D2: '#fb923c', D3: '#34d399', 'Féminine Élite': '#ED2939', Régionale: '#8a9ab5',
}

export default function EntraineursPage() {
  const { openAdhesion } = useAdhesion()
  const c = useContent()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [divFilter, setDivFilter] = useState('Toutes')

  useEffect(() => {
    fetch('/api/coaches')
      .then(r => r.json())
      .then((data: Coach[]) => { setCoaches(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Régions / divisions réellement représentées (pour les filtres)
  const regionsPresent = useMemo(
    () => REGIONS_FR.filter(r => coaches.some(c => coachRegion(c.region) === r)),
    [coaches])
  const divisionsPresent = useMemo(
    () => coaches.map(c => c.division).filter((d, i, a): d is string => !!d && a.indexOf(d) === i),
    [coaches])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return coaches.filter(c =>
      (!activeRegion || coachRegion(c.region) === activeRegion) &&
      (divFilter === 'Toutes' || c.division === divFilter) &&
      (!q || c.name.toLowerCase().includes(q) || (c.club ?? '').toLowerCase().includes(q)))
  }, [coaches, activeRegion, divFilter, search])

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/florian-hardy.jpg" position="center 28%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">{c('entraineurs.header.overline')}</span>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            {c('entraineurs.header.title')}
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--gray)' }}>
            {c('entraineurs.header.sub')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Carte */}
            <div className="lg:flex-1 min-w-0">
              <div className="rounded-2xl p-4" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                <CoachesMap coaches={coaches} activeRegion={activeRegion} onRegion={setActiveRegion} />
              </div>
              <p className="text-center text-xs mt-3" style={{ color: 'var(--gray)' }}>
                {coaches.length} entraîneur{coaches.length !== 1 ? 's' : ''} gardien{coaches.length !== 1 ? 's' : ''} inscrit{coaches.length !== 1 ? 's' : ''} ·
                les chiffres indiquent le nombre par région
              </p>
            </div>

            {/* Filtres + liste */}
            <div className="lg:w-[360px] flex-shrink-0">
              {/* Filtres */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4a7fff' }}>🔎 Filtrer</h2>
                  {(activeRegion || divFilter !== 'Toutes' || search) && (
                    <button onClick={() => { setActiveRegion(null); setDivFilter('Toutes'); setSearch('') }}
                      className="text-[11px] font-semibold" style={{ color: 'var(--gray)' }}>Réinitialiser ✕</button>
                  )}
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou club…"
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-2.5"
                  style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }} />
                <div className="grid grid-cols-1 gap-2.5">
                  <select value={activeRegion ?? ''} onChange={e => setActiveRegion(e.target.value || null)}
                    className="px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }}>
                    <option value="">Toutes les régions</option>
                    {regionsPresent.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={divFilter} onChange={e => setDivFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }}>
                    <option value="Toutes">Toutes les divisions</option>
                    {divisionsPresent.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Liste */}
              <p className="text-xs mb-3" style={{ color: 'var(--gray)' }}>
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}{activeRegion ? ` · ${activeRegion}` : ''}
              </p>

              {coaches.length === 0 ? (
                <div className="p-6 rounded-2xl text-center" style={{ background: 'var(--navy-mid)', border: '1px dashed var(--border-mid)' }}>
                  <div className="text-3xl mb-2 opacity-40">🧤</div>
                  <p className="text-sm mb-1" style={{ color: 'var(--white)' }}>Aucun entraîneur gardien inscrit pour l&apos;instant</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>Tu es entraîneur gardien ? Rejoins l&apos;ANGB et apparais sur la carte.</p>
                  <button onClick={openAdhesion} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>
                    Rejoindre l&apos;ANGB
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--gray)' }}>Aucun entraîneur pour ces filtres.</p>
              ) : (
                <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                  {filtered.map(c => (
                    <Link key={c.id} href="/annuaire"
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                      style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                      <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'rgba(74,127,255,0.18)', color: '#4a7fff' }}>
                        {c.photo_url ? <Image src={c.photo_url} alt={c.name} width={44} height={44} className="w-full h-full object-cover" /> : ini(c.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--white)' }}>{c.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--gray)' }}>
                          {[c.club, coachRegion(c.region)].filter(Boolean).join(' · ') || 'Entraîneur gardien'}
                        </p>
                      </div>
                      {c.division && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${DIV_COLOR[c.division] ?? '#8a9ab5'}22`, color: DIV_COLOR[c.division] ?? '#8a9ab5' }}>
                          {c.division}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
