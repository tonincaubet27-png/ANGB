import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (url && key) {
      // ?setup=1 : signale au client que c'est un retour OAuth frais → le modal
      // de configuration du profil peut s'ouvrir automatiquement (une seule fois).
      const redirectTarget = new URL(next, origin)
      redirectTarget.searchParams.set('setup', '1')
      const response = NextResponse.redirect(redirectTarget)

      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
            )
          },
        },
      })

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return response
    }
  }

  // Fallback
  return NextResponse.redirect(`${origin}/`)
}
