'use client'

import { useState } from 'react'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { useAuth } from '@/contexts/AuthContext'
import HeaderPhoto from '@/components/HeaderPhoto'
import MissionSection from '@/components/about/MissionSection'
import FormationSection from '@/components/about/FormationSection'
import SanteSection from '@/components/about/SanteSection'
import VivierSection from '@/components/about/VivierSection'
import StatsSection from '@/components/about/StatsSection'
import ConseilSection from '@/components/about/ConseilSection'
import EquipeSection from '@/components/about/EquipeSection'

const TABS = [
  { id: 'mission', label: 'Mission & axes', icon: '🎯', component: MissionSection },
  { id: 'formation', label: 'Formation', icon: '🎓', component: FormationSection },
  { id: 'sante', label: 'Santé', icon: '🩺', component: SanteSection },
  { id: 'vivier', label: 'Vivier français', icon: '🌱', component: VivierSection },
  { id: 'stats', label: 'Statistiques', icon: '📊', component: StatsSection },
  { id: 'conseil', label: 'Conseil carrière', icon: '💼', component: ConseilSection },
  { id: 'equipe', label: "L'équipe", icon: '👥', component: EquipeSection },
]

export default function AssociationPage() {
  const [activeTab, setActiveTab] = useState('mission')
  const ActiveSection = TABS.find(t => t.id === activeTab)?.component ?? MissionSection
  const { openAdhesion } = useAdhesion()
  const { user } = useAuth()

  return (
    <div>
      {/* Header */}
      <div
        className="relative overflow-hidden py-16"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <HeaderPhoto src="/images/fabrice-lhenry.jpg" position="center 40%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
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
          {!user && (
            <button
              onClick={openAdhesion}
              className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}
            >
              Rejoindre l&apos;ANGB
            </button>
          )}
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
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                style={{
                  borderColor: activeTab === id ? 'var(--accent)' : 'transparent',
                  color: activeTab === id ? 'var(--white)' : 'var(--gray)',
                }}
              >
                <span className="mr-1.5">{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <ActiveSection />
      </div>

      {/* CTA bas de page — masqué pour les membres déjà connectés */}
      {!user && (
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div
          className="rounded-2xl p-8 md:p-10 text-center"
          style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-2xl md:text-3xl mb-2"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
          >
            Prêt à rejoindre l&apos;ANGB ?
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--gray)' }}>
            Adhésion gratuite la première année — gardiens, anciens gardiens, entraîneurs, parents et structures.
          </p>
          <button
            onClick={openAdhesion}
            className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}
          >
            Rejoindre l&apos;ANGB
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
