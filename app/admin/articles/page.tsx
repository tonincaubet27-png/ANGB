// Gestion des savoirs et des actualités — réservé à l'admin.
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAdminEmail } from '@/lib/admin-auth'
import { RUBRIQUES, RUBRIQUE_ACTUS, FORMATS } from '@/lib/rubriques'
import type { Article } from '@/lib/types'
import ArticleEditor from '@/components/admin/ArticleEditor'

export const dynamic = 'force-dynamic'

type Row = Article & { article_bodies: { body: string; lien: string | null } | { body: string; lien: string | null }[] | null }

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key) : null
}

async function saveArticle(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const txt = (k: string) => String(fd.get(k) ?? '').trim()
  const titre = txt('titre')
  if (!titre) return

  // Image : fichier envoyé (prioritaire) ou chemin / adresse saisie
  let image: string | null = txt('image') || null
  const file = fd.get('image_file')
  if (file instanceof File && file.size > 0 && file.type.startsWith('image/')) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `articles/${Date.now()}.${ext}`
    const { error } = await sb.storage.from('goalie-avatars').upload(path, file, { contentType: file.type })
    if (!error) image = sb.storage.from('goalie-avatars').getPublicUrl(path).data.publicUrl
  }

  const fields = {
    titre, rubrique: txt('rubrique'), format: txt('format') || 'article',
    resume: txt('resume') || null, image,
    members_only: fd.get('members_only') === '1',
    is_published: fd.get('is_published') === '1',
  }
  let id = txt('id')
  if (id) {
    await sb.from('articles').update(fields).eq('id', id)
  } else {
    const { data } = await sb.from('articles').insert(fields).select('id').single()
    id = (data as { id: string } | null)?.id ?? ''
  }
  if (id) await sb.from('article_bodies').upsert({ article_id: id, body: txt('body'), lien: txt('lien') || null }, { onConflict: 'article_id' })
  revalidatePath('/admin/articles')
}

async function deleteArticle(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  if (id) await sb.from('articles').delete().eq('id', id)
  revalidatePath('/admin/articles')
}

const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, background: '#0f1b33', border: '1px solid #2f4677', color: '#fff', fontSize: 13 }
const lab: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', margin: '0 0 3px' }
const full: React.CSSProperties = { gridColumn: '1 / -1' }

function ArticleForm({ a, submitLabel }: { a?: Row; submitLabel: string }) {
  const b = Array.isArray(a?.article_bodies) ? a?.article_bodies[0] : a?.article_bodies
  return (
    <form action={saveArticle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {a && <input type="hidden" name="id" value={a.id} />}
      <div style={full}><label style={lab}>Titre *</label><input name="titre" required defaultValue={a?.titre ?? ''} style={inp} /></div>
      <div>
        <label style={lab}>Rubrique</label>
        <select name="rubrique" defaultValue={a?.rubrique ?? RUBRIQUES[0].nom} style={inp}>
          {RUBRIQUES.map(r => <option key={r.nom} value={r.nom}>Savoirs · {r.nom}</option>)}
          <option value={RUBRIQUE_ACTUS}>Page Actualités</option>
        </select>
      </div>
      <div>
        <label style={lab}>Format</label>
        <select name="format" defaultValue={a?.format ?? 'article'} style={inp}>
          {Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </select>
      </div>
      <div style={full}><label style={lab}>Résumé (visible par tous)</label><textarea name="resume" rows={2} defaultValue={a?.resume ?? ''} style={{ ...inp, resize: 'vertical' }} /></div>
      <div style={full}><label style={lab}>Texte complet</label><ArticleEditor name="body" defaultValue={b?.body ?? ''} /></div>
      <div style={full}><label style={lab}>Lien (YouTube, Instagram, TikTok, podcast…)</label><input name="lien" type="url" defaultValue={b?.lien ?? ''} placeholder="https://…" style={inp} /></div>
      <div><label style={lab}>Image : envoyer un fichier (4 Mo max)</label><input name="image_file" type="file" accept="image/*" style={{ ...inp, padding: 6 }} /></div>
      <div><label style={lab}>…ou adresse de l&apos;image</label><input name="image" defaultValue={a?.image ?? ''} placeholder="/images/hardy.jpg" style={inp} /></div>
      <div style={{ ...full, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="members_only" value="1" defaultChecked={a?.members_only ?? false} /> 🔒 Réservé aux membres
        </label>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="is_published" value="1" defaultChecked={a ? a.is_published : true} /> Publié
        </label>
        <button type="submit" style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>{submitLabel}</button>
      </div>
    </form>
  )
}

export default async function AdminArticlesPage() {
  if (!getAdminEmail()) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1b33' }}>
        <Link href="/admin" style={{ color: '#4a7fff', fontSize: 13 }}>🔒 Se connecter →</Link>
      </main>
    )
  }
  const sb = svc()
  const { data, error } = sb
    ? await sb.from('articles').select('*, article_bodies(body, lien)').order('published_at', { ascending: false })
    : { data: [], error: null }
  const articles = (data ?? []) as Row[]

  return (
    <main style={{ minHeight: '100vh', background: '#0f1b33', padding: '32px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 26, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>Savoirs & actualités</h1>
          <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #2f4677', background: '#16264a', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 24px' }}>
          Le résumé est visible par tous. Si « Réservé aux membres » est coché, le texte complet et le lien ne sont lisibles que par les adhérents validés.
        </p>
        {error && <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>⚠️ {error.message}</p>}

        <div style={{ background: '#16264a', border: '1px solid #2f4677', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>➕ Nouveau contenu</h2>
          <ArticleForm submitLabel="Publier" />
        </div>

        <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 12px' }}>
          {articles.length} contenu{articles.length !== 1 ? 's' : ''}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.map(a => (
            <details key={a.id} style={{ background: '#16264a', border: '1px solid #2f4677', borderRadius: 12, padding: '14px 20px', opacity: a.is_published ? 1 : 0.6 }}>
              <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {a.titre}
                <span style={{ fontWeight: 400, color: '#94a3b8' }}> · {a.rubrique}{a.members_only ? ' · 🔒' : ''}{a.is_published ? '' : ' · brouillon'}</span>
              </summary>
              <div style={{ marginTop: 14 }}>
                <ArticleForm a={a} submitLabel="Enregistrer" />
                <form action={deleteArticle} style={{ marginTop: 10 }}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>Supprimer</button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  )
}
