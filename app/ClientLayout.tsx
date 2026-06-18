'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AdhesionProvider } from '@/contexts/AdhesionContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthModal from '@/components/AuthModal'
import { useScrollReveal } from '@/hooks/useScrollReveal'

/** Contenu intérieur · a accès aux contextes Auth + Adhésion */
function Inner({ children }: { children: React.ReactNode }) {
  useScrollReveal()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdhesionProvider>
        <Inner>{children}</Inner>
      </AdhesionProvider>
    </AuthProvider>
  )
}
