import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Carte des entraîneurs masquée (décision du bureau) : rien n'est exposé.
// L'ancienne version (lecture des entraîneurs validés) est dans l'historique git (commit f2f0142).
export async function GET() {
  return NextResponse.json([])
}
