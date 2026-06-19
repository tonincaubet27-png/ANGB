'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getThreads, createThread } from '@/lib/data'
import type { Thread } from '@/lib/types'
import { Tabs } from '@/components/ui/tabs'
import type { Tab } from '@/components/ui/tabs'
import HeaderPhoto from '@/components/HeaderPhoto'
import { useAuth } from '@/contexts/AuthContext'
import { useAdhesion } from '@/contexts/AdhesionContext'

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Tous',        filter: null,                   icon: '📋' },
  { label: 'Général',     filter: 'Général',              icon: '💬' },
  { label: 'Stages',      filter: 'Stages & tournois',    icon: '🏟️' },
  { label: 'Équipement',  filter: 'Équipement',           icon: '🛡️' },
  { label: 'Technique',   filter: 'Technique & coaching', icon: '🎯' },
  { label: 'Prépa',       filter: 'Prépa physique',       icon: '💪' },
  { label: 'Santé',       filter: 'Santé & blessures',    icon: '🩺' },
  { label: 'Clubs',       filter: 'Vie des clubs',        icon: '🏒' },
  { label: 'Féminin',     filter: 'Hockey féminin',       icon: '♀️' },
  { label: 'ANGB',        filter: 'ANGB & institutionnel',icon: '🇫🇷' },
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
      className="flex items-center gap-4 p-4 rounded-xl border transition-all group card-lift"
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
  const { user, profile } = useAuth()
  const { openAdhesion } = useAdhesion()
  const isMember = profile?.membership_status === 'active'

  // Modale « Nouveau sujet »
  const [showNew, setShowNew]   = useState(false)
  const [ntTitle, setNtTitle]   = useState('')
  const [ntCat, setNtCat]       = useState(CATEGORIES[1].filter as string)
  const [ntError, setNtError]   = useState('')
  const [ntBusy, setNtBusy]     = useState(false)

  const reload = () => getThreads().then(data => { setThreads(data); setLoading(false) })
  useEffect(() => { reload() }, [])

  const initials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const submitThread = async () => {
    const title = ntTitle.trim()
    if (title.length < 6) { setNtError('Le titre doit faire au moins 6 caractères.'); return }
    setNtBusy(true); setNtError('')
    const name = profile?.display_name || 'Membre ANGB'
    const { ok, error } = await createThread({
      title, category: ntCat, author_name: name, author_initials: initials(name),
    })
    setNtBusy(false)
    if (!ok) { setNtError(error || 'Erreur lors de la création.'); return }
    setNtTitle(''); setShowNew(false)
    await reload()
  }

  // Construit les onglets à partir des catégories et des threads chargés
  const tabs: Tab[] = CATEGORIES.map(({ label, filter, icon }) => {
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
      title: `${icon} ${label}`,
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
        className="relative overflow-hidden py-16"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <HeaderPhoto src="/images/hardy.jpg" position="center 35%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
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

      {/* ── Barre d'action : nouveau sujet ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex items-center justify-between gap-4">
        <p className="text-xs" style={{ color: 'var(--gray)' }}>
          {isMember
            ? 'Tu es membre — lance un sujet quand tu veux.'
            : user
              ? 'Réservé aux membres : ton adhésion doit être validée pour publier.'
              : 'Connecte-toi et adhère pour participer.'}
        </p>
        {isMember ? (
          <button onClick={() => { setShowNew(true); setNtError('') }}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px rgba(74,127,255,0.3)' }}>
            + Nouveau sujet
          </button>
        ) : (
          <button onClick={openAdhesion}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.1em] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'var(--gray)' }}>
            Adhérer pour publier
          </button>
        )}
      </div>

      {/* ── Charte de bonne conduite ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <span className="text-lg flex-shrink-0">🤝</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
            <strong style={{ color: 'var(--white)' }}>Ici, c&apos;est l&apos;entraide entre gardiens · dans le respect.</strong>{' '}
            Insultes, agressivité, harcèlement ou dénigrement sont interdits. Tout abus peut entraîner la suppression
            du message, une suspension, voire la <strong style={{ color: '#fbbf24' }}>radiation et la suppression de l&apos;adhésion</strong>.
            {' '}
            <Link href="/reglement" className="font-semibold" style={{ color: 'var(--accent)' }}>Voir le règlement →</Link>
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

      {/* ── Modale : nouveau sujet ────────────────────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" onClick={e => e.stopPropagation()}
            style={{ background: 'var(--navy-mid)', border: '1px solid var(--border-mid)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Nouveau sujet</h3>
              <button onClick={() => setShowNew(false)} className="text-lg" style={{ color: 'var(--gray)' }}>✕</button>
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Titre</label>
            <input value={ntTitle} onChange={e => setNtTitle(e.target.value)} maxLength={120}
              placeholder="Ex : Quel matériel pour débuter en senior ?"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4"
              style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }} />

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Catégorie</label>
            <select value={ntCat} onChange={e => setNtCat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mb-4"
              style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }}>
              {CATEGORIES.filter(c => c.filter).map(c => (
                <option key={c.filter as string} value={c.filter as string}>{c.icon} {c.filter}</option>
              ))}
            </select>

            {ntError && <p className="text-xs mb-3" style={{ color: '#f87171' }}>{ntError}</p>}

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: 'var(--gray)', border: '1px solid var(--border)' }}>Annuler</button>
              <button onClick={submitThread} disabled={ntBusy}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60"
                style={{ background: 'var(--accent)' }}>
                {ntBusy ? 'Publication…' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
