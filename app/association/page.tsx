'use client'

import { useState } from 'react'
import MissionSection from '@/components/about/MissionSection'
import FormationSection from '@/components/about/FormationSection'
import SanteSection from '@/components/about/SanteSection'
import VivierSection from '@/components/about/VivierSection'
import StatsSection from '@/components/about/StatsSection'
import ConseilSection from '@/components/about/ConseilSection'
import EquipeSection from '@/components/about/EquipeSection'

const TABS = [
  { id: 'mission', label: 'Mission & axes', component: MissionSection },
  { id: 'formation', label: 'Formation', component: FormationSection },
  { id: 'sante', label: 'Santé', component: SanteSection },
  { id: 'vivier', label: 'Vivier français', component: VivierSection },
  { id: 'stats', label: 'Statistiques', component: StatsSection },
  { id: 'conseil', label: 'Conseil carrière', component: ConseilSection },
  { id: 'equipe', label: "L'équipe", component: EquipeSection },
]

export default function AssociationPage() {
  const [activeTab, setActiveTab] = useState('mission')
  const ActiveSection = TABS.find(t => t.id === activeTab)?.component ?? MissionSection

  return (
    <div>
      {/* Header */}
      <div
        className="relative py-16"
        style={{
          background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            L'association
          </p>
          <h1
            className="text-5xl md:text-7xl"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
          >
            ANGB
          </h1>
          <p className="mt-2 max-w-xl text-sm" style={{ color: 'var(--gray)' }}>
            Association Nationale des Gardiens de But — Loi 1901 · Fondée en 2026
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div
        className="sticky top-[53px] z-40 overflow-x-auto"
        style={{
          background: 'rgba(10,14,26,0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-0 min-w-max">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                style={{
                  borderColor: activeTab === id ? 'var(--accent)' : 'transparent',
                  color: activeTab === id ? 'var(--white)' : 'var(--gray)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <ActiveSection />
      </div>
    </div>
  )
}
