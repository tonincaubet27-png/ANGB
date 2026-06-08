export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
      <h1
        className="text-5xl mb-8"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
      >
        Politique de confidentialité
      </h1>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Collecte des données</h2>
          <p>
            L'ANGB collecte les données personnelles uniquement dans le cadre de la gestion des adhésions
            (formulaire d'adhésion) et des annonces d'équipement (bourse d'occasion). Ces données sont
            limitées au strict nécessaire.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Utilisation</h2>
          <p>
            Les données collectées sont utilisées exclusivement pour :<br />
            — La gestion des adhésions et communications associatives<br />
            — La mise en relation dans le cadre des services de l'ANGB<br />
            — L'annuaire (avec consentement explicite)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Vos droits (RGPD)</h2>
          <p>
            Conformément au RGPD (Règlement UE 2016/679), vous disposez d'un droit d'accès, de rectification,
            d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:contact@angb.fr" style={{ color: 'var(--accent)' }}>contact@angb.fr</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Transmission à des tiers</h2>
          <p>
            Les données personnelles ne sont jamais vendues, louées ou transmises à des tiers commerciaux.
            Elles peuvent être partagées avec les membres du bureau de l'ANGB dans le cadre strict
            de la gestion associative.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Conservation</h2>
          <p>
            Les données sont conservées pendant la durée de l'adhésion, puis archivées 3 ans
            conformément aux obligations comptables des associations loi 1901.
          </p>
        </section>

        <p className="text-xs italic">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  )
}
