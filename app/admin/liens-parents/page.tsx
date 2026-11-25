// Validation des liens parent-enfant : un lien n'est actif qu'après accord du bureau.
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getAdminEmail } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

interface LinkRow {
  id: string; status: string; created_at: string
  parent: { display_name: string } | null
  goalie: { name: string; club: string | null } | null
}

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key) : null
}

async function decide(fd: FormData) {
  'use server'
  if (!getAdminEmail()) return
  const sb = svc(); if (!sb) return
  const id = String(fd.get('id') ?? '')
  const status = String(fd.get('status') ?? '')
  if (!id || !['approved', 'rejected', 'pending'].includes(status)) return
  await sb.from('parent_child_links').update({ status }).eq('id', id)
  revalidatePath('/admin/liens-parents')
}

const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }
const card: React.CSSProperties = { background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }

export default async function AdminLiensParentsPage() {
  if (!getAdminEmail()) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15' }}>
        <Link href="/admin" style={{ color: '#4a7fff', fontSize: 13 }}>🔒 Se connecter →</Link>
      </main>
    )
  }
  const sb = svc()
  const { data, error } = sb
    ? await sb.from('parent_child_links')
        .select('id,status,created_at,parent:profiles!parent_user_id(display_name),goalie:goalie_profiles!goalie_profile_id(name,club)')
        .order('created_at', { ascending: false })
    : { data: [], error: null }
  const rows = (data ?? []) as unknown as LinkRow[]
  const attente = rows.filter(r => r.status === 'pending')
  const autres = rows.filter(r => r.status !== 'pending')

  const Line = ({ r }: { r: LinkRow }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid #1e293b' }}>
      <div style={{ flex: '1 1 220px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
          {r.parent?.display_name || 'Parent'} → {r.goalie?.name || 'Profil supprimé'}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
          {[r.goalie?.club, new Date(r.created_at).toLocaleDateString('fr-FR'), r.status === 'approved' ? 'validé' : r.status === 'rejected' ? 'refusé' : 'en attente'].filter(Boolean).join(' · ')}
        </p>
      </div>
      {(['approved', 'rejected'] as const).filter(st => st !== r.status).map(st => (
        <form key={st} action={decide}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="status" value={st} />
          <button type="submit" style={st === 'approved' ? btn : { ...btn, background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            {st === 'approved' ? 'Valider' : 'Refuser'}
          </button>
        </form>
      ))}
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 26, letterSpacing: '0.08em', color: '#fff', margin: 0 }}>Liens parents</h1>
          <Link href="/admin" style={{ fontSize: 12, color: '#94a3b8', border: '1px solid #1e293b', background: '#0d1525', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>← Admin</Link>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 24px' }}>
          Un parent ne peut modifier la fiche d&apos;un enfant qu&apos;après ta validation. Pour un mineur de moins de 15 ans, vérifie le consentement parental avant de valider.
        </p>
        {error && <p style={{ fontSize: 13, color: '#fca5a5' }}>⚠️ {error.message}</p>}
        <div style={card}>
          <h2 style={{ fontSize: 14, color: '#fff', margin: '0 0 12px' }}>⏳ En attente ({attente.length})</h2>
          {attente.length === 0 ? <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Aucune demande.</p> : attente.map(r => <Line key={r.id} r={r} />)}
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 14, color: '#fff', margin: '0 0 12px' }}>Historique ({autres.length})</h2>
          {autres.length === 0 ? <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>Rien pour l&apos;instant.</p> : autres.map(r => <Line key={r.id} r={r} />)}
        </div>
      </div>
    </main>
  )
}
