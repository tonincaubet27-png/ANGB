'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeaderPhoto from '@/components/HeaderPhoto'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useAuth } from '@/contexts/AuthContext'
import { getArticles } from '@/lib/data'
import { RUBRIQUES, RUBRIQUE_ACTUS, FORMATS } from '@/lib/rubriques'
import type { Article } from '@/lib/types'

const FALLBACK_IMG = '/images/florian-hardy.jpg'

export default function SavoirPage() {
  const { openAdhesion } = useAdhesion()
  const { isMember } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [rubrique, setRubrique] = useState<string | null>(null)

  useEffect(() => {
    getArticles().then(a => { setArticles(a.filter(x => x.rubrique !== RUBRIQUE_ACTUS)); setLoading(false) })
    const r = new URLSearchParams(window.location.search).get('rubrique')
    if (r) setRubrique(r)
  }, [])

  const list = rubrique ? articles.filter(a => a.rubrique === rubrique) : articles
  const count = (nom: string) => articles.filter(a => a.rubrique === nom).length

  return (
    <div>
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/huet-canadiens.jpg" position="center 25%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Apprendre le poste</span>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Savoirs du gardien
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--gray)' }}>
            Tout ce qu&apos;un gardien de but doit savoir : le poste, l&apos;équipement, la technique, la tactique, le physique et la santé.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Rubriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {RUBRIQUES.map(r => {
            const on = rubrique === r.nom
            return (
              <button key={r.nom} onClick={() => setRubrique(on ? null : r.nom)}
                className="p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: on ? 'rgba(74,127,255,0.14)' : 'var(--navy-mid)',
                  border: `1px solid ${on ? 'rgba(74,127,255,0.55)' : 'var(--border)'}`,
                }}>
                <span className="text-2xl block mb-2">{r.emoji}</span>
                <span className="block text-sm font-semibold" style={{ color: 'var(--white)' }}>{r.nom}</span>
                <span className="block text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--gray)' }}>{r.desc}</span>
                <span className="block text-[10px] font-bold mt-2" style={{ color: '#4a7fff' }}>{count(r.nom)} contenu{count(r.nom) > 1 ? 's' : ''}</span>
              </button>
            )
          })}
        </div>

        {rubrique && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>{rubrique}</h2>
            <button onClick={() => setRubrique(null)} className="text-xs font-semibold" style={{ color: 'var(--gray)' }}>Tout voir ✕</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />)}
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center rounded-2xl" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-2 opacity-40">📚</div>
            <p className="text-sm" style={{ color: 'var(--gray)' }}>Les premiers contenus arrivent bientôt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map(a => {
              const f = FORMATS[a.format] ?? FORMATS.article
              return (
                <Link key={a.id} href={`/savoir/${a.id}`}
                  className="rounded-2xl overflow-hidden flex flex-col card-lift"
                  style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
                  <div className="relative h-40">
                    <Image src={a.image || FALLBACK_IMG} alt={a.titre} fill className="object-cover" sizes="(max-width:768px) 100vw, 380px" unoptimized={!!a.image && a.image.startsWith('http')} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', color: f.color }}>{f.emoji} {f.label}</span>
                    {a.members_only && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.6)', color: isMember ? '#34d399' : '#fbbf24' }}>
                        {isMember ? '✓ Membres' : '🔒 Membres'}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#4a7fff' }}>{a.rubrique}</p>
                    <h3 className="text-base font-semibold leading-snug mb-2" style={{ color: 'var(--white)' }}>{a.titre}</h3>
                    {a.resume && <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{a.resume}</p>}
                    <span className="mt-auto pt-4 text-xs font-semibold" style={{ color: '#4a7fff' }}>{f.cta} →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!isMember && (
          <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <h3 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
              Accède à tous les contenus
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--gray)' }}>
              L&apos;adhésion est gratuite la première année. Elle ouvre les contenus réservés, le forum et la bourse d&apos;équipement.
            </p>
            <button onClick={openAdhesion}
              className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
              Rejoindre l&apos;ANGB
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
