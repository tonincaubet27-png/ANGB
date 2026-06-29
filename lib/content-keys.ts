// Registre des textes éditables du site (mini-CMS).
// Ajouter une entrée ici + utiliser c('clé') dans un composant (client) = texte
// modifiable depuis /admin/contenu. « def » = repli si rien n'est défini en base.

export interface ContentField {
  key: string
  group: string
  label: string
  def: string
  multiline?: boolean
}

export const CONTENT_FIELDS: ContentField[] = [
  // ── Accueil ──
  { key: 'home.badge',         group: 'Accueil', label: 'Badge (haut de page)', def: 'Association Loi 1901 · Fondée en 2026' },
  { key: 'home.tagline',       group: 'Accueil', label: 'Accroche sous le titre', multiline: true,
    def: "L'ANGB structure, développe et protège la pratique du poste de gardien de but en France · de la formation à la carrière professionnelle." },
  { key: 'home.cta.primary',   group: 'Accueil', label: 'Bouton principal (hero)', def: "Découvrir l'ANGB" },
  { key: 'home.cta.secondary', group: 'Accueil', label: 'Bouton secondaire (hero)', def: 'Annuaire des gardiens →' },
  { key: 'home.stats.title',   group: 'Accueil', label: 'Titre section chiffres', def: 'Un mouvement national' },
  { key: 'home.stats.sub',     group: 'Accueil', label: 'Sous-titre section chiffres', multiline: true,
    def: "Fédérer et représenter les gardiens de but du hockey français, dans toutes les catégories, du professionnel à l'amateur." },
  { key: 'home.clubs.title',   group: 'Accueil', label: 'Titre carte des clubs', def: 'Les clubs de hockey en France' },
  { key: 'home.clubs.sub',     group: 'Accueil', label: 'Sous-titre carte des clubs', def: 'Survole la carte pour explorer les clubs, de la Ligue Magnus à la Division 3.' },
  { key: 'home.gallery.overline', group: 'Accueil', label: 'Surtitre galerie', def: 'Légendes françaises' },
  { key: 'home.gallery.title',    group: 'Accueil', label: 'Titre galerie', def: 'Les gardiens en action' },
  { key: 'home.gallery.sub',      group: 'Accueil', label: 'Sous-titre galerie', def: "De la D3 au Magnus, jusqu'à la NHL · la communauté des gardiens français." },
  { key: 'home.founders.overline', group: 'Accueil', label: 'Surtitre fondateurs', def: 'Équipe fondatrice' },
  { key: 'home.founders.title',    group: 'Accueil', label: 'Titre fondateurs', def: "Les créateurs de l'ANGB" },
  { key: 'home.actions.title',  group: 'Accueil', label: 'Titre « Ce que fait l\'ANGB »', def: "Ce que fait l'ANGB" },
  { key: 'home.actions.desc',   group: 'Accueil', label: 'Description « Ce que fait l\'ANGB »', multiline: true,
    def: "Structurer, protéger et développer la pratique du poste de gardien en France · de la formation à la carrière. Clique une tuile pour explorer." },
  { key: 'home.cta2.overline',  group: 'Accueil', label: 'Surtitre bandeau bas', def: 'Adhésion ouverte' },
  { key: 'home.cta2.title',     group: 'Accueil', label: 'Titre bandeau bas', def: 'Rejoins la communauté' },
  { key: 'home.cta2.sub',       group: 'Accueil', label: 'Texte bandeau bas', multiline: true,
    def: "Gardien actif, ancien gardien, entraîneur ou structure · l'ANGB est ton association. Cotisation à partir de 0€ pour les mineurs, étudiants et membres du bureau." },
  { key: 'home.cta2.primary',   group: 'Accueil', label: 'Bouton bandeau (rejoindre)', def: "Rejoindre l'ANGB" },
  { key: 'home.cta2.secondary', group: 'Accueil', label: 'Bouton bandeau (forum)', def: 'Accéder au forum' },

  // ── L'association ──
  { key: 'assoc.header.overline', group: "L'association", label: 'Surtitre en-tête', def: "L'association · tableau de bord" },
  { key: 'assoc.header.sub',      group: "L'association", label: 'Sous-titre en-tête', def: 'Association Nationale des Gardiens de But · loi 1901 · fondée en 2026' },
  { key: 'assoc.cta.title',  group: "L'association", label: 'Titre encart bas', def: "Prêt à rejoindre l'ANGB ?" },
  { key: 'assoc.cta.sub',    group: "L'association", label: 'Texte encart bas', multiline: true, def: 'Adhésion gratuite la première année · gardiens, anciens gardiens, entraîneurs, parents et structures.' },

  // ── Forum ──
  { key: 'forum.header.overline', group: 'Forum', label: 'Surtitre', def: 'Communauté' },
  { key: 'forum.header.title',    group: 'Forum', label: 'Titre', def: 'Forum ANGB' },
  { key: 'forum.header.sub',      group: 'Forum', label: 'Sous-titre', def: 'Échanges entre gardiens, entraîneurs et structures' },

  // ── Équipement ──
  { key: 'equip.header.overline', group: 'Équipement', label: 'Surtitre', def: "Bourse d'équipement" },
  { key: 'equip.header.title',    group: 'Équipement', label: 'Titre', def: 'Équipement' },
  { key: 'equip.header.sub',      group: 'Équipement', label: 'Sous-titre', def: 'Achat et vente de matériel de gardien entre membres de la communauté' },

  // ── Annuaire ──
  { key: 'annuaire.header.overline', group: 'Annuaire', label: 'Surtitre', def: 'Annuaire' },
  { key: 'annuaire.header.title',    group: 'Annuaire', label: 'Titre', def: 'Annuaire des membres' },
  { key: 'annuaire.header.sub',      group: 'Annuaire', label: 'Sous-titre', def: 'Gardiens, entraîneurs, joueurs et soutiens de la communauté ANGB · cliquez sur une fiche pour en savoir plus.' },

  // ── Stages ──
  { key: 'stages.header.overline', group: 'Stages', label: 'Surtitre', def: 'Formation sur la glace' },
  { key: 'stages.header.title',    group: 'Stages', label: 'Titre', def: 'Stages gardiens' },
  { key: 'stages.header.sub',      group: 'Stages', label: 'Sous-titre', def: 'Stages et camps de perfectionnement pour gardiens de but, encadrés par des entraîneurs spécialisés.' },

  // ── Entraîneurs gardiens ──
  { key: 'entraineurs.header.overline', group: 'Entraîneurs gardiens', label: 'Surtitre', def: "Réseau d'encadrement" },
  { key: 'entraineurs.header.title',    group: 'Entraîneurs gardiens', label: 'Titre', def: 'Entraîneurs gardiens' },
  { key: 'entraineurs.header.sub',      group: 'Entraîneurs gardiens', label: 'Sous-titre', def: 'Trouve un entraîneur spécialisé gardien près de chez toi. Clique une région sur la carte ou filtre par zone.' },

  // ── Pied de page & contact ──
  { key: 'footer.description', group: 'Pied de page', label: 'Description', multiline: true,
    def: 'Association Nationale des Gardiens de But · Loi 1901 fondée en 2026. Structurer, développer et protéger la pratique du poste de gardien de but en France.' },
  { key: 'contact.email', group: 'Contact', label: 'Email de contact', def: 'angbcontact@gmail.com' },
]

export const CONTENT_DEFAULTS: Record<string, string> =
  Object.fromEntries(CONTENT_FIELDS.map(f => [f.key, f.def]))
