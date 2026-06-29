// Éditeur de contenu du site — réservé à l'admin.
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAdminEmail } from '@/lib/admin-auth'
import { CONTENT_FIELDS } from '@/lib/content-keys'

export const dynamic = 'force-dynamic'

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key) : null
}

async function saveContent(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const upserts: { key: string; value: string; updated_at: string }[] = []
  const deletes: string[] = []
  for (const f of CONTENT_FIELDS) {
    const v = String(fd.get(f.key) ?? '').trim()
    if (v && v !== f.def) upserts.push({ key: f.key, value: v, updated_at: new Date().toISOString() })
    else deletes.push(f.key)   // vide ou = défaut → on revient au défaut (suppression)
  }
  if (upserts.length) await sb.from('site_content').upsert(upserts, { onConflict: 'key' })
  if (deletes.length) await sb.from('site_content').delete().in('key', deletes)
  revalidatePath('/'); revalidatePath('/association')
}

const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 8, background: '#070b15', border: '1px solid #1e293b', color: '#fff', fontSize: 13 }

export default async function AdminContenuPage() {
  if (!getAdminEmail()) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <Link href="/admin" style={{ color: '#4a7fff', fontSize: 13 }}>Se connecter →</Link>
        </div>
      </main>
    )
  }

  const sb = svc()
  const { data } = sb ? await sb.from('site_content').select('key,value') : { data: [] }
  const current: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;((data ?? []) as any[]).forEach(r => { current[r.key] = r.value })

  // Groupes dans l'ordre d'apparition
  const groups: string[] = []
  CONTENT_FIELDS.forEach(f => { if (!groups.includes(f.group)) groups.push(f.group) })

  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 26, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>Contenu du site</h1>
          <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #1e293b', background: '#0d1525', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 24px' }}>
          Modifie les textes du site puis enregistre. Un champ vidé revient au texte par défaut.
        </p>

        <form action={saveContent}>
          {groups.map(group => (
            <div key={group} style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a7fff', margin: '0 0 14px' }}>{group}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {CONTENT_FIELDS.filter(f => f.group === group).map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', margin: '0 0 5px' }}>{f.label}</label>
                    {f.multiline
                      ? <textarea name={f.key} defaultValue={current[f.key] ?? f.def} rows={3} style={{ ...inp, resize: 'vertical' }} />
                      : <input name={f.key} defaultValue={current[f.key] ?? f.def} style={inp} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 10, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            💾 Enregistrer les modifications
          </button>
        </form>
      </div>
    </main>
  )
}
