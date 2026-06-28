import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ClientLayout from './ClientLayout'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dm = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ANGB · Association Nationale des Gardiens de But',
  description:
    "L'association qui structure, développe et protège la pratique du poste de gardien de but en France. Formation, santé, vivier, bourse d'équipement.",
  keywords: ['gardien de but', 'hockey sur glace', 'ANGB', 'association', 'France'],
  openGraph: {
    title: 'ANGB · Association Nationale des Gardiens de But',
    description: 'La voix des gardiens français.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebas.variable} ${dm.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
