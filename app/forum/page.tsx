'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getThreads } from '@/lib/data'
import type { Thread } from '@/lib/types'
import { Tabs } from '@/components/ui/tabs'
import type { Tab } from '@/components/ui/tabs'

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Tous',        filter: null                   },
  { label: 'Général',     filter: 'Général'              },
  { label: 'Stages',      filter: 'Stages & tournois'    },
  { label: 'Équipement',  filter: 'Équipement'           },
  { label: 'Technique',   filter: 'Technique & coaching' },
  { label: 'Prépa',       filter: 'Prépa physique'       },
  { label: 'Santé',       filter: 'Santé & blessures'    },
  { label: 'Clubs',       filter: 'Vie des clubs'        },
  { label: 'Féminin',     filter: 'Hockey féminin'       },
  { label: 'ANGB',        filter: 'ANGB & institutionnel'},
]

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
  Officiel:   { bg: 'rgba(74,127,255,0.15)',  color: '#4a7fff' },
  Débat:      { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  Santé:      { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  Équipement: { bg: 'rgba(192,132,252,0.15)', color: '#c084fc' },
  Tournoi:    { bg: 'rgba(237,41,57,0.15)',   color: '#ED2939' },
  Retour:     { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' },
}

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

// ── Composants ────────────────────────────────────────────────────────────────

function ThreadRow({ thread }: { thread: Thread }) {
  const tag = TAG_STYLE[inferTag(thread)] ?? TAG_STYLE.Retour
  return (
    <Link
      href={`/forum/${thread.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border transition-all group"
      style={{ background: 'var(--navy-card)', borderColor: 'var(--border)' }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: 'var(--navy-light)', color: 'var(--gray)' }}
      >
        {thread.author_initials}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {thread.is_pinned && (
            <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--accent)' }}>
              📌 Épinglé
            </span>
          )}
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: tag.bg, color: tag.color }}
          >
            {inferTag(thread)}
          </span>
        </div>
        <p
          className="text-sm font-medium truncate group-hover:text-white transition-colors"
          style={{ color: 'var(--white)' }}
        >
          {thread.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
          {thread.author_name} · {thread.category}
        </p>
      </div>

      {/* Meta */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium" style={{ color: 'var(--white)' }}>
          {thread.reply_count} rép.
        </p>
        <p className="text-[10px]" style={{ color: 'var(--gray)' }}>
          {new Date(thread.last_activity).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </Link>
  )
}

function ThreadPanel({ threads }: { threads: Thread[] }) {
  const sorted = [...threads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
  })

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <span className="text-3xl opacity-30">🥅</span>
        <p className="text-sm" style={{ color: 'var(--gray)' }}>Aucun sujet dans cette catégorie</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <p className="text-xs mb-3 pb-3 flex-shrink-0"
        style={{ color: 'var(--gray)', borderBottom: '1px solid var(--border)' }}>
        {threads.length} sujet{threads.length !== 1 ? 's' : ''}
      </p>
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--navy-light) transparent' }}>
        {sorted.map(thread => <ThreadRow key={thread.id} thread={thread} />)}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForumPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getThreads().then(data => { setThreads(data); setLoading(false) })
  }, [])

  // Construit les onglets à partir des catégories et des threads chargés
  const tabs: Tab[] = CATEGORIES.map(({ label, filter }) => {
    const catThreads = filter === null
      ? threads
      : threads.filter(t => t.category === filter)

    // slug stable pour le value
    const value = label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')

    return {
      title: label,
      value,
      content: (
        <div
          className="w-full h-full rounded-2xl p-5"
          style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
        >
          <ThreadPanel threads={catThreads} />
        </div>
      ),
    }
  })

  return (
    <div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        className="py-16"
        style={{
          background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Communauté</span>
          <h1
            className="text-5xl md:text-7xl"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
          >
            Forum ANGB
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>
            Échanges entre gardiens, entraîneurs et structures
          </p>
        </div>
      </div>

      {/* ── Contenu ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          /* Skeleton */
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
            ))}
          </div>
        ) : (
          /* Tabs Aceternity */
          <div
            className="h-[580px] md:h-[680px] relative flex flex-col w-full items-start justify-start"
            style={{ perspective: '1000px' }}
          >
            <Tabs
              tabs={tabs}
              containerClassName="mb-6 gap-1 pb-4 border-b flex-shrink-0 w-full"
              tabClassName="text-sm font-semibold"
            />
          </div>
        )}
      </div>

    </div>
  )
}
