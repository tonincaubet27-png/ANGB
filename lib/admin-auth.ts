// Authentification de la page /admin.
// Principe : connexion par email + mot de passe d'un compte ANGB réel, vérifié
// côté serveur, ET dont l'email figure dans l'allowlist ADMIN_EMAILS. En cas de
// succès on pose un cookie httpOnly signé (HMAC ADMIN_SECRET) — le secret ne
// transite JAMAIS dans l'URL. Le cookie est revérifié à chaque requête + dans
// les server actions (sinon une action serveur serait appelable sans contrôle).
import { cookies } from 'next/headers'
import crypto from 'crypto'

export const ADMIN_COOKIE = 'angb_admin'
export const ADMIN_MAX_AGE = 60 * 60 * 8 // 8 heures

function secret(): string {
  return process.env.ADMIN_SECRET || ''
}

/** Liste blanche des emails autorisés à administrer (env ADMIN_EMAILS, séparés par des virgules). */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  const e = (email || '').trim().toLowerCase()
  return !!e && adminEmails().includes(e)
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
}

/** Jeton = base64url(email|exp).signatureHMAC */
export function makeToken(email: string): string {
  const body = `${email.toLowerCase()}|${Date.now() + ADMIN_MAX_AGE * 1000}`
  return `${Buffer.from(body).toString('base64url')}.${sign(body)}`
}

/** Vérifie signature + expiration + allowlist. Retourne l'email admin ou null. */
export function verifyToken(token?: string | null): string | null {
  if (!token || !secret()) return null
  const [b64, sig] = token.split('.')
  if (!b64 || !sig) return null
  const body = Buffer.from(b64, 'base64url').toString()
  const expected = sign(body)
  // Comparaison à temps constant (anti timing-attack)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  const [email, expStr] = body.split('|')
  if (!email || !expStr || Number(expStr) < Date.now()) return null
  return isAdminEmail(email) ? email.toLowerCase() : null
}

/** Email de l'admin connecté (via cookie), ou null. À appeler dans la page ET les server actions. */
export function getAdminEmail(): string | null {
  return verifyToken(cookies().get(ADMIN_COOKIE)?.value)
}
