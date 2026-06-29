'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getClient } from '@/lib/supabase-client'
import { CONTENT_DEFAULTS } from '@/lib/content-keys'

type C = (key: string) => string

const ContentCtx = createContext<C>((k) => CONTENT_DEFAULTS[k] ?? k)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    const client = getClient()
    if (!client) return
    client.from('site_content').select('key,value').then(({ data }) => {
      if (!data) return
      const m: Record<string, string> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(data as any[]).forEach(r => { if (r.value) m[r.key] = r.value })
      setOverrides(m)
    })
  }, [])

  const c: C = (key) => overrides[key] ?? CONTENT_DEFAULTS[key] ?? key

  return <ContentCtx.Provider value={c}>{children}</ContentCtx.Provider>
}

/** Hook : renvoie la fonction c(key) → texte (override DB ou valeur par défaut). */
export const useContent = () => useContext(ContentCtx)
