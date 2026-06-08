import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
 * Retourne null si les variables d'environnement ne sont pas configurées.
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const cookieStore = cookies()
  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set() {},
      remove() {},
    },
  })
}

/** Retourne true si Supabase est configuré */
export function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
