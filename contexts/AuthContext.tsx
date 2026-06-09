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

  const loadUserData = useCallback(async (userId: string) => {
    const client = getClient()
    if (!client) return

    const { data: prof } = await client
      .from('profiles').select('*').eq('id', userId).single()

    if (!prof) {
      // Utilisateur connecté (ex. Google OAuth) mais sans profil → déclenche la config
      setNeedsSetup(true)
      setAuthOpen(true)
      return
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
  }, [])

  useEffect(() => {
    const client = getClient()
    if (!client) { setLoading(false); return }

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id).finally(() => setLoading(false))
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
      openAuth:        (mode = 'login') => { setAuthMode(mode); setAuthOpen(true) },
      closeAuth:       () => setAuthOpen(false),
      clearNeedsSetup: () => { setNeedsSetup(false); setAuthOpen(false) },
      signOut,
      refreshProfile: () => user ? loadUserData(user.id) : Promise.resolve(),
      isConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
