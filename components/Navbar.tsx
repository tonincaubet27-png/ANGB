'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps {
  onOpenAdhesion: () => void
}

export default function Navbar({ onOpenAdhesion }: NavbarProps) {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [userMenu, setUserMenu]   = useState(false)
  const userMenuRef               = useRef<HTMLDivElement>(null)
  const { user, profile, goalieProfile, openAuth, signOut } = useAuth()

  // Fermer le user menu en cliquant ailleurs
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = (name: string) =>
    name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const navLinks = [
    { href: '/association', label: "L'association" },
    { href: '/annuaire',    label: 'Annuaire' },
    { href: '/forum',       label: 'Forum' },
    { href: '/equipement',  label: 'Équipement' },
  ]

  return (
    <header className="sticky top-0 z-50">
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
          <Link href="/" className="flex items-center gap-3">
            <div className="tricolor-bar-vertical h-8 rounded-full" />
            <div>
              <span className="text-2xl tracking-widest text-white"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>
                ANGB
              </span>
              <span className="hidden sm:block text-xs leading-none" style={{ color: 'var(--gray)' }}>
                Association Nationale des Gardiens de But
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: 'var(--gray)' }}>
                {label}
              </Link>
            ))}

            {user ? (
              /* ── User connecté ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff' }}>
                    {profile?.display_name ? initials(profile.display_name) : '?'}
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate" style={{ color: 'var(--white)' }}>
                    {profile?.display_name?.split(' ')[0] ?? 'Mon compte'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--gray)' }}>▾</span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden"
                    style={{ background: '#0d1b2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{profile?.display_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#4a7fff' }}>
                        {profile?.role === 'gardien' ? '🥅 Gardien' : '👪 Parent'}
                      </p>
                    </div>

                    {profile?.role === 'gardien' && goalieProfile && (
                      <Link href="/annuaire" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--gray)' }}>
                        🏒 Ma fiche annuaire
                      </Link>
                    )}

                    <button
                      onClick={() => { setUserMenu(false); signOut() }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: '#f87171' }}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Non connecté ── */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Connexion
                </button>
                <button
                  onClick={onOpenAdhesion}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  Rejoindre
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {['', 'opacity', ''].map((cls, i) => (
              <span key={i}
                className={`block w-6 h-0.5 transition-all ${
                  i === 0 && menuOpen ? 'rotate-45 translate-y-2'
                  : i === 1 && menuOpen ? 'opacity-0'
                  : i === 2 && menuOpen ? '-rotate-45 -translate-y-2'
                  : ''
                }`}
                style={{ background: 'var(--white)' }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-4 flex flex-col gap-3 border-t pt-4"
            style={{ borderColor: 'var(--border)' }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium py-1"
                style={{ color: 'var(--gray)' }} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-1">
              {user ? (
                <>
                  <p className="text-sm font-medium py-1" style={{ color: 'var(--white)' }}>
                    👋 {profile?.display_name}
                  </p>
                  <button onClick={() => { setMenuOpen(false); signOut() }}
                    className="text-sm py-2 rounded-lg" style={{ color: '#f87171' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); openAuth('login') }}
                    className="py-2 rounded-lg text-sm font-medium text-center"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gray)' }}>
                    Connexion
                  </button>
                  <button onClick={() => { setMenuOpen(false); onOpenAdhesion() }}
                    className="py-2.5 rounded-lg text-sm font-semibold text-center"
                    style={{ background: 'var(--accent)', color: '#fff' }}>
                    Rejoindre l'ANGB
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
