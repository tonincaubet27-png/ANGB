'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps {
  onOpenAdhesion: () => void
}

export default function Navbar({ onOpenAdhesion }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef             = useRef<HTMLDivElement>(null)
  const { user, profile, goalieProfile, openAuth, signOut } = useAuth()

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenu(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = (name: string) =>
    name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const navLinks = [
    { href: '/association', label: "L'association" },
    { href: '/annuaire',    label: 'Annuaire' },
    { href: '/ressources',  label: 'Ressources' },
    { href: '/forum',       label: 'Forum' },
    { href: '/equipement',  label: 'Équipement' },
  ]

  return (
    <header className="sticky top-0 z-50">
      {/* Barre tricolore 5px */}
      <div className="tricolor-bar" />

      <nav
        className="px-4 md:px-8 py-0"
        style={{
          background: 'rgba(7,11,21,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between" style={{ height: 56 }}>

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="tricolor-bar-vertical h-9 rounded-full" />
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-2xl leading-none tracking-widest"
                  style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.08em' }}>
                  ANGB
                </span>
                <span className="hidden sm:block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: 'rgba(0,35,149,0.9)', background: 'rgba(0,35,149,0.12)', border: '1px solid rgba(0,35,149,0.25)' }}>
                  Loi 1901
                </span>
              </div>
              <p className="hidden lg:block text-[9px] leading-none font-semibold uppercase tracking-[0.18em] mt-0.5"
                style={{ color: 'var(--gray)', letterSpacing: '0.15em' }}>
                Association nationale des gardiens de but
              </p>
            </div>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="relative px-3 py-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors hover:text-white group"
                style={{ color: 'var(--gray)' }}>
                {label}
                {/* underline tricolore au hover */}
                <span className="absolute bottom-0 left-3 right-3 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ background: 'linear-gradient(to right, #002395 0%, #002395 33%, #fff 33%, #fff 66%, #ED2939 66%, #ED2939 100%)' }} />
              </Link>
            ))}

            <div className="w-px h-4 mx-2" style={{ background: 'var(--border-mid)' }} />

            {user ? (
              /* ── User connecté ── */
              <>
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
                  <span className="text-xs font-bold uppercase tracking-wide max-w-24 truncate"
                    style={{ color: 'var(--white)' }}>
                    {profile?.display_name?.split(' ')[0] ?? 'Mon compte'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--gray)' }}>▾</span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden"
                    style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
                    {/* Header dropdown */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--white)' }}>{profile?.display_name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#4a7fff' }}>
                        {profile?.role === 'gardien' ? '🥅 Gardien' : '👪 Parent'}
                      </p>
                    </div>

                    {profile?.role === 'gardien' && goalieProfile && (
                      <Link href="/annuaire" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--gray)' }}>
                        🏒 Ma fiche annuaire
                      </Link>
                    )}

                    <button
                      onClick={() => { setUserMenu(false); signOut() }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-white/5 transition-colors"
                      style={{ color: '#f87171' }}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              {/* Bouton Adhésion — visible même connecté */}
              <button
                onClick={onOpenAdhesion}
                className="px-4 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-[0.12em] transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 16px rgba(74,127,255,0.3)' }}>
                Adhésion
              </button>
              </>
            ) : (
              /* ── Non connecté ── */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-white/5"
                  style={{ color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Connexion
                </button>
                <button
                  onClick={onOpenAdhesion}
                  className="px-4 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-[0.12em] transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 16px rgba(74,127,255,0.3)' }}>
                  Adhésion
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile menu button ──────────────────────────────────── */}
          <button className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {[0, 1, 2].map(i => (
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

        {/* ── Mobile menu ─────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden pb-5 flex flex-col"
            style={{ borderTop: '1px solid var(--border)' }}>

            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-0 py-3 text-xs font-bold uppercase tracking-[0.15em] border-b"
                style={{ color: 'var(--gray)', borderColor: 'var(--border)' }}
                onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-4">
              {user ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--white)' }}>
                    👋 {profile?.display_name}
                  </p>
                  <button onClick={() => { setMenuOpen(false); signOut() }}
                    className="text-xs font-bold uppercase tracking-wide py-2 rounded-lg"
                    style={{ color: '#f87171' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); openAuth('login') }}
                    className="py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-center"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gray)' }}>
                    Connexion
                  </button>
                  <button onClick={() => { setMenuOpen(false); onOpenAdhesion() }}
                    className="py-3 rounded-lg text-xs font-extrabold uppercase tracking-[0.12em] text-center"
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
