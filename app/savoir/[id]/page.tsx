'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { getArticle, getArticleBody, getArticles } from '@/lib/data'
import ArticleBody from '@/components/ArticleBody'
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
  const [related, setRelated] = useState<Article[]>([])

  // Rechargé quand le statut de membre change (le texte réservé devient lisible).
  useEffect(() => {
    if (authLoading) return
    Promise.all([getArticle(params.id), getArticleBody(params.id)])
      .then(([a, b]) => { setArticle(a); setContent(b); setLoading(false) })
    getArticles().then(all => setRelated(all.filter(x => x.id !== params.id)))
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

  const minutes = body ? Math.max(1, Math.round(body.split(/\s+/).length / 200)) : null
  const suite = related
    .sort((x, y) => Number(y.rubrique === article.rubrique) - Number(x.rubrique === article.rubrique))
    .slice(0, 3)
  const sante = article.rubrique === 'Santé'

  return (
    <article>
      {/* Bandeau photo */}
      {!yt && article.image ? (
        <div className="relative w-full" style={{ height: 'clamp(260px, 42vw, 440px)' }}>
          <Image src={article.image} alt={article.titre} fill priority className="object-cover" sizes="100vw"
            unoptimized={article.image.startsWith('http')} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--navy) 4%, rgba(7,11,21,0.55) 55%, rgba(7,11,21,0.25))' }} />
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-4 md:px-8" style={{ marginTop: !yt && article.image ? '-96px' : 0, position: 'relative' }}>
        <div className={!yt && article.image ? '' : 'pt-10'}>
          <Link href={back} className="text-xs font-semibold inline-block" style={{ color: 'var(--gray)' }}>← Retour</Link>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-full" style={{ background: `${f.color}22`, color: f.color }}>{f.emoji} {f.label}</span>
            <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--navy-mid)', color: 'var(--gray)', border: '1px solid var(--border)' }}>{article.rubrique}</span>
          </div>
          <h1 className="text-5xl md:text-7xl mt-4 mb-4" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.03em', lineHeight: 1.02 }}>
            {article.titre}
          </h1>
          <p className="text-xs mb-8" style={{ color: 'var(--gray)' }}>
            {new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {minutes ? ` · ${minutes} min de lecture` : ''} · Par l&apos;ANGB
          </p>

          {yt && (
            <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: '16 / 9', background: '#000' }}>
              <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={article.titre} allowFullScreen
                className="absolute inset-0 w-full h-full" style={{ border: 0 }} />
            </div>
          )}

          {article.resume && (
            <p className="text-lg md:text-xl leading-relaxed mb-8 pl-5" style={{ color: 'rgba(255,255,255,0.92)', borderLeft: '3px solid var(--accent)' }}>
              {article.resume}
            </p>
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
              {body && <ArticleBody body={body} />}
              {lien && !yt && (
                <a href={lien} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: f.color }}>
                  {f.cta} →
                </a>
              )}
              {sante && (
                <p className="mt-10 text-xs leading-relaxed rounded-xl p-4" style={{ color: 'var(--gray)', background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                  ⚕️ Ces informations sont générales et ne remplacent pas l&apos;avis d&apos;un médecin ou d&apos;un kinésithérapeute. En cas de doute ou de douleur qui dure, consulte un professionnel de santé.
                </p>
              )}
            </>
          )}

          {/* Rejoindre */}
          {!user && !locked && (
            <div className="mt-14 rounded-2xl p-6 md:p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(74,127,255,0.16), rgba(237,41,57,0.1))', border: '1px solid var(--border-mid, var(--border))' }}>
              <p className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Tu es gardien, parent ou entraîneur ?</p>
              <p className="text-sm mb-5" style={{ color: 'var(--gray)' }}>Rejoins l&apos;ANGB : adhésion gratuite la première année, forum, bourse d&apos;équipement et contenus réservés aux membres.</p>
              <button onClick={openAdhesion} className="px-7 py-3 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>Rejoindre l&apos;ANGB</button>
            </div>
          )}

          {/* Suite */}
          {suite.length > 0 && (
            <div className="mt-14 pb-16">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gray)' }}>À lire ensuite</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {suite.map(r => (
                  <Link key={r.id} href={`/savoir/${r.id}`} className="rounded-2xl overflow-hidden transition-colors hover:bg-white/5 block"
                    style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                    {r.image && (
                      <div className="relative h-28">
                        <Image src={r.image} alt="" fill className="object-cover" sizes="260px" unoptimized={r.image.startsWith('http')} />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>{r.rubrique}</p>
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--white)' }}>{r.titre}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
