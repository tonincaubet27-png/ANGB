import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'manquant'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'manquant'

  // Décode le rôle depuis le JWT sans lib externe
  let role = 'inconnu'
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
    role = payload.role ?? 'inconnu'
  } catch { role = 'JWT invalide' }

  let count = -1
  let error = ''
  if (key !== 'manquant' && url !== 'manquant') {
    const sb = createClient(url, key)
    const { count: c, error: e } = await sb
      .from('adhesion_requests')
      .select('*', { count: 'exact', head: true })
    if (e) error = e.message
    else count = c ?? 0
  }

  return NextResponse.json({ url: url.slice(0, 40), role, count, error })
}
