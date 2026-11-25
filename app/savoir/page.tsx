'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const [q, setQ] = useState('')

  useEffect(() => {
    getArticles().then(a => { setArticles(a.filter(x => x.rubrique !== RUBRIQUE_ACTUS)); setLoading(false) })
    const r = new URLSearchParams(window.location.search).get('rubrique')
    if (r) setRubrique(r)
  }, [])

  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const list = (rubrique ? articles.filter(a => a.rubrique === rubrique) : articles)
    .filter(a => !q.trim() || norm(`${a.titre} ${a.resume ?? ''} ${a.rubrique}`).includes(norm(q.trim())))
  const count = (nom: string) => articles.filter(a => a.rubrique === nom).length

  return (
    <div>
      <div className="relative overflow-hidden py-10 md:py-12" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/huet-canadiens.jpg" position="center 25%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Apprendre le poste</span>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Savoirs du gardien
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--gray)' }}>
            Le poste, l&apos;équipement, la santé : des repères clairs, et des sources quand on parle de santé.
          </p>
          <div className="mt-5 max-w-md relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray)' }}>🔎</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Chercher : hanches, patins, commotion…"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(91,141,255,0.35)]"
              style={{ background: 'rgba(15,27,51,0.75)', color: 'var(--white)', border: '1px solid var(--border-mid)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Rubriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {RUBRIQUES.map((r, i) => {
            const on = rubrique === r.nom
            return (
              <motion.button key={r.nom} onClick={() => setRubrique(on ? null : r.nom)}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
                className="group p-4 rounded-2xl text-left transition-all hover:-translate-y-1"
                style={{
                  background: on ? 'rgba(74,127,255,0.14)' : 'var(--navy-mid)',
                  border: `1px solid ${on ? 'rgba(74,127,255,0.55)' : 'var(--border)'}`,
                }}>
                <span className="text-2xl inline-block mb-2 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{r.emoji}</span>
                <span className="block text-sm font-semibold" style={{ color: 'var(--white)' }}>{r.nom}</span>
                <span className="block text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--gray)' }}>{r.desc}</span>
                <span className="block text-[10px] font-bold mt-2" style={{ color: '#7aa2ff' }}>{count(r.nom)} contenu{count(r.nom) > 1 ? 's' : ''}</span>
              </motion.button>
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
            <p className="text-sm" style={{ color: 'var(--gray)' }}>{q.trim() ? 'Aucun contenu pour cette recherche.' : 'Les premiers contenus arrivent bientôt.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((a, i) => {
              const f = FORMATS[a.format] ?? FORMATS.article
              const une = i === 0 && !rubrique && !q.trim()
              return (
                <motion.div key={a.id} className={une ? 'md:col-span-2' : ''}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}>
                <Link href={`/savoir/${a.id}`}
                  className="group rounded-2xl overflow-hidden flex flex-col card-lift h-full"
                  style={{ background: 'var(--navy-card)', border: '1px solid var(--border)' }}>
                  <div className={`relative overflow-hidden ${une ? 'h-56 md:h-64' : 'h-40'}`}>
                    <Image src={a.image || FALLBACK_IMG} alt={a.titre} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes={une ? '(max-width:768px) 100vw, 780px' : '(max-width:768px) 100vw, 380px'} unoptimized={!!a.image && a.image.startsWith('http')} />
                    {une && <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'var(--red-fr)', color: '#fff' }}>À la une</span>}
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
                    <h3 className={`${une ? 'text-xl md:text-2xl' : 'text-base'} font-semibold leading-snug mb-2`} style={{ color: 'var(--white)' }}>{a.titre}</h3>
                    {a.resume && <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--gray)' }}>{a.resume}</p>}
                    <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#7aa2ff' }}>{f.cta} →</span>
                  </div>
                </Link>
                </motion.div>
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
            <button onClick={openAdhesion} className="btn-sport px-8 py-3.5 text-sm">
              Rejoindre l&apos;ANGB
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
