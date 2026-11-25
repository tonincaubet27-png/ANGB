'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'

/**
 * Mise en forme simple des articles (écrits depuis /admin/articles), sans HTML brut :
 *   ## Titre          ### Sous-titre
 *   - puce            1. liste numérotée
 *   > encadré « À retenir »
 *   ![légende](/images/photo.jpg)      photo pleine largeur (légende = texte entre crochets)
 *   **gras**  *italique*  [texte](https://lien)
 *   ---               séparateur
 * La section « ## Sources » est mise en forme à part (références scientifiques).
 */

const SAFE_URL = /^(https?:\/\/|\/)/i

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const k = `${keyBase}-${i++}`
    if (tok.startsWith('**')) {
      out.push(<strong key={k} style={{ color: 'var(--white)', fontWeight: 700 }}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('[')) {
      const mm = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (mm && SAFE_URL.test(mm[2])) {
        const ext = /^https?:/i.test(mm[2])
        out.push(
          <a key={k} href={mm[2]} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }}>{mm[1]}</a>
        )
      } else out.push(tok)
    } else {
      out.push(<em key={k}>{tok.slice(1, -1)}</em>)
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function ArticleBody({ body }: { body: string }) {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/).map(b => b.trim()).filter(Boolean)
  const nodes: ReactNode[] = []
  let inSources = false

  blocks.forEach((block, bi) => {
    const key = `b${bi}`
    const lines = block.split('\n')

    // Titres
    if (/^##\s+/.test(block) && lines.length === 1) {
      const t = block.replace(/^##\s+/, '')
      inSources = /^sources?$/i.test(t.trim()) || /^références?$/i.test(t.trim())
      nodes.push(
        <h2 key={key} className="flex items-center gap-3 mt-12 mb-4 text-3xl md:text-4xl"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1.1 }}>
          <span className="inline-block w-1.5 h-7 rounded-full" style={{ background: inSources ? 'var(--gray)' : 'var(--accent)' }} />
          {t}
        </h2>
      )
      return
    }
    if (/^###\s+/.test(block) && lines.length === 1) {
      nodes.push(
        <h3 key={key} className="mt-8 mb-2 text-lg font-bold" style={{ color: 'var(--white)' }}>
          {block.replace(/^###\s+/, '')}
        </h3>
      )
      return
    }
    if (/^---+$/.test(block)) {
      nodes.push(<hr key={key} className="my-10" style={{ border: 0, borderTop: '1px solid var(--border)' }} />)
      return
    }

    // Image : ![légende](/chemin.jpg)
    const img = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (img && SAFE_URL.test(img[2])) {
      nodes.push(
        <figure key={key} className="my-8">
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16 / 9', border: '1px solid var(--border)' }}>
            <Image src={img[2]} alt={img[1]} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover"
              unoptimized={/^https?:/i.test(img[2])} />
          </div>
          {img[1] && <figcaption className="mt-2 text-xs" style={{ color: 'var(--gray)' }}>{img[1]}</figcaption>}
        </figure>
      )
      return
    }

    // Encadré
    if (lines.every(l => l.startsWith('>'))) {
      const txt = lines.map(l => l.replace(/^>\s?/, '')).join(' ')
      nodes.push(
        <aside key={key} className="my-8 rounded-2xl p-5 md:p-6 flex gap-4"
          style={{ background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.3)' }}>
          <span className="text-2xl leading-none flex-shrink-0">💡</span>
          <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>{inline(txt, key)}</p>
        </aside>
      )
      return
    }

    // Listes
    if (lines.every(l => /^[-*]\s+/.test(l))) {
      nodes.push(
        <ul key={key} className="my-5 space-y-2.5">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-3 text-[15px] md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
              <span>{inline(l.replace(/^[-*]\s+/, ''), `${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      )
      return
    }
    if (lines.every(l => /^\d+[.)]\s+/.test(l))) {
      nodes.push(
        <ol key={key} className={inSources ? 'my-4 space-y-3' : 'my-6 space-y-4'}>
          {lines.map((l, i) => (
            <li key={i} className={`flex gap-4 leading-relaxed ${inSources ? 'text-sm' : 'text-[15px] md:text-base'}`}
              style={{ color: inSources ? 'var(--gray)' : 'rgba(255,255,255,0.8)' }}>
              <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: inSources ? 'var(--navy-mid)' : 'rgba(74,127,255,0.18)', color: inSources ? 'var(--gray)' : 'var(--accent)', border: '1px solid var(--border)' }}>
                {i + 1}
              </span>
              <span className="pt-0.5">{inline(l.replace(/^\d+[.)]\s+/, ''), `${key}-${i}`)}</span>
            </li>
          ))}
        </ol>
      )
      return
    }

    // Paragraphe
    nodes.push(
      <p key={key} className={`my-4 leading-[1.85] ${inSources ? 'text-sm' : 'text-[15px] md:text-[17px]'}`}
        style={{ color: inSources ? 'var(--gray)' : 'rgba(255,255,255,0.8)' }}>
        {lines.map((l, i) => (
          <span key={i}>{i > 0 && <br />}{inline(l, `${key}-${i}`)}</span>
        ))}
      </p>
    )
  })

  return <div>{nodes}</div>
}
