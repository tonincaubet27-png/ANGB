// Validation des entraîneurs gardiens — seul le bureau décide qui apparaît sur la carte.
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAdminEmail } from '@/lib/admin-auth'
import { REGIONS_FR } from '@/lib/regions'

export const dynamic = 'force-dynamic'

interface Row { id: string; name: string; club: string | null; region: string | null; category: string; user_id: string | null; coach_verified: boolean; coach_zone: string | null }

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key) : null
}

async function setCoach(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  if (!id) return
  await sb.from('goalie_profiles').update({
    coach_verified: fd.get('verified') === '1',
    coach_zone: String(fd.get('zone') ?? '') || null,
  }).eq('id', id)
  revalidatePath('/admin/entraineurs')
}

async function addCoach(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const name = String(fd.get('name') ?? '').trim()
  const zone = String(fd.get('zone') ?? '')
  if (!name || !zone) return
  await sb.from('goalie_profiles').insert({
    name, club: String(fd.get('club') ?? '').trim() || null, region: zone,
    category: 'entraineur_gardien', coach_verified: true, coach_zone: zone, is_active: true,
  })
  revalidatePath('/admin/entraineurs')
}

async function removeCoach(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  // Ne supprime que les fiches ajoutées à la main (sans compte membre).
  if (id) await sb.from('goalie_profiles').delete().eq('id', id).is('user_id', null)
  revalidatePath('/admin/entraineurs')
}

const inp: React.CSSProperties = { boxSizing: 'border-box', padding: '7px 10px', borderRadius: 8, background: '#070b15', border: '1px solid #1e293b', color: '#fff', fontSize: 13 }
const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }

function ZoneSelect({ def }: { def?: string | null }) {
  return (
    <select name="zone" defaultValue={def ?? ''} style={inp}>
      <option value="">Zone…</option>
      {REGIONS_FR.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}

export default async function AdminEntraineursPage() {
  if (!getAdminEmail()) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15' }}>
        <Link href="/admin" style={{ color: '#4a7fff', fontSize: 13 }}>🔒 Se connecter →</Link>
      </main>
    )
  }
  const sb = svc()
  const { data, error } = sb
    ? await sb.from('goalie_profiles').select('id,name,club,region,category,user_id,coach_verified,coach_zone').eq('is_active', true).order('name')
    : { data: [], error: null }
  const rows = (data ?? []) as Row[]
  const valides = rows.filter(r => r.coach_verified)
  const autres = rows.filter(r => !r.coach_verified)

  const Line = ({ r }: { r: Row }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid #1e293b' }}>
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{r.name}</p>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
          {[r.club, r.region, r.category === 'entraineur_gardien' ? 'se déclare entraîneur gardien' : null, r.user_id ? null : 'ajouté à la main'].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      <form action={setCoach} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="hidden" name="id" value={r.id} />
        <input type="hidden" name="verified" value={r.coach_verified ? '0' : '1'} />
        <ZoneSelect def={r.coach_zone ?? (REGIONS_FR.includes(r.region ?? '') ? r.region : '')} />
        <button type="submit" style={r.coach_verified ? { ...btn, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' } : btn}>
          {r.coach_verified ? 'Retirer de la carte' : 'Valider'}
        </button>
      </form>
      {!r.user_id && (
        <form action={removeCoach}>
          <input type="hidden" name="id" value={r.id} />
          <button type="submit" style={{ ...btn, background: 'transparent', color: '#64748b', border: '1px solid #1e293b' }}>Supprimer</button>
        </form>
      )}
    </div>
  )

  const card: React.CSSProperties = { background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }
  const h2: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 12px' }

  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 18 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 26, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>Entraîneurs gardiens</h1>
          <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #1e293b', background: '#0d1525', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 24px' }}>
          Seuls les entraîneurs que tu valides ici apparaissent sur la carte publique. Personne ne peut s&apos;y ajouter seul.
        </p>
        {error && <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>⚠️ {error.message}</p>}

        <div style={card}>
          <h2 style={h2}>➕ Ajouter un entraîneur (même sans compte sur le site)</h2>
          <form action={addCoach} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input name="name" required placeholder="Prénom Nom" style={{ ...inp, flex: '1 1 160px' }} />
            <input name="club" placeholder="Club / structure" style={{ ...inp, flex: '1 1 160px' }} />
            <ZoneSelect />
            <button type="submit" style={btn}>Ajouter</button>
          </form>
        </div>

        <div style={card}>
          <h2 style={h2}>✅ Sur la carte ({valides.length})</h2>
          {valides.length === 0 ? <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Aucun entraîneur validé.</p> : valides.map(r => <Line key={r.id} r={r} />)}
        </div>

        <div style={card}>
          <h2 style={h2}>Membres du site ({autres.length})</h2>
          {autres.length === 0 ? <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Aucun membre pour l&apos;instant.</p> : autres.map(r => <Line key={r.id} r={r} />)}
        </div>
      </div>
    </main>
  )
}
