'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { getClient } from '@/lib/supabase-client'
import type { GoalieProfile, UserProfile } from '@/lib/types'
import { getLinkedGoalieProfiles } from '@/lib/data'

interface AuthContextType {
  user:            User | null
  profile:         UserProfile | null
  goalieProfile:   GoalieProfile | null
  linkedGoalies:   GoalieProfile[]
  loading:         boolean
  authOpen:        boolean
  authMode:        'login' | 'register'
  needsSetup:      boolean   // vrai si connecté OAuth mais sans profil encore
  isMember:        boolean   // vrai si adhésion validée par le bureau
  openAuth:        (mode?: 'login' | 'register') => void
  closeAuth:       () => void
  clearNeedsSetup: () => void
  signOut:         () => Promise<void>
  refreshProfile:  () => Promise<void>
  isConfigured:    boolean
}

const DEFAULT: AuthContextType = {
  user: null, profile: null, goalieProfile: null, linkedGoalies: [],
  loading: false, authOpen: false, authMode: 'login', needsSetup: false,
  isMember: false,
  openAuth: () => {}, closeAuth: () => {}, clearNeedsSetup: () => {},
  signOut: async () => {}, refreshProfile: async () => {},
  isConfigured: false,
}

export const AuthContext = createContext<AuthContextType>(DEFAULT)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,          setUser]    = useState<User | null>(null)
  const [profile,       setProfile] = useState<UserProfile | null>(null)
  const [goalieProfile, setGoalie]  = useState<GoalieProfile | null>(null)
  const [linkedGoalies, setLinked]  = useState<GoalieProfile[]>([])
  const [loading,       setLoading]    = useState(true)
  const [authOpen,      setAuthOpen]   = useState(false)
  const [authMode,      setAuthMode]   = useState<'login' | 'register'>('login')
  const [needsSetup,    setNeedsSetup] = useState(false)

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const loadUserData = useCallback(async (userId: string): Promise<{ needsSetup: boolean }> => {
    const client = getClient()
    if (!client) return { needsSetup: false }

    const { data: prof } = await client
      .from('profiles').select('*').eq('id', userId).single()

    if (!prof) {
      // Connecté (Google OAuth ou inscription email non finalisée) mais sans profil.
      // On marque le besoin de configuration SANS forcer l'ouverture du modal :
      // sinon l'utilisateur est piégé — le modal « choisissez votre profil » repasse
      // au-dessus du bulletin d'adhésion à chaque chargement et l'empêche d'adhérer.
      // L'ouverture auto n'a lieu qu'au retour d'un login OAuth (cf. ?setup=1) ;
      // sinon une entrée non bloquante reste proposée dans la Navbar.
      setNeedsSetup(true)
      return { needsSetup: true }
    }
    setNeedsSetup(false)
    setProfile(prof as UserProfile)

    if (prof.role === 'gardien') {
      const { data: g } = await client
        .from('goalie_profiles').select('*').eq('user_id', userId).single()
      setGoalie((g ?? null) as GoalieProfile | null)
    }

    if (prof.role === 'parent') {
      const linked = await getLinkedGoalieProfiles(userId)
      setLinked(linked)
    }
    return { needsSetup: false }
  }, [])

  useEffect(() => {
    const client = getClient()
    if (!client) { setLoading(false); return }

    client.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { needsSetup: ns } = await loadUserData(session.user.id)
        setLoading(false)
        // Ouverture auto du setup UNIQUEMENT juste après un login OAuth
        // (la route /auth/callback ajoute ?setup=1). Jamais sur une visite normale,
        // pour ne pas piéger un utilisateur connecté sans profil.
        if (ns && typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          if (params.get('setup') === '1') {
            setAuthOpen(true)
            params.delete('setup')
            const qs = params.toString()
            window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
          }
        }
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadUserData(session.user.id)
      else { setProfile(null); setGoalie(null); setLinked([]) }
    })

    return () => subscription.unsubscribe()
  }, [loadUserData])

  const signOut = async () => {
    const client = getClient()
    if (client) await client.auth.signOut()
    setUser(null); setProfile(null); setGoalie(null); setLinked([])
  }

  return (
    <AuthContext.Provider value={{
      user, profile, goalieProfile, linkedGoalies, loading,
      authOpen, authMode, needsSetup,
      isMember: profile?.membership_status === 'active',
      openAuth:        (mode = 'login') => { setAuthMode(mode); setAuthOpen(true) },
      closeAuth:       () => setAuthOpen(false),
      clearNeedsSetup: () => { setNeedsSetup(false); setAuthOpen(false) },
      signOut,
      refreshProfile: async () => { if (user) await loadUserData(user.id) },
      isConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
