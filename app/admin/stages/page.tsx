// Gestion des stages — réservé à l'admin. Création / édition / suppression.
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAdminEmail } from '@/lib/admin-auth'
import type { Stage } from '@/lib/types'

export const dynamic = 'force-dynamic'

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function readForm(fd: FormData) {
  const g = (k: string) => { const v = String(fd.get(k) ?? '').trim(); return v || null }
  return {
    titre: String(fd.get('titre') ?? '').trim(),
    organisateur: g('organisateur'), periode: g('periode'), date_debut: g('date_debut'),
    lieu: g('lieu'), audience: g('audience'), niveau: g('niveau'), tarif: g('tarif'),
    places: g('places'), description: g('description'), image: g('image'), lien: g('lien'),
    is_active: fd.get('is_active') === '1',
  }
}

async function createStageAction(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const p = readForm(fd)
  if (!p.titre) return
  await sb.from('stages').insert(p)
  revalidatePath('/admin/stages'); revalidatePath('/stages')
}

async function updateStageAction(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  if (!id) return
  await sb.from('stages').update(readForm(fd)).eq('id', id)
  revalidatePath('/admin/stages'); revalidatePath('/stages')
}

async function deleteStageAction(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  if (!id) return
  await sb.from('stages').delete().eq('id', id)
  revalidatePath('/admin/stages'); revalidatePath('/stages')
}

// ── UI ──────────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, background: '#070b15', border: '1px solid #1e293b', color: '#fff', fontSize: 13 }
const lab: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', margin: '0 0 3px' }

function Field({ name, label, def, type = 'text', req = false, full = false }: { name: string; label: string; def?: string | null; type?: string; req?: boolean; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      <label style={lab}>{label}{req ? ' *' : ''}</label>
      <input name={name} type={type} required={req} defaultValue={def ?? ''} style={inp} />
    </div>
  )
}

function StageForm({ s, action, submitLabel }: { s?: Stage; action: (fd: FormData) => Promise<void>; submitLabel: string }) {
  return (
    <form action={action} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {s && <input type="hidden" name="id" value={s.id} />}
      <Field name="titre" label="Titre" def={s?.titre} req full />
      <Field name="organisateur" label="Organisateur" def={s?.organisateur} />
      <Field name="periode" label="Période (libellé)" def={s?.periode} />
      <Field name="date_debut" label="Date de début" def={s?.date_debut?.slice(0, 10)} type="date" />
      <Field name="lieu" label="Lieu" def={s?.lieu} />
      <Field name="audience" label="Public" def={s?.audience} />
      <Field name="niveau" label="Niveau" def={s?.niveau} />
      <Field name="tarif" label="Tarif" def={s?.tarif} />
      <Field name="places" label="Places" def={s?.places} />
      <Field name="image" label="Image (chemin /images/… ou URL)" def={s?.image} full />
      <Field name="lien" label="Lien d'inscription" def={s?.lien} full />
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={lab}>Description</label>
        <textarea name="description" defaultValue={s?.description ?? ''} rows={2} style={{ ...inp, resize: 'vertical' }} />
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 14 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="is_active" value="1" defaultChecked={s ? s.is_active : true} /> Visible sur le site
        </label>
        <button type="submit" style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default async function AdminStagesPage() {
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
  const { data } = sb ? await sb.from('stages').select('*').order('date_debut', { ascending: true }) : { data: [] }
  const stages = (data ?? []) as Stage[]

  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 26, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>Gestion des stages</h1>
          <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #1e293b', background: '#0d1525', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
        </div>

        {/* Nouveau stage */}
        <div style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>➕ Ajouter un stage</h2>
          <StageForm action={createStageAction} submitLabel="Ajouter le stage" />
        </div>

        {/* Liste */}
        <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', margin: '0 0 12px' }}>
          {stages.length} stage{stages.length !== 1 ? 's' : ''}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {stages.map(s => (
            <div key={s.id} style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: 20, opacity: s.is_active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.titre} {!s.is_active && <span style={{ fontSize: 11, color: '#fbbf24' }}>· masqué</span>}</p>
                <form action={deleteStageAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>Supprimer</button>
                </form>
              </div>
              <StageForm s={s} action={updateStageAction} submitLabel="Enregistrer" />
            </div>
          ))}
          {stages.length === 0 && (
            <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: 24 }}>
              Aucun stage. Si la migration 013 n&apos;est pas encore lancée, exécute-la dans Supabase.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
