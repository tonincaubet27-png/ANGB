'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import AdhesionModal from '@/components/AdhesionModal'

interface AdhesionContextType {
  openAdhesion:  () => void
  closeAdhesion: () => void
}

const AdhesionContext = createContext<AdhesionContextType>({
  openAdhesion:  () => {},
  closeAdhesion: () => {},
})

export const useAdhesion = () => useContext(AdhesionContext)

/**
 * Fournit le bulletin d'adhésion à tout le site.
 * N'importe quel composant peut l'ouvrir via useAdhesion().openAdhesion().
 * Doit être placé À L'INTÉRIEUR de AuthProvider (le modal utilise useAuth).
 */
export function AdhesionProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <AdhesionContext.Provider value={{ openAdhesion: () => setOpen(true), closeAdhesion: () => setOpen(false) }}>
      {children}
      <AdhesionModal isOpen={open} onClose={() => setOpen(false)} />
    </AdhesionContext.Provider>
  )
}
