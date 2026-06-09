'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getClient } from '@/lib/supabase-client'
import {
  createUserProfile, createGoalieProfile,
  linkParentToGoalie, searchGoalieProfiles,
} from '@/lib/data'
import { useAuth } from '@/contexts/AuthContext'
import type { GoalieProfile } from '@/lib/types'

const DIVISIONS = ['Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

type Step = 'auth' | 'role' | 'gardien' | 'parent' | 'success'

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, refreshProfile, isConfigured } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────────
  const [mode,     setMode]    = useState<'login' | 'register'>(authMode)
  const [step,     setStep]    = useState<Step>('auth')
  // Champs communs
  const [email,    setEmail]   = useState('')
  const [password, setPass]    = useState('')
  const [name,     setName]    = useState('')
  const [role,     setRole]    = useState<'gardien' | 'parent' | null>(null)
  // Gardien
  const [club,     setClub]    = useState('')
  const [division, setDiv]     = useState('D2')
  const [region,   setRegion]  = useState('')
  const [bio,      setBio]     = useState('')
  // Parent - search
  const [query,    setQuery]   = useState('')
  const [results,  setResults] = useState<GoalieProfile[]>([])
  const [selected, setSelect]  = useState<GoalieProfile | null>(null)
  const [searching, setSearching] = useState(false)
  // UI
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')

  // Sync mode quand le context change
  useEffect(() => {
    if (authOpen) {
      setMode(authMode)
      setStep('auth')
      setError('')
    }
  }, [authOpen, authMode])

  // Fermer avec Escape
  useEffect(() => {
    if (!authOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [authOpen])

  const handleClose = () => {
    closeAuth()
    setTimeout(() => {
      setStep('auth'); setError('')
      setEmail(''); setPass(''); setName(''); setRole(null)
      setClub(''); setDiv('D2'); setRegion(''); setBio('')
      setQuery(''); setResults([]); setSelect(null)
    }, 300)
  }

  // ── Demo mode ──────────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <AnimatePresence>
        {authOpen && (
          <>
            <motion.div
              key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            />
            <motion.div
              key="md"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ pointerEvents: 'none' }}
            >
              <div className="w-full max-w-sm p-6 rounded-2xl text-center" style={{ background: '#0d1b2e', border: '1px solid rgba(74,127,255,0.3)', pointerEvents: 'auto' }}>
                <div className="text-4xl mb-3">🔧</div>
                <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--white)' }}>Mode démo actif</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--gray)' }}>
                  La création de compte nécessite Supabase.<br />
                  Configurez les variables d'environnement pour activer les profils.
                </p>
                <button onClick={handleClose} className="px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) { setError('Email et mot de passe requis.'); return }
    setLoading(true); setError('')
    const client = getClient()!
    const { error: err } = await client.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError('Email ou mot de passe incorrect.'); return }
    await refreshProfile()
    handleClose()
  }

  // ── Étape 1 register : valider email/password/nom ─────────────────────────
  const handleStartRegister = () => {
    if (!email || !password || !name) { setError('Tous les champs sont requis.'); return }
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum.'); return }
    setError(''); setStep('role')
  }

  // ── Étape 2 : choisir rôle ─────────────────────────────────────────────────
  const handleSelectRole = (r: 'gardien' | 'parent') => {
    setRole(r); setStep(r)
  }

  // ── Étape 3a : créer profil gardien ───────────────────────────────────────
  const handleCreateGardien = async () => {
    if (!club || !region) { setError('Club et région requis.'); return }
    setLoading(true); setError('')
    const client = getClient()!

    const { data, error: signUpErr } = await client.auth.signUp({ email, password })
    if (signUpErr || !data.user) {
      setLoading(false)
      setError(signUpErr?.message ?? 'Erreur inscription.')
      return
    }
    const userId = data.user.id
    const { ok: p1 } = await createUserProfile(userId, 'gardien', name)
    const { ok: p2 } = await createGoalieProfile({ user_id: userId, name, club, division, region, bio_note: bio })
    setLoading(false)
    if (!p1 || !p2) { setError('Erreur création profil. Réessayez.'); return }
    await refreshProfile()
    setStep('success')
  }

  // ── Étape 3b : parent — recherche enfant ──────────────────────────────────
  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    const res = await searchGoalieProfiles(query)
    setResults(res); setSearching(false)
  }

  // ── Étape 3b : créer compte parent + lier ────────────────────────────────
  const handleCreateParent = async () => {
    setLoading(true); setError('')
    const client = getClient()!

    const { data, error: signUpErr } = await client.auth.signUp({ email, password })
    if (signUpErr || !data.user) {
      setLoading(false)
      setError(signUpErr?.message ?? 'Erreur inscription.')
      return
    }
    const userId = data.user.id
    await createUserProfile(userId, 'parent', name)
    if (selected) await linkParentToGoalie(userId, selected.id)
    setLoading(false)
    await refreshProfile()
    setStep('success')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {authOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: '#0d1b2e', border: '1px solid rgba(74,127,255,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(74,127,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'var(--font-bebas)', color: '#4a7fff', fontSize: '1.5rem', letterSpacing: '0.05em' }}>ANGB</span>
                  <span className="text-sm" style={{ color: 'var(--gray)' }}>·</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--white)' }}>
                    {step === 'auth' ? (mode === 'login' ? 'Connexion' : 'Créer un compte')
                     : step === 'role'    ? 'Votre profil'
                     : step === 'gardien' ? 'Profil gardien'
                     : step === 'parent'  ? 'Profil parent'
                     : 'Bienvenue !'}
                  </span>
                </div>
                <button onClick={handleClose} className="w-7 h-7 rounded-full flex items-center justify-center text-xs hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--gray)' }}>✕</button>
              </div>

              <div className="px-6 py-6">
                <AnimatePresence mode="wait">

                  {/* ── STEP AUTH ── */}
                  {step === 'auth' && (
                    <motion.div key="auth" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                      {/* Tabs login/register */}
                      <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        {(['login', 'register'] as const).map(m => (
                          <button key={m} onClick={() => { setMode(m); setError('') }}
                            className="flex-1 py-2 text-sm font-semibold transition-colors"
                            style={{
                              background: mode === m ? 'rgba(74,127,255,0.15)' : 'transparent',
                              color: mode === m ? '#4a7fff' : 'var(--gray)',
                              borderRight: m === 'login' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                            }}>
                            {m === 'login' ? 'Connexion' : "S'inscrire"}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {mode === 'register' && (
                          <Field label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" />
                        )}
                        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="jean@example.com" />
                        <Field label="Mot de passe" type="password" value={password} onChange={setPass} placeholder="••••••••"
                          hint={mode === 'register' ? '6 caractères minimum' : undefined} />
                      </div>

                      {error && <ErrMsg msg={error} />}

                      <button
                        onClick={mode === 'login' ? handleLogin : handleStartRegister}
                        disabled={loading}
                        className="mt-5 w-full py-3 rounded-xl text-sm font-bold transition-opacity disabled:opacity-60"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Continuer →'}
                      </button>
                    </motion.div>
                  )}

                  {/* ── STEP ROLE ── */}
                  {step === 'role' && (
                    <motion.div key="role" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <p className="text-sm mb-5" style={{ color: 'var(--gray)' }}>Choisissez votre profil sur l'ANGB :</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { r: 'gardien' as const, icon: '🥅', title: 'Gardien de but', desc: 'Vous jouez dans un club' },
                          { r: 'parent'  as const, icon: '👪', title: 'Parent',          desc: 'Pour suivre votre enfant gardien' },
                        ].map(({ r, icon, title, desc }) => (
                          <button key={r} onClick={() => handleSelectRole(r)}
                            className="p-4 rounded-xl border text-left hover:border-accent/40 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--white)' }}>{title}</p>
                            <p className="text-xs" style={{ color: 'var(--gray)' }}>{desc}</p>
                          </button>
                        ))}
                      </div>
                      <BackBtn onClick={() => setStep('auth')} />
                    </motion.div>
                  )}

                  {/* ── STEP GARDIEN ── */}
                  {step === 'gardien' && (
                    <motion.div key="gardien" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
                        Votre fiche apparaîtra dans l'annuaire. Vous pourrez la compléter à tout moment.
                      </p>
                      <div className="space-y-3">
                        <Field label="Club actuel *" value={club} onChange={setClub} placeholder="Montpellier HC" />
                        <div>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gray)' }}>Division *</label>
                          <select value={division} onChange={e => setDiv(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)' }}>
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <Field label="Région *" value={region} onChange={setRegion} placeholder="Occitanie" />
                        <Field label="Bio (optionnel)" value={bio} onChange={setBio} placeholder="Quelques mots sur votre parcours…" />
                      </div>
                      {error && <ErrMsg msg={error} />}
                      <button onClick={handleCreateGardien} disabled={loading}
                        className="mt-4 w-full py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {loading ? 'Création…' : 'Créer mon profil 🥅'}
                      </button>
                      <BackBtn onClick={() => setStep('role')} />
                    </motion.div>
                  )}

                  {/* ── STEP PARENT ── */}
                  {step === 'parent' && (
                    <motion.div key="parent" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                      <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
                        Recherchez le profil de votre enfant dans l'annuaire pour vous y relier.
                        Vous pourrez ensuite modifier sa fiche.
                      </p>
                      <div className="flex gap-2 mb-3">
                        <input
                          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)' }}
                          placeholder="Prénom Nom de votre enfant…"
                          value={query} onChange={e => setQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} disabled={searching}
                          className="px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                          style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff' }}>
                          {searching ? '…' : '🔍'}
                        </button>
                      </div>

                      {results.length > 0 && (
                        <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                          {results.map(g => (
                            <button key={g.id} onClick={() => setSelect(g)}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
                              style={{
                                background: selected?.id === g.id ? 'rgba(74,127,255,0.15)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${selected?.id === g.id ? 'rgba(74,127,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                              }}>
                              <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>{g.name}</p>
                                <p className="text-xs" style={{ color: 'var(--gray)' }}>{[g.club, g.division].filter(Boolean).join(' · ')}</p>
                              </div>
                              {selected?.id === g.id && <span style={{ color: '#4a7fff' }}>✓</span>}
                            </button>
                          ))}
                        </div>
                      )}

                      {error && <ErrMsg msg={error} />}

                      <button onClick={handleCreateParent} disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-60"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        {loading ? 'Création…' : selected ? `Relier à ${selected.name} →` : 'Continuer sans relier'}
                      </button>
                      <BackBtn onClick={() => setStep('role')} />
                    </motion.div>
                  )}

                  {/* ── STEP SUCCESS ── */}
                  {step === 'success' && (
                    <motion.div key="success"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.05em' }}>
                        Bienvenue dans l'ANGB !
                      </h3>
                      <p className="text-sm mb-5" style={{ color: 'var(--gray)' }}>
                        {role === 'gardien'
                          ? 'Votre fiche est maintenant visible dans l\'annuaire. Vous pouvez la compléter à tout moment.'
                          : selected
                            ? `Vous êtes lié au profil de ${selected.name}. Vous pouvez désormais modifier sa fiche.`
                            : 'Votre compte a été créé. Vous pouvez lier un profil depuis l\'annuaire.'}
                      </p>
                      <button onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        C'est parti 🏒
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Field({
  label, type = 'text', value, onChange, placeholder, hint,
}: {
  label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gray)' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)' }}
      />
      {hint && <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{hint}</p>}
    </div>
  )
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(237,41,57,0.12)', color: '#f87171', border: '1px solid rgba(237,41,57,0.2)' }}>
      {msg}
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-3 w-full text-xs py-2 transition-colors"
      style={{ color: 'var(--gray)' }}>
      ← Retour
    </button>
  )
}
