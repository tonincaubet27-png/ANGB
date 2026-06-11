'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ANGB Error]', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#070b15',
      color: 'white',
      fontFamily: 'monospace',
    }}>
      <h2 style={{ color: '#ED2939', fontSize: '1.5rem', marginBottom: '1rem' }}>
        Erreur détectée
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
  )
}
