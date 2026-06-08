import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Number */}
      <p
        className="text-[120px] md:text-[180px] leading-none mb-2 select-none"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--navy-light)', letterSpacing: '0.04em' }}
      >
        404
      </p>

      {/* Tricolor accent */}
      <div className="flex gap-1.5 mb-6">
        <div className="h-1 w-8 rounded-full" style={{ background: '#002395' }} />
        <div className="h-1 w-8 rounded-full" style={{ background: '#ffffff' }} />
        <div className="h-1 w-8 rounded-full" style={{ background: 'var(--red-fr)' }} />
      </div>

      <h1
        className="text-3xl md:text-5xl mb-3"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
      >
        Page introuvable
      </h1>

      <p className="text-sm max-w-sm mb-8" style={{ color: 'var(--gray)' }}>
        Cette page n'existe pas ou a été déplacée. Revenez à l'accueil pour continuer.
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/forum"
          className="px-6 py-2.5 rounded-xl text-sm font-medium border"
          style={{ borderColor: 'var(--border)', color: 'var(--gray)' }}
        >
          Forum
        </Link>
      </div>
    </div>
  )
}
