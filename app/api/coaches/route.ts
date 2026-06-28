import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Annuaire public des entraîneurs gardiens : membres dont la fiche est de catégorie
// « entraîneur gardien » OU qui ont déclaré ce rôle lors de l'adhésion (statut).
// Ne renvoie que des infos déjà publiques dans l'annuaire (ni email, ni téléphone).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json([])
  const sb = createClient(url, key)

  const cols = 'id,name,club,region,division,photo_url'
  const byId: Record<string, Record<string, unknown>> = {}

  // 1 — fiches de catégorie entraîneur gardien
  const { data: byCat } = await sb.from('goalie_profiles')
    .select(cols).eq('is_active', true).eq('category', 'entraineur_gardien')
  ;(byCat ?? []).forEach(c => { byId[c.id as string] = c })

  // 2 — membres ayant coché « entraîneur gardien » à l'adhésion
  const { data: adh } = await sb.from('adhesion_requests')
    .select('user_id').ilike('statut', '%entraineur_gardien%')
  const ids = (adh ?? []).map(a => a.user_id).filter(Boolean) as string[]
  if (ids.length) {
    const { data: byUser } = await sb.from('goalie_profiles')
      .select(cols).eq('is_active', true).in('user_id', ids)
    ;(byUser ?? []).forEach(c => { byId[c.id as string] = c })
  }

  return NextResponse.json(Object.values(byId))
}
