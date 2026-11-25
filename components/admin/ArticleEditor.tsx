'use client'

import { useRef, useState } from 'react'
import ArticleBody from '@/components/ArticleBody'

/**
 * Éditeur d'article pour /admin/articles : boutons de mise en forme + aperçu en direct.
 * Le texte part dans le formulaire sous le nom `name` (comme l'ancien champ).
 */
const TOOLS: { label: string; title: string; before: string; after?: string; block?: boolean; placeholder: string }[] = [
  { label: 'Titre',      title: 'Titre de section',      before: '## ',             block: true, placeholder: 'Titre de la section' },
  { label: 'Sous-titre', title: 'Sous-titre',            before: '### ',            block: true, placeholder: 'Sous-titre' },
  { label: 'G',          title: 'Gras',                  before: '**', after: '**',             placeholder: 'texte en gras' },
  { label: 'I',          title: 'Italique',              before: '*',  after: '*',              placeholder: 'texte en italique' },
  { label: '• Liste',    title: 'Liste à puces',         before: '- ',              block: true, placeholder: 'élément de la liste' },
  { label: '1. Liste',   title: 'Liste numérotée',       before: '1. ',             block: true, placeholder: 'première étape' },
  { label: '💡 Encadré', title: 'Encadré « À retenir »', before: '> **À retenir.** ', block: true, placeholder: 'la phrase importante' },
  { label: '🔗 Lien',    title: 'Lien',                  before: '[', after: '](https://)',      placeholder: 'texte du lien' },
  { label: '🖼️ Photo',   title: 'Photo dans le texte',   before: '![', after: '](/images/hardy.jpg)', block: true, placeholder: 'légende de la photo' },
  { label: '📚 Sources', title: 'Section Sources',       before: '## Sources\n\n1. ', block: true, placeholder: 'Auteur, titre, revue, année. [Voir sur PubMed](https://pubmed.ncbi.nlm.nih.gov/)' },
]

export default function ArticleEditor({ name, defaultValue = '' }: { name: string; defaultValue?: string }) {
  const [text, setText] = useState(defaultValue)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const ref = useRef<HTMLTextAreaElement>(null)

  const apply = (t: (typeof TOOLS)[number]) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = text.slice(s, e) || t.placeholder
    // Les blocs (titres, listes, encadrés…) commencent sur une nouvelle ligne, séparée par une ligne vide.
    const prefix = t.block && s > 0 && !text.slice(0, s).endsWith('\n\n') ? (text.slice(0, s).endsWith('\n') ? '\n' : '\n\n') : ''
    const insert = `${prefix}${t.before}${sel}${t.after ?? ''}`
    const next = text.slice(0, s) + insert + text.slice(e)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      const start = s + prefix.length + t.before.length
      el.setSelectionRange(start, start + sel.length)
    })
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const btn: React.CSSProperties = { padding: '5px 10px', borderRadius: 7, background: '#213460', border: '1px solid #2f4677', color: '#e2e8f0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
  const tabBtn = (on: boolean): React.CSSProperties => ({ ...btn, background: on ? '#5b8dff' : 'transparent', border: `1px solid ${on ? '#5b8dff' : '#2f4677'}` })

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        {TOOLS.map(t => (
          <button key={t.title} type="button" title={t.title} onClick={() => { setTab('write'); apply(t) }}
            style={{ ...btn, fontStyle: t.label === 'I' ? 'italic' : 'normal' }}>{t.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} className="lg:hidden">
          <button type="button" style={tabBtn(tab === 'write')} onClick={() => setTab('write')}>Écrire</button>
          <button type="button" style={tabBtn(tab === 'preview')} onClick={() => setTab('preview')}>Aperçu</button>
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
          <textarea ref={ref} name={name} value={text} onChange={e => setText(e.target.value)} rows={18}
            placeholder={'Écris ici. Une ligne vide sépare deux paragraphes.\n\nUtilise les boutons au-dessus pour les titres, listes, encadrés, photos et sources.'}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 10, background: '#0f1b33', border: '1px solid #2f4677', color: '#fff', fontSize: 14, lineHeight: 1.6, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }} />
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
            {words} mot{words > 1 ? 's' : ''} · environ {Math.max(1, Math.round(words / 200))} min de lecture
          </p>
        </div>
        <div className={tab === 'write' ? 'hidden lg:block' : ''}
          style={{ borderRadius: 10, border: '1px solid #2f4677', background: 'var(--navy)', padding: '6px 18px 18px', maxHeight: 560, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '8px 0 0' }}>Aperçu</p>
          {text.trim() ? <ArticleBody body={text} /> : <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 16 }}>L&apos;aperçu apparaît ici pendant que tu écris.</p>}
        </div>
      </div>
    </div>
  )
}
