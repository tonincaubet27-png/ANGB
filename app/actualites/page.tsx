'use client'

import { useState } from 'react'
import { LayoutGrid, type LayoutCard } from '@/components/ui/layout-grid'

// ── Types & données (exemples · à remplacer par du vrai contenu) ────────────────
type PostType = 'interview' | 'video' | 'podcast' | 'reportage'

interface NewsPost {
  id: string
  type: PostType
  title: string
  caption: string
  date: string
  meta?: string
  url?: string
  thumbnail: string
}

const TYPE_META: Record<PostType, { label: string; emoji: string; cta: string; from: string; to: string; color: string }> = {
  interview: { label: 'Interview', emoji: '🎙️', cta: "Lire l'interview",   from: '#0d2a5e', to: '#0a1628', color: '#4a7fff' },
  video:     { label: 'Vidéo',     emoji: '▶️',  cta: 'Regarder la vidéo',  from: '#5e0d18', to: '#1a0a0e', color: '#ED2939' },
  podcast:   { label: 'Podcast',   emoji: '🎧',  cta: 'Écouter le podcast', from: '#3a1a5e', to: '#140a1e', color: '#a78bfa' },
  reportage: { label: 'Reportage', emoji: '📸',  cta: 'Voir le reportage',  from: '#0a3a2e', to: '#0a1816', color: '#34d399' },
}

const POSTS: NewsPost[] = [
  { id: '1', type: 'interview', title: 'Cristobal Huet · la Coupe Stanley vue des Alpes', caption: 'Le seul gardien français champion NHL revient sur son parcours, son rôle de modèle et l’avenir du poste en France.', date: '2026-06-10', meta: 'Lecture 8 min', url: '#', thumbnail: '/images/huet-canadiens.jpg' },
  { id: '2', type: 'video',     title: 'Le papillon décortiqué', caption: 'Déplacements, couverture d’angle et récupération au sol · la technique du papillon expliquée image par image.', date: '2026-06-08', meta: '6 min', url: '#', thumbnail: '/images/hardy.jpg' },
  { id: '3', type: 'podcast',   title: 'Épisode 1 · Être gardien en D2', caption: 'Quotidien, double projet études/sport et passion : trois gardiens de D2 témoignent.', date: '2026-06-05', meta: '42 min', url: '#', thumbnail: '/images/eddy-ferhi.jpg' },
  { id: '4', type: 'interview', title: 'Antoine Keller, pionnier du hockey français', caption: 'Retour sur le parcours d’un gardien qui a ouvert la voie vers l’Amérique du Nord.', date: '2026-06-03', meta: 'Lecture 6 min', url: '#', thumbnail: '/images/antoine keller.jpg' },
  { id: '5', type: 'video',     title: 'Prépa physique spécifique gardien', caption: 'Mobilité des hanches, gainage anti-rotation et explosivité latérale : la séance type ANGB.', date: '2026-05-30', meta: '11 min', url: '#', thumbnail: '/images/florian-hardy.jpg' },
  { id: '6', type: 'reportage', title: 'Stage gardiens Grenoble · juillet 2026', caption: 'Immersion dans le premier stage estival de l’ANGB : trois jours sur et hors de la glace.', date: '2026-05-27', meta: '14 photos', url: '#', thumbnail: '/images/fabrice-lhenry.jpg' },
  { id: '7', type: 'podcast',   title: 'Épisode 2 · La santé du gardien', caption: 'Commotions, hanches, santé mentale : on parle prévention avec un préparateur physique.', date: '2026-05-22', meta: '38 min', url: '#', thumbnail: '/images/huet-bercy.jpg' },
  { id: '8', type: 'video',     title: 'Le jeu au pied moderne', caption: 'Relances, soutien au défenseur, lecture du jeu : le gardien comme premier relanceur.', date: '2026-05-18', meta: '7 min', url: '#', thumbnail: '/images/cristobal-huet-cup.jpg' },
  { id: '9', type: 'interview', title: 'Gardienne en équipe de France féminine', caption: 'Le parcours, les défis et les ambitions d’une internationale tricolore.', date: '2026-05-14', meta: 'Lecture 7 min', url: '#', thumbnail: '/images/caroline-baldin.jpg' },
]

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

  const posts = filter === 'all' ? POSTS : POSTS.filter(p => p.type === filter)

  const cards: LayoutCard[] = posts.map((post) => {
    const tm = TYPE_META[post.type]
    return {
      id: Number(post.id),
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
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{fmtDate(post.date)}{post.meta ? ` · ${post.meta}` : ''}</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.88)' }}>{post.caption}</p>
          <a href={post.url || '#'} target="_blank" rel="noopener noreferrer"
            onClick={e => { if (!post.url || post.url === '#') e.preventDefault() }}
            className="inline-block py-2.5 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: tm.color }}>{tm.cta}</a>
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
              <h1 className="text-xl" style={{ color: 'var(--white)', fontWeight: 600 }}>angb.gardiens</h1>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)' }}>
                Suivre sur Instagram
              </a>
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
        <LayoutGrid key={filter} cards={cards} />
      </div>
    </div>
  )
}
