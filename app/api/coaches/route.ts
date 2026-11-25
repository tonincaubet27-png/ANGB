import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Annuaire public des entraîneurs gardiens : uniquement ceux validés par le bureau
// dans /admin/entraineurs. Ne renvoie que des infos publiques (ni email, ni téléphone).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json([])
  const { data, error } = await createClient(url, key).from('goalie_profiles')
    .select('id,name,club,region,division,photo_url,coach_zone')
    .eq('is_active', true).eq('coach_verified', true).order('name')
  if (error || !data) return NextResponse.json([])
  return NextResponse.json(data.map(c => ({
    id: c.id, name: c.name, club: c.club, division: c.division, photo_url: c.photo_url,
    region: c.coach_zone || c.region,
  })))
}
