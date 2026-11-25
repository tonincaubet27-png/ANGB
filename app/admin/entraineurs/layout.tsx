import { redirect } from 'next/navigation'

// Écran masqué (décision du bureau). Pour le rouvrir : supprimer ce fichier layout.tsx
// et remettre le bouton « Entraîneurs » dans app/admin/page.tsx.
export default function Layout({ children }: { children: React.ReactNode }) {
  redirect('/admin')
  return children
}
