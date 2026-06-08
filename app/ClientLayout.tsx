'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AdhesionModal from '@/components/AdhesionModal'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [adhesionOpen, setAdhesionOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAdhesion={() => setAdhesionOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <AdhesionModal isOpen={adhesionOpen} onClose={() => setAdhesionOpen(false)} />
    </div>
  )
}
