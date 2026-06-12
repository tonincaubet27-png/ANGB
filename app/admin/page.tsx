// Page admin — accessible via /admin?key=ADMIN_SECRET
// Protection : compare la query ?key= à la variable d'env ADMIN_SECRET (server-side, jamais exposée)

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic' // pas de cache — données en temps réel

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdhesionRequest {
  id: string
  prenom: string
  nom: string
  email: string
  telephone: string | null
  date_naissance: string | null
  adresse: string | null
  club: string | null
  statut: string | null
  division: string | null
  categorie_enfant: string | null
  cotisation: string | null
  accept_statuts: boolean
  accept_rgpd: boolean
  autorisation_image: boolean
  status: 'pending' | 'validated' | 'rejected'
  created_at: string
}

// ── Libellés ──────────────────────────────────────────────────────────────────
const STATUT_LABELS: Record<string, string> = {
  gardien_actif:      'Gardien actif',
  ancien_gardien:     'Ancien gardien',
  entraineur_gardien: 'Entraîneur gardien',
  parent:             'Parent / tuteur',
  membre_soutien:     'Membre soutien',
}
const COTISATION_LABELS: Record<string, string> = {
  actif_20:   '20€ / an',
  soutien_10: '10€ / an',
  gratuit_0:  'Gratuité',
}

function formatStatut(raw: string | null): string {
  if (!raw) return '—'
  return raw.split(',').map(s => STATUT_LABELS[s.trim()] ?? s.trim()).join(', ')
}

// ── Server action — changer le statut ─────────────────────────────────────────
async function changeStatus(formData: FormData) {
  'use server'
  const id     = formData.get('id') as string
  const status = formData.get('status') as string
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key    = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  const supabase = createClient(url, key)
  await supabase.from('adhesion_requests').update({ status }).eq('id', id)
  revalidatePath('/admin')
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string; filter?: string }
}) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const secret = process.env.ADMIN_SECRET
  if (!secret || searchParams.key !== secret) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ fontSize: 14 }}>Accès refusé — clé invalide ou manquante</p>
        </div>
      </main>
    )
  }

  // ── Données Supabase ─────────────────────────────────────────────────────────
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let requests: AdhesionRequest[] = []
  let dbError = ''

  if (url && serviceKey && url.startsWith('http')) {
    try {
      const supabase = createClient(url, serviceKey)
      const filter = searchParams.filter ?? 'all'
      let query = supabase
        .from('adhesion_requests')
        .select('*')
        .order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) dbError = error.message
      else requests = (data ?? []) as AdhesionRequest[]
    } catch (e) {
      dbError = String(e)
    }
  } else {
    dbError = 'Supabase non configuré (SUPABASE_SERVICE_ROLE_KEY manquant)'
  }

  // ── Compteurs ────────────────────────────────────────────────────────────────
  const adminKey  = searchParams.key
  const filter    = searchParams.filter ?? 'all'
  const counts = {
    all:       requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    validated: requests.filter(r => r.status === 'validated').length,
    rejected:  requests.filter(r => r.status === 'rejected').length,
  }

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', background: '#070b15', padding: '32px 16px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 20 }} />
          <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 28, letterSpacing: '0.08em', color: '#fff', margin: '0 0 4px' }}>
            Administration — Demandes d'adhésion
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Association Nationale des Gardiens de But</p>
          <p style={{ fontSize: 12, color: '#f59e0b', margin: '8px 0 0', fontFamily: 'monospace' }}>
            DEBUG — requests.length: {requests.length} | dbError: &quot;{dbError}&quot;
          </p>
        </div>

        {/* Erreur DB */}
        {dbError && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 20 }}>
            ⚠️ {dbError}
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {([
            { key: 'all',       label: 'Toutes',    color: '#94a3b8' },
            { key: 'pending',   label: '⏳ En attente', color: '#fbbf24' },
            { key: 'validated', label: '✅ Validées',   color: '#34d399' },
            { key: 'rejected',  label: '❌ Refusées',   color: '#f87171' },
          ] as const).map(f => (
            <a
              key={f.key}
              href={`/admin?key=${adminKey}&filter=${f.key}`}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                background: filter === f.key ? 'rgba(74,127,255,0.15)' : '#0d1525',
                border: `1px solid ${filter === f.key ? '#4a7fff' : '#1e293b'}`,
                color: filter === f.key ? '#fff' : f.color,
              }}
            >
              {f.label} ({counts[f.key as keyof typeof counts]})
            </a>
          ))}
        </div>

        {/* Liste vide */}
        {requests.length === 0 && !dbError && (
          <div style={{ padding: 48, textAlign: 'center', color: '#475569', background: '#0d1525', borderRadius: 12, border: '1px solid #1e293b' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <p style={{ margin: 0, fontSize: 14 }}>Aucune demande{filter !== 'all' ? ' dans ce filtre' : ''}</p>
          </div>
        )}

        {/* Cartes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map(r => (
            <RequestCard key={r.id} r={r} adminKey={adminKey!} changeStatus={changeStatus} />
          ))}
        </div>

      </div>
    </main>
  )
}

// ── Carte d'une demande ───────────────────────────────────────────────────────
function RequestCard({
  r,
  adminKey,
  changeStatus,
}: {
  r: AdhesionRequest
  adminKey: string
  changeStatus: (fd: FormData) => Promise<void>
}) {
  const statusConfig = {
    pending:   { label: '⏳ En attente', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24' },
    validated: { label: '✅ Validée',    bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399' },
    rejected:  { label: '❌ Refusée',    bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
  }
  const sc = statusConfig[r.status] ?? statusConfig.pending

  const date = new Date(r.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{ background: '#0d1525', border: '1px solid #1e293b', borderRadius: 12, padding: '20px 24px' }}>
      {/* En-tête de la carte */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>
            {r.prenom} {r.nom}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#4a7fff' }}>{r.email}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569' }}>{date}</p>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
          {sc.label}
        </span>
      </div>

      {/* Infos en grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px 16px', marginBottom: 16 }}>
        {[
          ['Statut(s)',    formatStatut(r.statut)],
          ['Division',     r.division || '—'],
          ['Club',         r.club || '—'],
          ['Cotisation',   COTISATION_LABELS[r.cotisation ?? ''] ?? r.cotisation ?? '—'],
          ['Téléphone',    r.telephone || '—'],
          ...(r.categorie_enfant ? [['Cat. enfant', r.categorie_enfant] as [string, string]] : []),
        ].map(([label, value]) => (
          <div key={label}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', marginTop: 2 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Checkboxes acceptations */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: r.accept_statuts ? '#34d399' : '#f87171' }}>
          {r.accept_statuts ? '✓' : '✗'} Statuts acceptés
        </span>
        <span style={{ fontSize: 11, color: r.accept_rgpd ? '#34d399' : '#f87171' }}>
          {r.accept_rgpd ? '✓' : '✗'} RGPD accepté
        </span>
        {r.autorisation_image && (
          <span style={{ fontSize: 11, color: '#34d399' }}>✓ Autorisation image</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {r.status !== 'validated' && (
          <form action={changeStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="validated" />
            <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
              ✅ Valider
            </button>
          </form>
        )}
        {r.status !== 'pending' && (
          <form action={changeStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="pending" />
            <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              ⏳ Remettre en attente
            </button>
          </form>
        )}
        {r.status !== 'rejected' && (
          <form action={changeStatus}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="status" value="rejected" />
            <button type="submit" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              ❌ Refuser
            </button>
          </form>
        )}
        <a
          href={`mailto:${r.email}?subject=Votre adhésion à l'ANGB`}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.2)', color: '#4a7fff' }}
        >
          📧 Répondre
        </a>
      </div>
    </div>
  )
}
