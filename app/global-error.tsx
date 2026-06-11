'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ANGB GlobalError]', error)
  }, [error])

  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#070b15' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: 'white',
          fontFamily: 'monospace',
        }}>
          <h2 style={{ color: '#ED2939', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Erreur globale détectée
          </h2>
          <pre style={{
            background: '#0d1b2e',
            padding: '1rem',
            borderRadius: '8px',
            maxWidth: '90vw',
            overflow: 'auto',
            fontSize: '0.75rem',
            color: '#fca5a5',
            border: '1px solid #ED2939',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {error?.message || 'Erreur inconnue'}
            {'\n\n'}
            {error?.stack || ''}
          </pre>
          <button
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: '#4a7fff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
