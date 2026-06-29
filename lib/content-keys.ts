// Registre des textes éditables du site (mini-CMS).
// Ajouter une entrée ici + utiliser c('clé') dans un composant = texte modifiable
// depuis /admin/contenu. La valeur « def » est le repli si rien n'est défini en base.

export interface ContentField {
  key: string
  group: string
  label: string
  def: string
  multiline?: boolean
}

export const CONTENT_FIELDS: ContentField[] = [
  // ── Accueil ──
  { key: 'home.badge',        group: 'Accueil', label: 'Badge (haut de la page)', def: 'Association Loi 1901 · Fondée en 2026' },
  { key: 'home.tagline',      group: 'Accueil', label: 'Accroche sous le titre', multiline: true,
    def: "L'ANGB structure, développe et protège la pratique du poste de gardien de but en France · de la formation à la carrière professionnelle." },
  { key: 'home.cta.primary',   group: 'Accueil', label: 'Bouton principal', def: "Découvrir l'ANGB" },
  { key: 'home.cta.secondary', group: 'Accueil', label: 'Bouton secondaire', def: 'Annuaire des gardiens →' },
  { key: 'home.stats.title',   group: 'Accueil', label: 'Titre « section chiffres »', def: 'Un mouvement national' },
  { key: 'home.stats.sub',     group: 'Accueil', label: 'Sous-titre « section chiffres »', multiline: true,
    def: "Fédérer et représenter les gardiens de but du hockey français, dans toutes les catégories, du professionnel à l'amateur." },

  // ── L'association ──
  { key: 'assoc.header.sub', group: "L'association", label: 'Sous-titre en-tête', def: 'Association Nationale des Gardiens de But · loi 1901 · fondée en 2026' },

  // ── Pied de page & contact ──
  { key: 'footer.description', group: 'Pied de page', label: 'Description', multiline: true,
    def: 'Association Nationale des Gardiens de But · Loi 1901 fondée en 2026. Structurer, développer et protéger la pratique du poste de gardien de but en France.' },
  { key: 'contact.email', group: 'Contact', label: 'Email de contact', def: 'angbcontact@gmail.com' },
]

export const CONTENT_DEFAULTS: Record<string, string> =
  Object.fromEntries(CONTENT_FIELDS.map(f => [f.key, f.def]))
