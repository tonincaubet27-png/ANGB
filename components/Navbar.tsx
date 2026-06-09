'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps { onOpenAdhesion: () => void }

export default function Navbar({ onOpenAdhesion }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, profile, goalieProfile, openAuth, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    { href: '/forum',       label: 'Forum' },
    { href: '/equipement',  label: 'Équipement' },
  ]

  return (
    <header className="sticky top-0 z-50">
      <div className="tricolor-bar" />
      <nav
        style={{
          background: scrolled ? 'rgba(3,6,15,0.97)' : 'rgba(3,6,15,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          transition: 'background 0.4s, border-color 0.4s',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between" style={{ height: 60 }}>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="tricolor-bar-vertical h-8 rounded-full" />
            <div>
              <span style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', fontSize: '1.5rem', letterSpacing: '0.1em' }}>
                ANGB
              </span>
              <p className="hidden md:block" style={{ fontSize: 9, color: 'var(--gray)', letterSpacing: '0.14em', textTransform: 'uppercase', lineHeight: 1, marginTop: 1 }}>
                Assoc. nationale des gardiens de but
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-4 py-4 relative group"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--gray)', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray)')}>
                {label}
                <span className="absolute bottom-0 left-4 right-4 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200"
                  style={{ background: 'var(--fr-red)' }} />
              </Link>
            ))}

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }} />

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(74,127,255,0.25)', fontSize: 10, fontWeight: 800, color: '#4a7fff' }}>
                    {profile?.display_name ? initials(profile.display_name) : '?'}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--white)' }}>
                    {profile?.display_name?.split(' ')[0] ?? 'Compte'}
                  </span>
                  <span style={{ color: 'var(--gray)', fontSize: 9 }}>▾</span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden"
                    style={{ background: '#080e1c', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{profile?.display_name}</p>
                      <p style={{ fontSize: 10, color: '#4a7fff', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                        {profile?.role === 'gardien' ? '🥅 Gardien' : '👪 Parent'}
                      </p>
                    </div>
                    {profile?.role === 'gardien' && goalieProfile && (
                      <Link href="/annuaire" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2.5"
                        style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        🏒 Ma fiche
                      </Link>
                    )}
                    <button onClick={() => { setUserMenu(false); signOut() }}
                      className="w-full flex items-center gap-2 px-4 py-2.5"
                      style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171' }}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => openAuth('login')}
                  style={{ padding: '7px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent' }}>
                  Connexion
                </button>
                <button onClick={onOpenAdhesion}
                  style={{ padding: '8px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: 'var(--fr-red)', borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(237,41,57,0.35)', cursor: 'pointer' }}>
                  Rejoindre
                </button>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 flex flex-col gap-[5px]"
            onClick={() => setMenuOpen(!menuOpen)}>
            {[0,1,2].map(i => (
              <span key={i} className="block transition-all"
                style={{
                  width: 22, height: 1.5, background: 'var(--white)',
                  transform: i===0&&menuOpen ? 'rotate(45deg) translate(4.5px,4.5px)' : i===1&&menuOpen ? 'scaleX(0)' : i===2&&menuOpen ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none',
                  opacity: i===1&&menuOpen ? 0 : 1,
                }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-5 pb-6" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="pt-4 flex flex-col gap-0">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="py-3"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gray)', borderBottom: '1px solid var(--border)' }}
                  onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-5">
              {user ? (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>👋 {profile?.display_name}</p>
                  <button onClick={() => { setMenuOpen(false); signOut() }}
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f87171', padding: '8px 0' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); openAuth('login') }}
                    style={{ padding: '10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>
                    Connexion
                  </button>
                  <button onClick={() => { setMenuOpen(false); onOpenAdhesion() }}
                    style={{ padding: '11px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: 'var(--fr-red)', borderRadius: 8, border: 'none' }}>
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
