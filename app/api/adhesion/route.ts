import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'angbcontact@gmail.com'

// ── Libellés lisibles ─────────────────────────────────────────────────────────
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
  actif_20:   'Membre actif · 20€/an',
  soutien_10: 'Membre soutien · 10€/an',
  gratuit_0:  'Gratuité 1re année · 0€',
}

function formatStatut(raw: unknown): string {
  if (!raw) return '·'
  return String(raw)
    .split(',')
    .map(s => STATUT_LABELS[s.trim()] ?? s.trim())
    .join(', ')
}

/** Déduit le rôle de compte (gardien/parent) à partir des statuts cochés */
function deriveRole(statut: unknown): 'gardien' | 'parent' {
  const arr = String(statut ?? '').split(',').map(s => s.trim())
  const isGardien = arr.some(s => ['gardien_actif', 'ancien_gardien', 'entraineur_gardien'].includes(s))
  if (arr.includes('parent') && !isGardien) return 'parent'
  return 'gardien'
}

/** Déduit la catégorie d'annuaire à partir des statuts cochés (null = pas de fiche, ex. parent seul) */
function deriveCategory(statut: unknown): string | null {
  const arr = String(statut ?? '').split(',').map(s => s.trim())
  if (arr.includes('gardien_actif') || arr.includes('ancien_gardien')) return 'gardien'
  if (arr.includes('entraineur_gardien')) return 'entraineur_gardien'
  if (arr.includes('entraineur'))         return 'entraineur'
  if (arr.includes('joueur'))             return 'joueur'
  if (arr.includes('membre_soutien'))     return 'membre_soutien'
  return null
}

// ── POST /api/adhesion ────────────────────────────────────────────────────────
// L'adhésion fait aussi office d'inscription : on crée le compte (en attente),
// on enregistre la demande, et le bureau valide ensuite dans /admin.
export async function POST(req: NextRequest) {
  const payload = await req.json() as Record<string, unknown>
  const warnings: string[] = []

  const email    = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '')

  // Validation minimale
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Email invalide.' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: 'Mot de passe : 6 caractères minimum.' }, { status: 400 })
  }

  // Le mot de passe ne doit jamais être stocké hors de l'auth Supabase
  const { password: _pw, ...adhesionFields } = payload

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const configured  = Boolean(supabaseUrl && serviceKey && supabaseUrl.startsWith('http'))

  if (configured) {
    const supabase = createClient(supabaseUrl!, serviceKey!)
    const displayName = `${payload.prenom ?? ''} ${payload.nom ?? ''}`.trim()
    const role = deriveRole(payload.statut)

    // 1 · Création du compte (confirmé d'office → connexion immédiate possible)
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName, role },
    })

    if (authErr || !created?.user) {
      const msg = (authErr?.message ?? '').toLowerCase()
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        return NextResponse.json(
          { ok: false, code: 'email_exists', error: 'Un compte existe déjà avec cet email. Connectez-vous pour adhérer.' },
          { status: 409 },
        )
      }
      return NextResponse.json({ ok: false, error: `Création du compte : ${authErr?.message ?? 'inconnue'}` }, { status: 500 })
    }

    const userId = created.user.id

    // 2 · Profil (en attente de validation)
    const { error: profErr } = await supabase.from('profiles').upsert(
      { id: userId, role, display_name: displayName, membership_status: 'pending' },
      { onConflict: 'id' },
    )
    if (profErr) {
      // Compte créé mais profil KO → on supprime le compte pour permettre une nouvelle tentative propre
      await supabase.auth.admin.deleteUser(userId).catch(() => {})
      return NextResponse.json({ ok: false, error: `Profil : ${profErr.message}` }, { status: 500 })
    }

    // 3 · Demande d'adhésion liée au compte
    const { error: adhErr } = await supabase.from('adhesion_requests').insert({
      ...adhesionFields,
      email,
      user_id: userId,
      status: 'pending',
    })
    if (adhErr) {
      return NextResponse.json({ ok: false, error: `Adhésion : ${adhErr.message}` }, { status: 500 })
    }

    // 4 · Fiche annuaire (catégorie selon le statut) · cachée jusqu'à validation
    //     du bureau (is_active = false). « parent seul » → pas de fiche.
    const category = deriveCategory(payload.statut)
    if (category) {
      const { error: profileErr } = await supabase.from('goalie_profiles').insert({
        user_id:  userId,
        name:     displayName,
        category,
        club:     payload.club || null,
        division: payload.division || null,
        is_active: false,
      })
      if (profileErr) warnings.push(`Fiche annuaire : ${profileErr.message}`)  // non bloquant
    }
  }

  // 5 · Email de notification au bureau (best-effort, via Gmail)
  const notif = await sendMail({
    to:      ADMIN_EMAIL,
    subject: `🏒 Nouvelle adhésion · ${payload.prenom} ${payload.nom}`,
    html:    buildEmailHtml(payload),
  })
  if (!notif.ok && notif.error) warnings.push(`Email : ${notif.error}`)

  return NextResponse.json({ ok: true, warnings: warnings.length ? warnings : undefined })
}

// ── Template email ────────────────────────────────────────────────────────────
function buildEmailHtml(p: Record<string, unknown>): string {
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const rows = [
    ['Prénom',               p.prenom],
    ['Nom',                  p.nom],
    ['Email',                p.email],
    ['Téléphone',            p.telephone || '·'],
    ['Date de naissance',    p.date_naissance || '·'],
    ['Adresse',              p.adresse || '·'],
    ['Club',                 p.club || '·'],
    ['Statut(s)',            formatStatut(p.statut)],
    ['Division / niveau',    p.division || '·'],
    ['Catégorie enfant',     p.categorie_enfant || '·'],
    ['Cotisation',           COTISATION_LABELS[String(p.cotisation ?? '')] || p.cotisation || '·'],
    ['Accepte les statuts',  p.accept_statuts ? '✅ Oui' : '❌ Non'],
    ['Accepte le RGPD',      p.accept_rgpd    ? '✅ Oui' : '❌ Non'],
    ['Autorisation image',   p.autorisation_image ? '✅ Oui' : '·'],
  ] satisfies [string, unknown][]

  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;width:42%;vertical-align:top">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#f1f5f9;font-size:13px;font-weight:500">${String(value ?? '·')}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#0d1525;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
    <!-- Header tricolore -->
    <div style="height:4px;background:linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)"></div>

    <div style="padding:28px 32px">
      <!-- Titre -->
      <h1 style="margin:0 0 4px;color:#fff;font-size:22px;letter-spacing:0.05em">🏒 Nouvelle demande d'adhésion</h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:13px">Association Nationale des Gardiens de But</p>

      <!-- Encart action -->
      <div style="margin:0 0 20px;padding:12px 16px;background:rgba(251,191,36,0.1);border-radius:8px;border:1px solid rgba(251,191,36,0.3)">
        <p style="margin:0;font-size:13px;color:#fbbf24">⏳ Compte créé en attente · à valider dans l'espace admin pour activer l'accès.</p>
      </div>

      <!-- Tableau des infos -->
      <table style="width:100%;border-collapse:collapse;background:#0a0f1e;border-radius:8px;overflow:hidden">
        ${tableRows}
      </table>

      <!-- Footer -->
      <div style="margin-top:20px;padding:12px 16px;background:rgba(74,127,255,0.08);border-radius:8px;border:1px solid rgba(74,127,255,0.2)">
        <p style="margin:0;font-size:12px;color:#64748b">Reçu le ${date}</p>
      </div>
    </div>
  </div>
</body>
</html>`
}
