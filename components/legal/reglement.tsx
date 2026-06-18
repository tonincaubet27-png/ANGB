import React from 'react'

export function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--white)' }}>{title}</h4>
      <div className="text-sm leading-relaxed space-y-1.5" style={{ color: 'var(--gray)' }}>{children}</div>
    </div>
  )
}

export function StatutsContent() {
  return (
    <div>
      <p className="text-xs mb-5 px-3 py-2 rounded-lg" style={{ background: 'rgba(74,127,255,0.08)', color: 'var(--gray)', border: '1px solid rgba(74,127,255,0.15)' }}>
        Statuts adoptés lors de l&apos;Assemblée Générale constitutive — Association régie par la loi du 1er juillet 1901.
      </p>

      <DocSection title="Article 1 — Dénomination">
        <p>Il est fondé entre les adhérents aux présents statuts une association régie par la loi du 1er juillet 1901 et le décret du 16 août 1901, ayant pour titre : <strong style={{ color: 'var(--white)' }}>Association Nationale des Gardiens de But (ANGB)</strong>.</p>
      </DocSection>

      <DocSection title="Article 2 — Objet">
        <p>L&apos;association a pour objet :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>La promotion et le développement du poste de gardien de but en hockey sur glace en France</li>
          <li>La mise en réseau des gardiens de but amateurs et professionnels</li>
          <li>Le soutien technique, moral et administratif de ses membres</li>
          <li>L&apos;organisation d&apos;événements, stages et formations liés au poste de gardien de but</li>
          <li>La représentation des intérêts des gardiens de but auprès des instances fédérales</li>
        </ul>
      </DocSection>

      <DocSection title="Article 3 — Siège social">
        <p>Le siège social est fixé en France. Il pourra être transféré par décision du Conseil d&apos;Administration.</p>
      </DocSection>

      <DocSection title="Article 4 — Durée">
        <p>L&apos;association est constituée pour une durée indéterminée.</p>
      </DocSection>

      <DocSection title="Article 5 — Membres">
        <p>L&apos;association comprend :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li><strong style={{ color: 'var(--white)' }}>Membres actifs</strong> — gardiens de but ou anciens gardiens en règle de cotisation, disposant du droit de vote en Assemblée Générale</li>
          <li><strong style={{ color: 'var(--white)' }}>Membres soutien</strong> — clubs, entraîneurs gardiens, parents, professionnels de santé contribuant à l&apos;objet associatif</li>
          <li><strong style={{ color: 'var(--white)' }}>Membres d&apos;honneur</strong> — personnes ayant rendu des services signalés à l&apos;association, sur décision du Conseil d&apos;Administration</li>
        </ul>
      </DocSection>

      <DocSection title="Article 6 — Cotisations">
        <p>Le montant des cotisations annuelles est fixé chaque année par l&apos;Assemblée Générale sur proposition du Conseil d&apos;Administration. Des exonérations peuvent être accordées aux mineurs, aux étudiants et aux membres du bureau sur justificatif.</p>
      </DocSection>

      <DocSection title="Article 7 — Assemblée Générale">
        <p>L&apos;Assemblée Générale comprend tous les membres à jour de leur cotisation. Elle se réunit au moins une fois par an. Elle délibère sur les rapports moral et financier, et élit les membres du Conseil d&apos;Administration. Les décisions sont prises à la majorité simple des membres présents ou représentés.</p>
      </DocSection>

      <DocSection title="Article 8 — Conseil d'Administration">
        <p>Le Conseil d&apos;Administration est composé de 3 à 12 membres élus pour 2 ans. Il se réunit au moins deux fois par an et est chargé de l&apos;administration courante de l&apos;association.</p>
      </DocSection>

      <DocSection title="Article 9 — Bureau">
        <p>Le Conseil d&apos;Administration élit parmi ses membres un Bureau composé d&apos;un(e) Président(e), d&apos;un(e) Vice-Président(e), d&apos;un(e) Secrétaire et d&apos;un(e) Trésorier(ère).</p>
      </DocSection>

      <DocSection title="Article 10 — Ressources">
        <p>Les ressources de l&apos;association comprennent les cotisations, les subventions, les dons et toute autre ressource autorisée par la loi.</p>
      </DocSection>

      <DocSection title="Article 11 — Dissolution">
        <p>En cas de dissolution volontaire ou judiciaire, les biens de l&apos;association seront dévolus à une association ayant un objet similaire, désignée par l&apos;Assemblée Générale extraordinaire.</p>
      </DocSection>
    </div>
  )
}

export function ReglementContent() {
  return (
    <div>
      <p className="text-xs mb-5 px-3 py-2 rounded-lg" style={{ background: 'rgba(74,127,255,0.08)', color: 'var(--gray)', border: '1px solid rgba(74,127,255,0.15)' }}>
        Le présent règlement intérieur précise et complète les statuts de l&apos;ANGB. Il s&apos;impose à tous les membres.
      </p>

      <DocSection title="Article 1 — Adhésion">
        <p>Toute personne souhaitant adhérer doit remplir le bulletin d&apos;adhésion et régler la cotisation correspondant à son statut. L&apos;adhésion est valable pour l&apos;année civile en cours. Le bureau se réserve le droit de refuser toute adhésion incompatible avec l&apos;objet associatif.</p>
      </DocSection>

      <DocSection title="Article 2 — Bienveillance & comportement">
        <p>Les membres s&apos;engagent à respecter les valeurs de l&apos;association : <strong style={{ color: 'var(--white)' }}>bienveillance, fair-play, entraide, respect et solidarité</strong> entre gardiens. Sont strictement interdits : insultes, propos agressifs, discriminations, harcèlement, menaces, dénigrement et tout comportement contraire au respect d&apos;autrui.</p>
      </DocSection>

      <DocSection title="Article 3 — Droits des membres actifs">
        <p>Les membres actifs bénéficient :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Du droit de vote en Assemblée Générale</li>
          <li>D&apos;un accès préférentiel aux événements organisés par l&apos;ANGB</li>
          <li>D&apos;une inscription dans l&apos;annuaire des membres</li>
          <li>D&apos;un accompagnement dans leurs démarches sportives</li>
        </ul>
      </DocSection>

      <DocSection title="Article 4 — Obligations des membres">
        <p>Les membres s&apos;engagent à :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Régler leur cotisation annuelle dans les délais impartis</li>
          <li>Informer l&apos;association de tout changement de coordonnées</li>
          <li>Ne pas engager l&apos;association auprès de tiers sans habilitation expresse du bureau</li>
          <li>Respecter la confidentialité des informations partagées au sein de l&apos;association</li>
        </ul>
      </DocSection>

      <DocSection title="Article 5 — Protection des données (RGPD)">
        <p>Conformément au Règlement Général sur la Protection des Données (UE 2016/679), les données personnelles des membres sont collectées dans le seul but de gérer les adhésions et la vie associative. Elles ne sont <strong style={{ color: 'var(--white)' }}>ni vendues ni transmises à des tiers</strong>. Chaque membre dispose d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression de ses données en écrivant au bureau. Voir la politique de confidentialité du site.</p>
      </DocSection>

      <DocSection title="Article 6 — Utilisation de l'image">
        <p>L&apos;ANGB peut utiliser le nom et l&apos;image de ses membres dans ses communications officielles uniquement avec leur accord exprès, recueilli lors de l&apos;adhésion ou par écrit ultérieurement.</p>
      </DocSection>

      <DocSection title="Article 7 — Espaces communautaires en ligne">
        <p>Le forum, l&apos;annuaire, la messagerie et la bourse d&apos;équipement sont des espaces d&apos;<strong style={{ color: 'var(--white)' }}>entraide entre gardiens</strong>. Chacun y est responsable de ses publications. Sont interdits les contenus injurieux, agressifs, diffamatoires, discriminatoires, ainsi que le spam et les contenus illégaux. Le bureau peut modérer, masquer ou supprimer tout contenu et restreindre l&apos;accès d&apos;un membre.</p>
      </DocSection>

      <DocSection title="Article 8 — Sanctions">
        <p>En cas de manquement aux présents statuts ou au règlement intérieur (notamment aux articles 2 et 7), le bureau peut prononcer, selon la gravité :</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Un avertissement écrit</li>
          <li>La suppression du contenu concerné</li>
          <li>Une suspension temporaire de l&apos;accès aux espaces en ligne</li>
          <li>La <strong style={{ color: 'var(--white)' }}>radiation définitive et la suppression de l&apos;adhésion</strong></li>
        </ul>
        <p className="mt-1.5">Le membre concerné est informé et peut présenter ses observations avant toute décision, sauf urgence (contenu illégal, mise en danger d&apos;autrui).</p>
      </DocSection>

      <DocSection title="Article 9 — Bourse d'équipement">
        <p>Les annonces d&apos;équipement sont publiées par les membres entre eux. L&apos;ANGB <strong style={{ color: 'var(--white)' }}>n&apos;est pas partie aux transactions</strong> et ne saurait être tenue responsable en cas de litige, de défaut ou d&apos;arnaque. Il appartient à chacun de rester vigilant (vérifier l&apos;équipement, privilégier la remise en main propre, ne jamais communiquer d&apos;informations bancaires sensibles).</p>
      </DocSection>

      <DocSection title="Article 10 — Modification du règlement">
        <p>Le présent règlement intérieur peut être modifié par le bureau. Les modifications sont portées à la connaissance des adhérents lors de la plus prochaine Assemblée Générale.</p>
      </DocSection>
    </div>
  )
}
