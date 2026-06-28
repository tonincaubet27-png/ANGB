// Statistiques agrégées et anonymisées du site (RGPD).
// Aucune donnée personnelle n'est exposée : uniquement des compteurs, des
// répartitions, et des lignes débarrassées des identifiants directs.
import { createClient } from '@supabase/supabase-js'

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    global: { fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }) },
  })
}

const STATUT_LABELS: Record<string, string> = {
  gardien_actif: 'Gardien actif', ancien_gardien: 'Ancien gardien',
  entraineur_gardien: 'Entraîneur gardien', entraineur: 'Entraîneur',
  joueur: 'Joueur', parent: 'Parent / tuteur', membre_soutien: 'Membre soutien',
}
function deriveCategory(statut?: string | null): string {
  const a = (statut ?? '').split(',').map(s => s.trim())
  if (a.includes('gardien_actif') || a.includes('ancien_gardien')) return 'Gardien'
  if (a.includes('entraineur_gardien')) return 'Entraîneur gardien'
  if (a.includes('entraineur')) return 'Entraîneur'
  if (a.includes('joueur')) return 'Joueur'
  if (a.includes('membre_soutien')) return 'Membre soutien'
  if (a.includes('parent')) return 'Parent'
  return 'Autre'
}
export function ageBracket(dob?: string | null): string {
  if (!dob) return 'NC'
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000))
  if (isNaN(age) || age < 0 || age > 120) return 'NC'
  if (age < 13) return 'Moins de 13'
  if (age <= 17) return '13-17'
  if (age <= 25) return '18-25'
  if (age <= 35) return '26-35'
  if (age <= 50) return '36-50'
  return '50+'
}
const ym = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 7) : '—')

export interface Distribution { label: string; count: number }
export interface SiteStats {
  generatedAt: string
  accounts: number
  activeMembers: number
  pending: number
  active7: number
  active30: number
  signups30: number
  threads: number
  posts: number
  listings: number
  messages: number
  adhesionTotal: number
  byStatus: { validated: number; pending: number; rejected: number }
  byCategory: Distribution[]
  byDivision: Distribution[]
  byRegion: Distribution[]
  byAge: Distribution[]
  adhesionsByMonth: Distribution[]
}

function tally(rows: (string | null | undefined)[], fallback = 'Non renseigné'): Distribution[] {
  const m: Record<string, number> = {}
  rows.forEach(r => { const k = (r && String(r).trim()) || fallback; m[k] = (m[k] ?? 0) + 1 })
  return Object.entries(m).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
}

export async function getSiteStats(): Promise<SiteStats | null> {
  const sb = svc()
  if (!sb) return null
  const now = Date.now(), day = 86400000

  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 })
  const users = usersData?.users ?? []
  const active7  = users.filter(u => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < 7 * day).length
  const active30 = users.filter(u => u.last_sign_in_at && now - new Date(u.last_sign_in_at).getTime() < 30 * day).length
  const signups30 = users.filter(u => u.created_at && now - new Date(u.created_at).getTime() < 30 * day).length

  const { data: profs } = await sb.from('profiles').select('membership_status')
  const activeMembers = (profs ?? []).filter(p => p.membership_status === 'active').length
  const pending       = (profs ?? []).filter(p => p.membership_status === 'pending').length

  const { data: adh } = await sb.from('adhesion_requests').select('status, statut, created_at, division, date_naissance')
  const A = adh ?? []
  const byStatus = {
    validated: A.filter(r => r.status === 'validated').length,
    pending:   A.filter(r => r.status === 'pending').length,
    rejected:  A.filter(r => r.status === 'rejected').length,
  }

  const { data: gps } = await sb.from('goalie_profiles').select('category, division, region').eq('is_active', true)
  const G = gps ?? []

  const count = async (table: string, activeOnly = false) => {
    let q = sb.from(table).select('*', { count: 'exact', head: true })
    if (activeOnly) q = q.eq('is_active', true)
    const { count: c } = await q
    return c ?? 0
  }
  const [threads, posts, listings, messages] = await Promise.all([
    count('threads'), count('posts'), count('listings', true), count('messages'),
  ])

  return {
    generatedAt: new Date().toISOString(),
    accounts: users.length,
    activeMembers, pending, active7, active30, signups30,
    threads, posts, listings, messages,
    adhesionTotal: A.length,
    byStatus,
    byCategory: tally(A.map(r => deriveCategory(r.statut))),
    byDivision: tally(G.map(g => g.division as string)),
    byRegion:   tally(G.map(g => g.region as string)),
    byAge:      tally(A.map(r => ageBracket(r.date_naissance))),
    adhesionsByMonth: tally(A.map(r => ym(r.created_at))).sort((a, b) => a.label.localeCompare(b.label)),
  }
}

/** Lignes anonymisées (sans identifiant direct) pour export — RGPD. */
export async function getAnonymizedRows(): Promise<string[][]> {
  const sb = svc()
  if (!sb) return []
  const { data } = await sb.from('adhesion_requests')
    .select('statut, division, club, cotisation, status, created_at, date_naissance')
    .order('created_at', { ascending: true })
  const header = ['categorie', 'division', 'club', 'cotisation', 'statut_validation', 'mois_inscription', 'tranche_age']
  const rows = (data ?? []).map(r => [
    deriveCategory(r.statut),
    (r.division ?? '').toString(),
    (r.club ?? '').toString(),
    (r.cotisation ?? '').toString(),
    (r.status ?? '').toString(),
    ym(r.created_at),
    ageBracket(r.date_naissance),
  ])
  return [header, ...rows]
}

export { STATUT_LABELS }
