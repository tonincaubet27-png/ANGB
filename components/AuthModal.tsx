'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getClient } from '@/lib/supabase-client'
import {
  createUserProfile, createGoalieProfile,
  linkParentToGoalie, searchGoalieProfiles, uploadGoaliePhoto,
} from '@/lib/data'
import { useAuth } from '@/contexts/AuthContext'
import PhotoUpload from '@/components/PhotoUpload'
import type { GoalieProfile } from '@/lib/types'

const DIVISIONS = ['Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

type Step = 'auth' | 'role' | 'gardien' | 'parent' | 'success' | 'confirm'

export default function AuthModal() {
  const { user, authOpen, authMode, needsSetup, closeAuth, clearNeedsSetup, refreshProfile, isConfigured } = useAuth()

  // ── State ──────────────────────────────────────────────────────────────────
  const [mode,     setMode]    = useState<'login' | 'register'>(authMode)
  const [step,     setStep]    = useState<Step>('auth')
  // Champs communs
  const [email,    setEmail]   = useState('')
  const [password, setPass]    = useState('')
  const [name,     setName]    = useState('')
  const [role,     setRole]    = useState<'gardien' | 'parent' | null>(null)
  // Gardien
  const [club,      setClub]    = useState('')
  const [division,  setDiv]     = useState('D2')
  const [region,    setRegion]  = useState('')
  const [bio,       setBio]     = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  // Parent - search
  const [query,    setQuery]   = useState('')
  const [results,  setResults] = useState<GoalieProfile[]>([])
  const [selected, setSelect]  = useState<GoalieProfile | null>(null)
  const [searching, setSearching] = useState(false)
  // UI
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')

  // Ref pour éviter la race condition : onAuthStateChange se déclenche
  // pendant la création de compte et réinitialiserait le step
  const registeringRef = useRef(false)
  // Ref non-réactive sur user (évite closure périmée dans l'effet)
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])
  // Ref pour détecter si la modale vient de s'ouvrir (ouverture fraîche)
  const prevAuthOpenRef = useRef(authOpen)

  // Sync mode quand le context change
  useEffect(() => {
    const justOpened = !prevAuthOpenRef.current && authOpen
    prevAuthOpenRef.current = authOpen

    if (!authOpen) return
    if (registeringRef.current) return   // inscription en cours → ne pas toucher au step

    if (needsSetup && userRef.current) {
      // OAuth sans profil encore → aller au choix de rôle
      setStep('role')
      const googleName = userRef.current.user_metadata?.full_name ?? userRef.current.user_metadata?.name ?? ''
      if (googleName) setName(googleName)
    } else if (justOpened) {
      // Réinitialiser UNIQUEMENT quand la modale s'ouvre pour la première fois,
      // pas sur les changements de needsSetup/authMode en cours de flow
      setMode(authMode)
      setStep('auth')
    }
    if (justOpened) setError('')
    // `user` intentionnellement absent des deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authOpen, authMode, needsSetup])

  // Fermer avec Escape
  useEffect(() => {
    if (!authOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [authOpen])

  const handleClose = () => {
    registeringRef.current = false   // reset au cas où l'utilisateur ferme en pleine inscription
    if (needsSetup) clearNeedsSetup() // annule le setup sans recréer la modale
    else closeAuth()
    setTimeout(() => {
      setStep('auth'); setError('')
      setEmail(''); setPass(''); setName(''); setRole(null)
      setClub(''); setDiv('D2'); setRegion(''); setBio(''); setPhotoFile(null)
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

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    const client = getClient()
    if (!client) return
    setError('')
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError('Erreur connexion Google.')
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) { setError('Email et mot de passe requis.'); return }
    setLoading(true); setError('')
    const client = getClient()!
    const { error: err } = await client.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setError('Email non confirmé. Vérifiez votre boîte mail et cliquez sur le lien de confirmation.')
      } else {
        setError('Email ou mot de passe incorrect.')
      }
      return
    }
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
    registeringRef.current = true   // bloque toute réinitialisation du step
    setLoading(true); setError('')
    const client = getClient()!

    let userId: string
    let displayName = name

    if (user) {
      // Déjà connecté (Google OAuth) — pas besoin de signUp
      userId = user.id
      if (!displayName) displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
      // Met à jour le profil créé par le trigger (rôle + nom)
      await createUserProfile(userId, 'gardien', displayName)
    } else {
      const { data, error: signUpErr } = await client.auth.signUp({
        email, password,
        options: { data: { display_name: displayName, role: 'gardien' } },
      })
      if (signUpErr || !data.user) {
        registeringRef.current = false
        setLoading(false)
        setError(signUpErr?.message ?? 'Erreur inscription.')
        return
      }
      // Pas de session → confirmation email requise
      if (!data.session) {
        registeringRef.current = false
        setLoading(false)
        setStep('confirm')
        return
      }
      userId = data.user.id
    }

    // Upload photo si sélectionnée
    let photoUrl: string | undefined
    if (photoFile) {
      const { url, error: upErr } = await uploadGoaliePhoto(userId, photoFile)
      if (url) photoUrl = url
      else if (upErr) console.warn('Photo upload:', upErr)
    }

    const { ok, error: gErr } = await createGoalieProfile({
      user_id: userId, name: displayName, club, division, region, bio_note: bio,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    setLoading(false)
    if (!ok) {
      registeringRef.current = false
      setError('Erreur création fiche gardien : ' + (gErr ?? ''))
      return
    }
    await refreshProfile()
    setStep('success')
    registeringRef.current = false   // libéré APRÈS le success pour éviter tout reset
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
    registeringRef.current = true   // bloque toute réinitialisation du step
    setLoading(true); setError('')
    const client = getClient()!

    let userId: string
    let displayName = name

    if (user) {
      // Déjà connecté (Google OAuth)
      userId = user.id
      if (!displayName) displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
      await createUserProfile(userId, 'parent', displayName)
    } else {
      const { data, error: signUpErr } = await client.auth.signUp({
        email, password,
        options: { data: { display_name: displayName, role: 'parent' } },
      })
      if (signUpErr || !data.user) {
        registeringRef.current = false
        setLoading(false)
        setError(signUpErr?.message ?? 'Erreur inscription.')
        return
      }
      // Pas de session → confirmation email requise
      if (!data.session) {
        registeringRef.current = false
        setLoading(false)
        setStep('confirm')
        return
      }
      userId = data.user.id
    }

    if (selected) await linkParentToGoalie(userId, selected.id)
    setLoading(false)
    await refreshProfile()
    setStep('success')
    registeringRef.current = false   // libéré APRÈS le success
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

                      {/* ── Google ── */}
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>ou</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                      </div>

                      <button
                        onClick={handleGoogleSignIn}
                        className="mt-3 w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'var(--white)' }}>
                        <GoogleIcon />
                        Continuer avec Google
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
                      <PhotoUpload
                        name={name}
                        onFileSelect={file => setPhotoFile(file)}
                        size={88}
                      />
                      <div className="mt-4 space-y-3">
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

                  {/* ── STEP CONFIRM EMAIL ── */}
                  {step === 'confirm' && (
                    <motion.div key="confirm"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4">
                      <div className="text-5xl mb-4">📧</div>
                      <h3 className="text-xl font-bold mb-2"
                        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.05em' }}>
                        Confirmez votre email
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--gray)' }}>
                        Un lien de confirmation a été envoyé à
                      </p>
                      <p className="text-sm font-bold mb-4" style={{ color: '#4a7fff' }}>{email}</p>
                      <div className="px-4 py-3 rounded-xl text-xs text-left space-y-1.5 mb-5"
                        style={{ background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.2)' }}>
                        <p style={{ color: 'var(--white)' }}>① Ouvrez votre boîte mail</p>
                        <p style={{ color: 'var(--white)' }}>② Cliquez sur le lien de confirmation</p>
                        <p style={{ color: 'var(--white)' }}>③ Revenez ici et connectez-vous</p>
                        <p className="pt-1" style={{ color: 'var(--gray)' }}>
                          Votre profil (club, division, région) sera complété à la première connexion.
                        </p>
                      </div>
                      <button onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        J'ai compris
                      </button>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
