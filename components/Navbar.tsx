'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavbarProps {
  onOpenAdhesion: () => void
}

export default function Navbar({ onOpenAdhesion }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Barre tricolore haute */}
      <div className="tricolor-bar" />

      <nav
        className="px-4 md:px-8 py-3"
        style={{
          background: 'rgba(10,14,26,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="tricolor-bar-vertical h-8 rounded-full" />
            <div>
              <span
                className="text-2xl tracking-widest text-white"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}
              >
                ANGB
              </span>
              <span className="hidden sm:block text-xs leading-none" style={{ color: 'var(--gray)' }}>
                Association Nationale des Gardiens de But
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '/association', label: "L'association" },
              { href: '/annuaire', label: 'Annuaire' },
              { href: '/forum', label: 'Forum' },
              { href: '/equipement', label: 'Équipement' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'var(--gray)' }}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={onOpenAdhesion}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--accent)' }}
            >
              Rejoindre l'ANGB
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-0.5 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              style={{ background: 'var(--white)' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all ${menuOpen ? 'opacity-0' : ''}`}
              style={{ background: 'var(--white)' }}
            />
            <span
              className={`block w-6 h-0.5 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              style={{ background: 'var(--white)' }}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden mt-3 pb-4 flex flex-col gap-3 border-t pt-4"
            style={{ borderColor: 'var(--border)' }}
          >
            {[
              { href: '/association', label: "L'association" },
              { href: '/annuaire', label: 'Annuaire' },
              { href: '/forum', label: 'Forum' },
              { href: '/equipement', label: 'Équipement' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium py-1"
                style={{ color: 'var(--gray)' }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onOpenAdhesion() }}
              className="mt-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
              style={{ background: 'var(--accent)' }}
            >
              Rejoindre l'ANGB
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
