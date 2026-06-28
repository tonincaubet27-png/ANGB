// Page admin · accès réservé au bureau.
// Authentification : connexion email + mot de passe d'un compte ANGB réel, vérifiée
// côté serveur, dont l'email figure dans l'allowlist ADMIN_EMAILS → cookie httpOnly
// signé (cf. lib/admin-auth). Aucun secret dans l'URL. Les server actions revérifient.

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sendMail, buildMemberCardEmail } from '@/lib/email'
import { getAdminEmail, isAdminEmail, makeToken, ADMIN_COOKIE, ADMIN_MAX_AGE } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic' // pas de cache · données en temps réel

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
  member_no: number | null
  created_at: string
}

// ── Libellés ──────────────────────────────────────────────────────────────────
const STATUT_LABELS: Record<string, string> = {
  gardien_actif:      'Gardien actif',
  ancien_gardien:     'Ancien gardien',
  entraineur_gardien: 'Entraîneur gardien',
  entraineur:         'Entraîneur',
  joueur:             'Joueur',
  parent:             'Parent / tuteur',
  membre_soutien:     'Membre soutien',
}
const COTISATION_LABELS: Record<string, string> = {
  actif_20:   '20€ / an',
  soutien_10: '10€ / an',
  gratuit_0:  'Gratuité',
}

function formatStatut(raw: string | null): string {
  if (!raw) return '·'
  return raw.split(',').map(s => STATUT_LABELS[s.trim()] ?? s.trim()).join(', ')
}

/** Catégorie d'annuaire déduite des statuts (pour la carte de membre) */
function deriveCategory(statut?: string | null): string | null {
  const arr = (statut ?? '').split(',').map(s => s.trim())
  if (arr.includes('gardien_actif') || arr.includes('ancien_gardien')) return 'gardien'
  if (arr.includes('entraineur_gardien')) return 'entraineur_gardien'
  if (arr.includes('entraineur'))         return 'entraineur'
  if (arr.includes('joueur'))             return 'joueur'
  if (arr.includes('membre_soutien'))     return 'membre_soutien'
  return null
}

// ── Server action · changer le statut ─────────────────────────────────────────
// Valider/refuser une adhésion met aussi à jour le statut de membre du compte lié
// (membership_status), ce qui débloque ou bloque l'accès au forum / dépôt d'annonce.
async function changeStatus(formData: FormData) {
  'use server'
  // Server action protégée : appelable uniquement par un admin authentifié (cookie signé).
  if (!getAdminEmail()) return
  const id     = formData.get('id') as string
  const status = formData.get('status') as string
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key    = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  const supabase = createClient(url, key)

  // 1 · statut de la demande
  const { data: updated } = await supabase
    .from('adhesion_requests')
    .update({ status })
    .eq('id', id)
    .select('user_id, prenom, nom, email, statut, member_no, club, division')
    .single()

  const row = updated as {
    user_id?: string; prenom?: string; nom?: string; email?: string
    statut?: string; member_no?: number | null; club?: string | null; division?: string | null
  } | null

  // 2 · statut de membre sur le compte lié + visibilité de la fiche annuaire
  const userId = row?.user_id
  if (userId) {
    const membership =
      status === 'validated' ? 'active'
      : status === 'rejected' ? 'rejected'
      : 'pending'
    await supabase.from('profiles').update({ membership_status: membership }).eq('id', userId)
    if (status === 'validated') {
      // Garantit que le membre validé a bien une fiche annuaire liée à son compte
      await ensureGoalieProfile(userId, row!)
    } else {
      // Masque la fiche tant que la demande n'est pas validée
      await supabase.from('goalie_profiles').update({ is_active: false }).eq('user_id', userId)
    }
  }

  // 3 · À la validation : numéro d'adhérent séquentiel (1, 2, 3…) + email carte
  if (status === 'validated' && row?.email) {
    // Attribue le n° une seule fois : le 1er validé = 1, puis max + 1
    let memberNo = row.member_no ?? null
    if (memberNo == null) {
      const { data: maxRow } = await supabase
        .from('adhesion_requests')
        .select('member_no')
        .not('member_no', 'is', null)
        .order('member_no', { ascending: false })
        .limit(1)
        .maybeSingle()
      memberNo = (((maxRow as { member_no?: number } | null)?.member_no) ?? 0) + 1
      await supabase.from('adhesion_requests').update({ member_no: memberNo }).eq('id', id)
    }
    await sendMail({
      to:      row.email,
      subject: '🎉 Bienvenue à l’ANGB · votre carte de membre',
      html:    buildMemberCardEmail({
        prenom: row.prenom ?? '',
        nom: row.nom ?? '',
        category: deriveCategory(row.statut),
        memberNumber: String(memberNo),
      }),
    })
  }

  revalidatePath('/admin')
}

// ── Fiche annuaire : création/liaison garantie à la validation ──────────────────
// Évite le bug « profil en préparation » pour un membre validé qui n'aurait pas de
// fiche liée (compte créé via OAuth, import/seed, ou insertion échouée à l'adhésion).
async function ensureGoalieProfile(
  userId: string,
  row: { prenom?: string; nom?: string; statut?: string; club?: string | null; division?: string | null },
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  const supabase = createClient(url, key)

  const category = deriveCategory(row.statut)
  if (!category) return // ex. parent seul → pas de fiche annuaire

  // Déjà une fiche liée ? → on la rend simplement visible
  const { data: existing } = await supabase
    .from('goalie_profiles').select('id').eq('user_id', userId).maybeSingle()
  if (existing) {
    await supabase.from('goalie_profiles').update({ is_active: true }).eq('user_id', userId)
    return
  }

  const name = `${row.prenom ?? ''} ${row.nom ?? ''}`.trim()

  // Une fiche orpheline (import/seed) au même nom ? → on la lie au compte
  const { data: orphan } = await supabase
    .from('goalie_profiles').select('id').is('user_id', null).ilike('name', name).maybeSingle()
  if (orphan) {
    await supabase.from('goalie_profiles')
      .update({ user_id: userId, is_active: true }).eq('id', (orphan as { id: string }).id)
    return
  }

  // Sinon, création
  await supabase.from('goalie_profiles').insert({
    user_id: userId, name, category,
    club: row.club || null, division: row.division || null, is_active: true,
  })
}

// ── Server actions · connexion / déconnexion admin ──────────────────────────────
async function adminLogin(formData: FormData) {
  'use server'
  const email    = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Diagnostic explicite (sinon échec silencieux = "rien ne se passe")
  if (!url || !anon || !process.env.ADMIN_SECRET || !(process.env.ADMIN_EMAILS || '').trim()) {
    redirect('/admin?err=config')          // variables d'environnement manquantes
  }
  if (!isAdminEmail(email)) redirect('/admin?err=auth')   // email pas dans l'allowlist
  const sb = createClient(url, anon)
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error || !data?.user) redirect('/admin?err=creds')  // mot de passe invalide
  cookies().set(ADMIN_COOKIE, makeToken(email), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   ADMIN_MAX_AGE,
  })
  redirect('/admin?ok=1')
}

async function adminLogout() {
  'use server'
  cookies().delete(ADMIN_COOKIE)
  redirect('/admin')
}

// ── Écran de connexion ──────────────────────────────────────────────────────────
function AdminLogin({ error, configured, cookieRejected }: { error?: string; configured: boolean; cookieRejected?: boolean }) {
  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', marginBottom: 10,
    borderRadius: 8, background: '#070b15', border: '1px solid #1e293b', color: '#fff', fontSize: 14,
  }
  // Message selon le diagnostic
  const msg =
    cookieRejected   ? 'Connexion acceptée mais session non validée → la variable ADMIN_SECRET est manquante ou différente sur Vercel. Ajoute-la (Settings → Environment Variables) puis Redeploy.'
    : error === 'config' ? 'Configuration serveur incomplète : ADMIN_SECRET et/ou ADMIN_EMAILS ne sont pas définies sur Vercel. Ajoute-les puis Redeploy.'
    : error === 'auth' ? 'Cet email n’est pas autorisé (il doit figurer dans ADMIN_EMAILS).'
    : error === 'creds' ? 'Mot de passe incorrect pour ce compte.'
    : error ? 'Identifiants invalides ou accès non autorisé.'
    : ''
  const warn = msg && (cookieRejected || error === 'config')
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b15', padding: 16 }}>
      <form action={adminLogin} style={{ width: '100%', maxWidth: 360, background: '#0d1525', border: '1px solid #1e293b', borderRadius: 16, padding: 28 }}>
        <div style={{ height: 4, background: 'linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)', borderRadius: 4, marginBottom: 20 }} />
        <h1 style={{ fontSize: 20, color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>Administration ANGB</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px' }}>Réservé au bureau. Connecte-toi avec ton compte ANGB.</p>
        {!configured && !msg && (
          <p style={{ fontSize: 12, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '8px 12px', margin: '0 0 14px' }}>
            ⚠️ Variables ADMIN_SECRET / ADMIN_EMAILS absentes : la connexion ne pourra pas aboutir tant qu’elles ne sont pas réglées sur Vercel (puis Redeploy).
          </p>
        )}
        {msg && (
          <p style={{ fontSize: 12, color: warn ? '#fbbf24' : '#fca5a5', background: warn ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${warn ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '8px 12px', margin: '0 0 14px', lineHeight: 1.5 }}>
            {msg}
          </p>
        )}
        <input name="email"    type="email"    required placeholder="Email"         autoComplete="username"        style={inputStyle} />
        <input name="password" type="password" required placeholder="Mot de passe"  autoComplete="current-password" style={{ ...inputStyle, marginBottom: 16 }} />
        <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 8, background: '#4a7fff', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
          Se connecter
        </button>
      </form>
    </main>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { filter?: string; err?: string; ok?: string }
}) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const adminConfigured = Boolean(process.env.ADMIN_SECRET) && (process.env.ADMIN_EMAILS || '').trim().length > 0
  const adminEmail = getAdminEmail()
  if (!adminEmail) {
    // ?ok=1 mais toujours pas connecté = cookie posé puis rejeté → souci ADMIN_SECRET
    return <AdminLogin error={searchParams.err} configured={adminConfigured} cookieRejected={searchParams.ok === '1'} />
  }

  // ── Données Supabase ─────────────────────────────────────────────────────────
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let requests: AdhesionRequest[] = []
  let dbError = ''

  if (url && serviceKey && url.startsWith('http')) {
    try {
      // cache: 'no-store' obligatoire · Next.js 14 met en cache les fetch des Server Components
    const supabase = createClient(url, serviceKey, {
      global: { fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }) },
    })
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-bebas, sans-serif)', fontSize: 28, letterSpacing: '0.08em', color: '#fff', margin: '0 0 4px' }}>
                Administration · Demandes d'adhésion
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Association Nationale des Gardiens de But</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <a href="/admin/stats" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', background: 'rgba(74,127,255,0.15)', border: '1px solid rgba(74,127,255,0.4)', color: '#4a7fff' }}>
                📊 Statistiques
              </a>
              <form action={adminLogout}>
                <span style={{ fontSize: 11, color: '#475569', marginRight: 10 }}>🔓 {adminEmail}</span>
                <button type="submit" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#0d1525', border: '1px solid #1e293b', color: '#94a3b8' }}>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
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
              href={`/admin?filter=${f.key}`}
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
            <RequestCard key={r.id} r={r} changeStatus={changeStatus} />
          ))}
        </div>

      </div>
    </main>
  )
}

// ── Carte d'une demande ───────────────────────────────────────────────────────
function RequestCard({
  r,
  changeStatus,
}: {
  r: AdhesionRequest
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

  // « Répondre » → ouvre Gmail en rédaction (depuis angbcontact@gmail.com si connecté),
  // adressé à l'adhérent, avec sujet + message pré-remplis.
  const replySubject = `Votre adhésion à l'ANGB`
  const replyBody = `Bonjour ${r.prenom},\n\nNous revenons vers vous concernant votre demande d'adhésion à l'Association Nationale des Gardiens de But.\n\n\n\nSportivement,\nLe bureau de l'ANGB`
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(r.email)}&su=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`

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
          ['Division',     r.division || '·'],
          ['Club',         r.club || '·'],
          ['Cotisation',   COTISATION_LABELS[r.cotisation ?? ''] ?? r.cotisation ?? '·'],
          ['Téléphone',    r.telephone || '·'],
          ...(r.member_no ? [['N° membre', `#${r.member_no}`] as [string, string]] : []),
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
          href={gmailHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.2)', color: '#4a7fff' }}
        >
          📧 Répondre
        </a>
      </div>
    </div>
  )
}
