import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "L'association · ANGB",
  description:
    "Mission, axes stratégiques, formation des gardiens de but, santé, vivier français et conseil carrière. Découvrez l'ANGB.",
  openGraph: {
    title: "L'association · ANGB",
    description: "Les 5 axes de l'ANGB pour structurer le poste de gardien de but en France.",
  },
}

export default function AssociationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
