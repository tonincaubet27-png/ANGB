import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/email'

const ADMIN_EMAIL = 'angbcontact@gmail.com' // bureau · reçoit le message si le membre n'a pas de compte

// POST /api/message · un visiteur envoie un message à un membre via sa fiche annuaire
export async function POST(req: NextRequest) {
  const { toName, toUserId, fromName, fromEmail, message } =
    (await req.json()) as { toName?: string; toUserId?: string; fromName?: string; fromEmail?: string; message?: string }

  if (!fromName?.trim() || !fromEmail?.trim() || !message?.trim()) {
    return NextResponse.json({ ok: false, error: 'Nom, email et message requis.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
    return NextResponse.json({ ok: false, error: 'Email invalide.' }, { status: 400 })
  }

  // Récupère l'email du membre via son compte (si lié)
  let memberEmail: string | null = null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (toUserId && url && key) {
    try {
      const supabase = createClient(url, key)
      const { data } = await supabase.auth.admin.getUserById(toUserId)
      memberEmail = data?.user?.email ?? null
    } catch { /* ignore · repli sur le bureau */ }
  }

  const direct = Boolean(memberEmail)
  const to = memberEmail ?? ADMIN_EMAIL
  const subject = direct
    ? `📩 Message via l'annuaire ANGB · de ${fromName}`
    : `📩 Message à transmettre à ${toName ?? 'un membre'} (annuaire ANGB)`

  const result = await sendMail({ to, subject, replyTo: fromEmail, html: buildMessageHtml({ toName, fromName, fromEmail, message, direct }) })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Envoi impossible.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

function buildMessageHtml(p: { toName?: string; fromName: string; fromEmail: string; message: string; direct: boolean }): string {
  const safe = p.message.replace(/</g, '&lt;').replace(/\n/g, '<br>')
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#0a0f1e;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#0d1525;border-radius:12px;overflow:hidden;border:1px solid #1e2a40;">
    <div style="height:4px;background:linear-gradient(to right,#002395 0%,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%,#ED2939 100%)"></div>
    <div style="padding:26px 30px;color:#cbd5e1;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 16px;color:#fff;font-size:18px;font-weight:bold;">📩 Nouveau message</p>
      ${p.direct
        ? `<p style="margin:0 0 16px;">Vous avez reçu un message via votre fiche de l'annuaire ANGB. Répondez directement à cet email pour joindre l'expéditeur.</p>`
        : `<p style="margin:0 0 16px;">Message reçu via l'annuaire ANGB <strong style="color:#fff;">à transmettre à ${p.toName ?? 'un membre'}</strong> (pas de compte lié).</p>`}
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <tr><td style="padding:6px 0;color:#94a3b8;width:90px;">De</td><td style="padding:6px 0;color:#f1f5f9;">${p.fromName}</td></tr>
        <tr><td style="padding:6px 0;color:#94a3b8;">Email</td><td style="padding:6px 0;color:#4a7fff;">${p.fromEmail}</td></tr>
      </table>
      <div style="padding:14px 16px;background:#0a0f1e;border-radius:8px;border:1px solid #1e2a40;color:#e2e8f0;">${safe}</div>
      <p style="margin:18px 0 0;color:#64748b;font-size:12px;">Envoyé depuis l'annuaire de l'Association Nationale des Gardiens de But.</p>
    </div>
  </div>
</body></html>`
}
