'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getThreads } from '@/lib/data'
import type { Thread } from '@/lib/types'

const CATEGORIES = [
  'Tous les sujets', 'Général', 'Stages & tournois', 'Équipement',
  'Technique & coaching', 'Prépa physique', 'Santé & blessures',
  'Vie des clubs', 'Hockey féminin', 'ANGB & institutionnel',
]

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
  Officiel:    { bg: 'rgba(74,127,255,0.15)',  color: '#4a7fff' },
  Débat:       { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  Santé:       { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  Équipement:  { bg: 'rgba(192,132,252,0.15)', color: '#c084fc' },
  Tournoi:     { bg: 'rgba(237,41,57,0.15)',   color: '#ED2939' },
  Retour:      { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' },
}

// Tag inferred from category for mock data that doesn't have a tag field
function inferTag(thread: Thread): string {
  if ((thread as Thread & { tag?: string }).tag) return (thread as Thread & { tag?: string }).tag!
  const cat = thread.category
  if (cat === 'ANGB & institutionnel') return 'Officiel'
  if (cat === 'Santé & blessures')     return 'Santé'
  if (cat === 'Équipement')            return 'Équipement'
  if (cat === 'Stages & tournois')     return 'Tournoi'
  if (cat === 'Vie des clubs')         return 'Officiel'
  return 'Débat'
}

export default function ForumPage() {
  const [threads, setThreads]     = useState<Thread[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActive] = useState('Tous les sujets')
  const [mobileOpen, setMobile]   = useState(false)

  useEffect(() => {
    getThreads().then(data => { setThreads(data); setLoading(false) })
  }, [])

  const filtered = threads.filter(t =>
    activeCategory === 'Tous les sujets' || t.category === activeCategory
  )

  const categoryCounts = threads.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1
    return acc
  }, {})

  const Sidebar = () => (
    <div className="space-y-0.5">
      {CATEGORIES.map(cat => (
        <button key={cat} onClick={() => { setActive(cat); setMobile(false) }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: activeCategory === cat ? 'rgba(74,127,255,0.15)' : 'transparent',
            color: activeCategory === cat ? 'var(--white)' : 'var(--gray)',
          }}>
          <span>{cat}</span>
          {cat !== 'Tous les sujets' && categoryCounts[cat] && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--navy-light)', color: 'var(--gray)' }}>
              {categoryCounts[cat]}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="py-16" style={{ background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Forum</p>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Forum ANGB</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>Échanges entre gardiens, entraîneurs et structures</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Mobile category toggle */}
        <button className="md:hidden w-full mb-4 py-2.5 px-4 rounded-lg text-sm font-medium border flex items-center justify-between"
          style={{ borderColor: 'var(--border)', color: 'var(--gray)', background: 'var(--navy-mid)' }}
          onClick={() => setMobile(!mobileOpen)}>
          <span>{activeCategory}</span><span>{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div className="md:hidden mb-6 p-4 rounded-xl border" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
            <Sidebar />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0 p-4 rounded-2xl border h-fit sticky top-24"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gray)' }}>Catégories</p>
            <Sidebar />
          </aside>

          {/* Thread list */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
                  {filtered.length} sujet{filtered.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {[...filtered]
                    .sort((a, b) => {
                      if (a.is_pinned && !b.is_pinned) return -1
                      if (!a.is_pinned && b.is_pinned) return 1
                      return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
                    })
                    .map(thread => {
                      const tag = TAG_STYLE[inferTag(thread)] ?? TAG_STYLE.Retour
                      return (
                        <Link key={thread.id} href={`/forum/${thread.id}`}
                          className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-accent/30 group"
                          style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'var(--navy-light)', color: 'var(--gray)' }}>
                            {thread.author_initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              {thread.is_pinned && (
                                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--accent)' }}>📌 Épinglé</span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: tag.bg, color: tag.color }}>
                                {inferTag(thread)}
                              </span>
                            </div>
                            <p className="text-sm font-medium truncate group-hover:text-white transition-colors" style={{ color: 'var(--white)' }}>
                              {thread.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                              {thread.author_name} · {thread.category}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-medium" style={{ color: 'var(--white)' }}>{thread.reply_count} rép.</p>
                            <p className="text-[10px]" style={{ color: 'var(--gray)' }}>
                              {new Date(thread.last_activity).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
