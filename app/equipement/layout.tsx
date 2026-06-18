import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bourse équipement · ANGB',
  description:
    "Achetez et vendez du matériel de gardien d'occasion entre membres de la communauté ANGB. Jambières, masques, gants, plastrons, crosses.",
  openGraph: {
    title: 'Bourse équipement gardien · ANGB',
    description: "Matériel gardien d'occasion entre membres de la communauté.",
  },
}

export default function EquipementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
