import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forum · ANGB',
  description:
    'Échanges entre gardiens de but, entraîneurs et structures. Technique, santé, équipement, stages, vie des clubs.',
  openGraph: {
    title: 'Forum ANGB · Gardiens de but',
    description: 'La communauté des gardiens français.',
  },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
