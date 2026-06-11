import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'tonincaubet27@gmail.com'

// ── Libellés lisibles ─────────────────────────────────────────────────────────
const STATUT_LABELS: Record<string, string> = {
  gardien_actif:      'Gardien actif',
  ancien_gardien:     'Ancien gardien',
  entraineur_gardien: 'Entraîneur gardien',
  parent:             'Parent / tuteur',
  membre_soutien:     'Membre soutien',
}

const COTISATION_LABELS: Record<string, string> = {
  actif_20:   'Membre actif — 20€/an',
  soutien_10: 'Membre soutien — 10€/an',
  gratuit_0:  'Gratuité de lancement — 0€',
}

function formatStatut(raw: unknown): string {
  if (!raw) return '—'
  return String(raw)
    .split(',')
    .map(s => STATUT_LABELS[s.trim()] ?? s.trim())
    .join(', ')
}

// ── POST /api/adhesion ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const payload = await req.json() as Record<string, unknown>
  const errors: string[] = []

  // 1 — Sauvegarde Supabase (service_role pour contourner RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey && supabaseUrl.startsWith('http')) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { error } = await supabase.from('adhesion_requests').insert({
        ...payload,
        status: 'pending',
      })
      if (error) errors.push(`Supabase : ${error.message}`)
    } catch (e) {
      errors.push(`Supabase exception : ${String(e)}`)
    }
  }

  // 2 — Email de notification via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      const { error } = await resend.emails.send({
        from:    'ANGB <onboarding@resend.dev>',
        to:      ADMIN_EMAIL,
        subject: `🏒 Nouvelle adhésion — ${payload.prenom} ${payload.nom}`,
        html:    buildEmailHtml(payload),
      })
      if (error) errors.push(`Resend : ${error.message}`)
    } catch (e) {
      errors.push(`Resend exception : ${String(e)}`)
    }
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, error: errors.join(' | ') }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
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
    ['Téléphone',            p.telephone || '—'],
    ['Date de naissance',    p.date_naissance || '—'],
    ['Adresse',              p.adresse || '—'],
    ['Club',                 p.club || '—'],
    ['Statut(s)',            formatStatut(p.statut)],
    ['Division / niveau',    p.division || '—'],
    ['Catégorie enfant',     p.categorie_enfant || '—'],
    ['Cotisation',           COTISATION_LABELS[String(p.cotisation ?? '')] || p.cotisation || '—'],
    ['Accepte les statuts',  p.accept_statuts ? '✅ Oui' : '❌ Non'],
    ['Accepte le RGPD',      p.accept_rgpd    ? '✅ Oui' : '❌ Non'],
    ['Autorisation image',   p.autorisation_image ? '✅ Oui' : '—'],
  ] satisfies [string, unknown][]

  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;width:42%;vertical-align:top">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#f1f5f9;font-size:13px;font-weight:500">${String(value ?? '—')}</td>
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
