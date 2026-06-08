import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="tricolor-bar-vertical h-8 rounded-full" />
              <span
                className="text-2xl tracking-widest"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}
              >
                ANGB
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--gray)' }}>
              Association Nationale des Gardiens de But — Loi 1901 fondée en 2026.
              Structurer, développer et protéger la pratique du poste de gardien de but en France.
            </p>
            <a
              href="mailto:contact@angb.fr"
              className="inline-block mt-4 text-sm font-medium transition-colors hover:text-white"
              style={{ color: 'var(--accent)' }}
            >
              contact@angb.fr
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--gray)' }}>
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/association', label: "L'association" },
                { href: '/annuaire', label: 'Annuaire' },
                { href: '/forum', label: 'Forum' },
                { href: '/equipement', label: 'Équipement' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--gray)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--gray)' }}>
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: 'var(--gray)' }}
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: 'var(--gray)' }}
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--gray)' }}>
            © 2026 ANGB — Association Nationale des Gardiens de But. Tous droits réservés.
          </p>
          <p className="text-xs" style={{ color: 'var(--gray)' }}>
            Association loi 1901
          </p>
        </div>
      </div>

      {/* Barre tricolore basse */}
      <div className="tricolor-bar" />
    </footer>
  )
}
