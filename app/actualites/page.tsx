'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useContent } from '@/contexts/ContentContext'
import { getArticles } from '@/lib/data'
import { FORMATS, RUBRIQUE_ACTUS } from '@/lib/rubriques'
import { LayoutGrid, type LayoutCard } from '@/components/ui/layout-grid'

// ── Types ───────────────────────────────────────────────────────────────────────
type PostType = 'interview' | 'video' | 'podcast' | 'reportage' | 'article'

interface NewsPost {
  id: string
  type: PostType
  title: string
  caption: string
  date: string
  thumbnail: string
  membersOnly: boolean
}

const TYPE_META: Record<PostType, { label: string; emoji: string; cta: string; color: string }> = FORMATS as Record<PostType, { label: string; emoji: string; cta: string; color: string }>

const FILTERS: { key: PostType | 'all'; label: string; emoji: string }[] = [
  { key: 'all',       label: 'Tout',       emoji: '🥅' },
  { key: 'interview', label: 'Interviews', emoji: '🎙️' },
  { key: 'video',     label: 'Vidéos',     emoji: '▶️' },
  { key: 'podcast',   label: 'Podcasts',   emoji: '🎧' },
  { key: 'reportage', label: 'Reportages', emoji: '📸' },
]

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// ── Page ────────────────────────────────────────────────────────────────────────
export default function ActualitesPage() {
  const [filter, setFilter] = useState<PostType | 'all'>('all')
  const c = useContent()
  const [POSTS, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles().then(list => {
      setPosts(list.filter(a => a.rubrique === RUBRIQUE_ACTUS).map(a => ({
        id: a.id, type: a.format, title: a.titre, caption: a.resume ?? '', date: a.published_at,
        thumbnail: a.image || '/images/huet-bercy.jpg', membersOnly: a.members_only,
      })))
      setLoading(false)
    })
  }, [])

  const posts = filter === 'all' ? POSTS : POSTS.filter(p => p.type === filter)

  const cards: LayoutCard[] = posts.map((post, index) => {
    const tm = TYPE_META[post.type]
    return {
      id: index + 1,
      thumbnail: post.thumbnail,
      className: undefined,
      badge: (
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', color: tm.color }}>{tm.emoji} {tm.label}</span>
      ),
      title: (
        <p className="text-sm font-semibold leading-snug" style={{ color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</p>
      ),
      content: (
        <>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
            style={{ background: `${tm.color}30`, color: tm.color }}>{tm.emoji} {tm.label}</span>
          <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: '#fff', letterSpacing: '0.03em' }}>{post.title}</h2>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{fmtDate(post.date)}{post.membersOnly ? ' · 🔒 Membres' : ''}</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.88)' }}>{post.caption}</p>
          <Link href={`/savoir/${post.id}`}
            className="inline-block py-2.5 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: tm.color }}>{tm.cta}</Link>
        </>
      ),
    }
  })

  return (
    <div>
      {/* ── Header profil (façon Instagram) ─────────────────────────────── */}
      <div className="py-12" style={{ background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 flex items-center gap-6 md:gap-10">
          {/* Avatar anneau tricolore */}
          <div className="flex-shrink-0" style={{ background: 'linear-gradient(135deg,#002395,#ffffff,#ED2939)', padding: 3, borderRadius: '50%' }}>
            <div className="rounded-full flex items-center justify-center" style={{ width: 88, height: 88, background: 'var(--navy)' }}>
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 26, color: '#fff', letterSpacing: '0.08em' }}>ANGB</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
              <h1 className="text-xl" style={{ color: 'var(--white)', fontWeight: 600 }}>Actualités ANGB</h1>
              {([['social.instagram', 'Instagram'], ['social.tiktok', 'TikTok'], ['social.youtube', 'YouTube']] as const)
                .filter(([k]) => c(k)).map(([k, label]) => (
                  <a key={k} href={c(k)} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)' }}>
                    {label}
                  </a>
                ))}
            </div>
            <div className="flex gap-5 mb-3 text-sm" style={{ color: 'var(--gray)' }}>
              <span><strong style={{ color: 'var(--white)' }}>{POSTS.length}</strong> publications</span>
              <span><strong style={{ color: 'var(--white)' }}>{POSTS.filter(p => p.type === 'video').length}</strong> vidéos</span>
              <span><strong style={{ color: 'var(--white)' }}>{POSTS.filter(p => p.type === 'podcast').length}</strong> podcasts</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
              <span style={{ color: 'var(--white)', fontWeight: 500 }}>Association Nationale des Gardiens de But</span> 🥅🇫🇷<br />
              Interviews, vidéos & podcasts autour du poste de gardien.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filtres (façon stories à la une) ────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-5 overflow-x-auto no-visible-scrollbar pb-2">
          {FILTERS.map(f => {
            const active = filter === f.key
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="rounded-full flex items-center justify-center text-2xl transition-transform duration-200 hover:scale-110"
                  style={{
                    width: 64, height: 64,
                    background: active ? 'rgba(74,127,255,0.12)' : 'var(--navy-mid)',
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border-mid)'}`,
                  }}>
                  {f.emoji}
                </div>
                <span className="text-[11px] font-medium" style={{ color: active ? 'var(--white)' : 'var(--gray)' }}>{f.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grille interactive (LayoutGrid) ─────────────────────────────── */}
      <div className="px-3 md:px-8 pb-24">
        {loading ? (
          <div className="max-w-5xl mx-auto h-64 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
        ) : cards.length === 0 ? (
          <div className="max-w-3xl mx-auto p-12 text-center rounded-2xl" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-2 opacity-40">🎙️</div>
            <p className="text-sm" style={{ color: 'var(--gray)' }}>Les premières interviews et vidéos arrivent bientôt.</p>
          </div>
        ) : (
          <LayoutGrid key={filter} cards={cards} />
        )}
      </div>
    </div>
  )
}
