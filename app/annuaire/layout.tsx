import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Annuaire des gardiens — ANGB',
  description:
    'Répertoire des gardiens de but actifs en France. Magnus, D1, D2, D3, Féminine Élite. Recherche par nom, club, division, région.',
  openGraph: {
    title: 'Annuaire gardiens de but — ANGB',
    description: 'Tous les gardiens actifs en France.',
  },
}

export default function AnnuaireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
