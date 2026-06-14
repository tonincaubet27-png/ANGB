export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <h1
        className="text-5xl mb-8"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
      >
        Mentions légales
      </h1>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Éditeur</h2>
          <p>
            Association Nationale des Gardiens de But (ANGB)<br />
            Association loi 1901<br />
            Fondée en 2026<br />
            Email : <a href="mailto:angbcontact@gmail.com" style={{ color: 'var(--accent)' }}>angbcontact@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc.<br />
            440 N Barranca Ave #4133, Covina, CA 91723, USA
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, images, logos) sont la propriété
            de l'ANGB ou de leurs auteurs respectifs. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Responsabilité</h2>
          <p>
            L'ANGB s'efforce de maintenir les informations à jour. Elle ne peut être tenue responsable
            des inexactitudes ou omissions. Les liens externes sont fournis à titre indicatif.
          </p>
        </section>
      </div>
    </div>
  )
}
