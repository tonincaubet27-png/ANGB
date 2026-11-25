import { redirect } from 'next/navigation'

// Page masquée (décision du bureau) : l'ANGB ne met pas en avant des entraîneurs.
// Pour la rouvrir : supprimer ce fichier layout.tsx.
export default function Layout({ children }: { children: React.ReactNode }) {
  redirect('/association')
  return children
}
