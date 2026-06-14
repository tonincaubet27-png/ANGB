'use client'

import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdhesionModal from '@/components/AdhesionModal'
import AuthModal from '@/components/AuthModal'
import { useScrollReveal } from '@/hooks/useScrollReveal'

/** Contenu intérieur — a accès au AuthContext */
function Inner({ children }: { children: React.ReactNode }) {
  const [adhesionOpen, setAdhesionOpen] = useState(false)
  useScrollReveal()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAdhesion={() => setAdhesionOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AdhesionModal isOpen={adhesionOpen} onClose={() => setAdhesionOpen(false)} />
      <AuthModal onOpenAdhesion={() => setAdhesionOpen(true)} />
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Inner>{children}</Inner>
    </AuthProvider>
  )
}
