'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { getArticle, getArticleBody } from '@/lib/data'
import { FORMATS, RUBRIQUE_ACTUS } from '@/lib/rubriques'
import type { Article } from '@/lib/types'

/** Identifiant YouTube d'un lien, pour afficher la vidéo dans la page. */
function youtubeId(url?: string): string | null {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : null
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const { user, isMember, loading: authLoading, openAuth } = useAuth()
  const { openAdhesion } = useAdhesion()
  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState<{ body: string; lien: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  // Rechargé quand le statut de membre change (le texte réservé devient lisible).
  useEffect(() => {
    if (authLoading) return
    Promise.all([getArticle(params.id), getArticleBody(params.id)])
      .then(([a, b]) => { setArticle(a); setContent(b); setLoading(false) })
  }, [params.id, authLoading, isMember])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16"><div className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} /></div>
  }
  if (!article) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--white)' }}>Contenu introuvable</p>
        <Link href="/savoir" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>← Retour aux savoirs</Link>
      </div>
    )
  }

  const f = FORMATS[article.format] ?? FORMATS.article
  const locked = article.members_only && !content
  const body = content?.body
  const lien = content?.lien ?? undefined
  const yt = youtubeId(lien)
  const back = article.rubrique === RUBRIQUE_ACTUS ? '/actualites' : '/savoir'

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <Link href={back} className="text-xs font-semibold" style={{ color: 'var(--gray)' }}>← Retour</Link>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-wider" style={{ color: f.color }}>
        {f.emoji} {f.label} · {article.rubrique}
      </p>
      <h1 className="text-4xl md:text-6xl mt-2 mb-3" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1.05 }}>
        {article.titre}
      </h1>
      <p className="text-xs mb-6" style={{ color: 'var(--gray)' }}>
        {new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {yt ? (
        <div className="relative w-full rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16 / 9', background: '#000' }}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={article.titre} allowFullScreen
            className="absolute inset-0 w-full h-full" style={{ border: 0 }} />
        </div>
      ) : article.image ? (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
          <Image src={article.image} alt={article.titre} fill className="object-cover" sizes="768px" unoptimized={article.image.startsWith('http')} />
        </div>
      ) : null}

      {article.resume && (
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.85)' }}>{article.resume}</p>
      )}

      {locked ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--navy-mid)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <div className="text-3xl mb-2">🔒</div>
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--white)' }}>Contenu réservé aux membres</p>
          <p className="text-sm mb-5" style={{ color: 'var(--gray)' }}>
            {user ? 'Ton adhésion doit être validée par le bureau pour lire la suite.' : 'L’adhésion est gratuite la première année.'}
          </p>
          {!user && (
            <div className="flex gap-3 justify-center">
              <button onClick={openAdhesion} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>Rejoindre l&apos;ANGB</button>
              <button onClick={() => openAuth('login')} className="px-6 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--gray)', border: '1px solid var(--border)' }}>Se connecter</button>
            </div>
          )}
        </div>
      ) : (
        <>
          {body && (
            <div className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)', whiteSpace: 'pre-line' }}>{body}</div>
          )}
          {lien && !yt && (
            <a href={lien} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: f.color }}>
              {f.cta} →
            </a>
          )}
        </>
      )}
    </article>
  )
}
