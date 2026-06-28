import { NextResponse } from 'next/server'
import { getAdminEmail } from '@/lib/admin-auth'
import { getAnonymizedRows } from '@/lib/admin-stats'

export const dynamic = 'force-dynamic'

/** Export CSV anonymisé (RGPD) — réservé à un admin authentifié. */
export async function GET() {
  if (!getAdminEmail()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const rows = await getAnonymizedRows()
  // CSV avec séparateur ';' (Excel FR) + BOM UTF-8 (accents corrects)
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n')
  const date = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="angb-stats-anonymise-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
