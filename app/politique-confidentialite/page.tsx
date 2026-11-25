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
            · La gestion des adhésions et communications associatives<br />
            · La mise en relation dans le cadre des services de l'ANGB<br />
            · L'annuaire (avec consentement explicite)
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Vos droits (RGPD)</h2>
          <p>
            Conformément au RGPD (Règlement UE 2016/679), vous disposez d'un droit d'accès, de rectification,
            d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:angbcontact@gmail.com" style={{ color: 'var(--accent)' }}>angbcontact@gmail.com</a>.
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
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Données des mineurs</h2>
          <p>
            Le site peut être utilisé par des gardiens mineurs. Pour eux, nous traitons : le nom, la date de naissance,
            la photo de profil et de galerie, le club, et le lien avec un parent ou tuteur légal.<br />
            · <strong style={{ color: 'var(--white)' }}>Moins de 15 ans :</strong> le consentement d&apos;un parent ou tuteur légal est obligatoire
            pour l&apos;adhésion, la publication d&apos;une photo et l&apos;apparition dans l&apos;annuaire.<br />
            · Le lien parent-enfant n&apos;est actif qu&apos;après validation par le bureau de l&apos;ANGB. Tant qu&apos;il est en attente,
            le parent ne peut pas modifier la fiche de l&apos;enfant.<br />
            · Les photos de mineurs ne sont publiées qu&apos;avec l&apos;autorisation d&apos;image donnée à l&apos;adhésion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Conservation</h2>
          <p>
            Les données sont conservées pendant la durée de l&apos;adhésion, puis <strong style={{ color: 'var(--white)' }}>un an</strong> après
            la fin de celle-ci, sauf obligation légale contraire. Les données comptables éventuelles suivent leurs délais légaux.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--white)' }}>Suppression sur demande</h2>
          <p>
            Tu peux demander la suppression de ton compte et de tes données (ou de celles de ton enfant) à tout moment,
            par simple e-mail à{' '}
            <a href="mailto:angbcontact@gmail.com" style={{ color: 'var(--accent)' }}>angbcontact@gmail.com</a>.
            Nous traitons la demande dans un délai d&apos;un mois maximum.
          </p>
        </section>

        <p className="text-xs italic">Dernière mise à jour : novembre 2026</p>
      </div>
    </div>
  )
}
