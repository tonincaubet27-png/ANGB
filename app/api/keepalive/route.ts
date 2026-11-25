import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Appelée chaque jour par le cron Vercel (vercel.json) : une petite lecture en base
// pour limiter le risque de mise en pause du projet Supabase gratuit pour inactivité.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ ok: false }, { status: 500 })
  const { error } = await createClient(url, key)
    .from('stages').select('id', { count: 'exact', head: true })
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 })
}
