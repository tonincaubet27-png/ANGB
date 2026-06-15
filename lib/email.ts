import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER          // angbcontact@gmail.com
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

/** Vrai si l'envoi d'email est configuré (Gmail + mot de passe d'application) */
export function emailConfigured(): boolean {
  return Boolean(GMAIL_USER && GMAIL_APP_PASSWORD)
}

/** Envoi best-effort via Gmail SMTP. Ne lève jamais — retourne { ok, error } */
export async function sendMail(
  { to, subject, html }: { to: string; subject: string; html: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!emailConfigured()) return { ok: false, error: 'Email non configuré (GMAIL_APP_PASSWORD manquant)' }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
    await transporter.sendMail({ from: `ANGB <${GMAIL_USER}>`, to, subject, html })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// ── Carte de membre dématérialisée ──────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  gardien:            'Gardien',
  entraineur_gardien: 'Entraîneur gardien',
  entraineur:         'Entraîneur',
  joueur:             'Joueur',
  membre_soutien:     'Membre soutien',
}

/** Email envoyé au membre quand le bureau valide son adhésion */
export function buildMemberCardEmail(p: {
  prenom: string; nom: string; category: string | null; memberNumber: string
}): string {
  const categoryLabel = CATEGORY_LABELS[p.category ?? ''] ?? 'Membre'
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#0a0f1e;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">

    <table width="460" cellpadding="0" cellspacing="0" style="max-width:460px;background:#0b1322;border-radius:14px;overflow:hidden;border:1px solid #1e2a40;">
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td height="5" style="background:#002395;font-size:0;line-height:0;">&nbsp;</td>
          <td height="5" style="background:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
          <td height="5" style="background:#ED2939;font-size:0;line-height:0;">&nbsp;</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:24px 26px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:28px;font-weight:bold;letter-spacing:2px;color:#ffffff;">ANGB</td>
          <td align="right" style="font-size:11px;color:#9db4ff;">Loi 1901</td>
        </tr></table>
        <p style="font-size:12px;color:#7a8fa8;margin:18px 0 4px;letter-spacing:1px;">Carte de membre · saison ${year}</p>
        <p style="font-size:26px;font-weight:bold;color:#ffffff;margin:0 0 16px;">${p.prenom} ${p.nom}</p>
        <p style="margin:0 0 22px;">
          <span style="display:inline-block;font-size:13px;color:#9db4ff;background:#15233f;padding:6px 14px;border-radius:20px;">${categoryLabel}</span>
          &nbsp;
          <span style="display:inline-block;font-size:13px;color:#7fe0c0;background:#123026;padding:6px 14px;border-radius:20px;">&#10003; Membre actif</span>
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e2a40;"><tr>
          <td style="padding-top:16px;">
            <p style="font-size:11px;color:#5f7088;margin:0 0 3px;letter-spacing:1px;">N° d'adhérent</p>
            <p style="font-size:14px;font-weight:bold;color:#d4ddf0;margin:0;">${p.memberNumber}</p>
          </td>
          <td align="right" style="padding-top:16px;">
            <p style="font-size:11px;color:#5f7088;margin:0 0 3px;letter-spacing:1px;">Cotisation</p>
            <p style="font-size:14px;font-weight:bold;color:#7fe0c0;margin:0;">Offerte · 1re année</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <table width="460" cellpadding="0" cellspacing="0" style="max-width:460px;margin-top:22px;"><tr><td style="font-family:Arial,Helvetica,sans-serif;color:#cbd5e1;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 12px;">Bonjour ${p.prenom},</p>
      <p style="margin:0 0 12px;">Ton adhésion à l'Association Nationale des Gardiens de But est <strong style="color:#ffffff;">validée</strong> ! Voici ta carte de membre pour la saison ${year}.</p>
      <p style="margin:0 0 12px;">Tu peux désormais participer au forum, déposer des annonces d'équipement et apparaître dans l'annuaire des membres.</p>
      <p style="margin:0;color:#7a8fa8;">Sportivement,<br>Le bureau de l'ANGB</p>
    </td></tr></table>

  </td></tr></table>
</body></html>`
}
