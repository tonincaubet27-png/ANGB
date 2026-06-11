/**
 * Singleton Supabase client (safe — retourne null si non configuré).
 * À utiliser partout côté client plutôt que créer plusieurs instances.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _configured: boolean | null = null

export function getClient(): SupabaseClient | null {
  if (_configured !== null) return _client  // cache le résultat (succès ou échec)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || !url.startsWith('http')) {
    _configured = false
    return null
  }

  // Supabase v2 valide l'URL et throw si elle est mal formée
  try {
    _client = createClient(url, key)
    _configured = true
  } catch {
    _configured = false
    return null
  }
  return _client
}

export const isDbConfigured = (): boolean => {
  if (_configured !== null) return _configured
  getClient()  // initialise _configured
  return _configured ?? false
}
