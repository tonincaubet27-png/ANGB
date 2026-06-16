// ── Équipement ──────────────────────────────────────────────────────────────
export interface Listing {
  id: string
  title: string
  category: 'jambières' | 'plastron' | 'masque' | 'gants' | 'crosse' | 'complet' | 'autre'
  condition: 'très bon état' | 'bon état' | 'usage'
  price: number
  description?: string
  city?: string
  seller_name?: string
  seller_division?: string
  user_id?: string
  created_at: string
  is_active: boolean
}

// ── Forum ───────────────────────────────────────────────────────────────────
export type ThreadTag = 'Officiel' | 'Débat' | 'Santé' | 'Équipement' | 'Tournoi' | 'Retour'

export interface Thread {
  id: string
  title: string
  category: string
  tag?: ThreadTag
  author_name?: string
  author_initials?: string
  is_pinned: boolean
  reply_count: number
  last_activity: string
  created_at: string
}

export interface Post {
  id: string
  thread_id: string
  content: string
  author_name?: string
  author_initials?: string
  created_at: string
}

// ── Annuaire ────────────────────────────────────────────────────────────────

/** Entrée de carrière dans le parcours hockey */
export interface CareerEntry {
  periode:   string
  club:      string
  division?: string
  detail?:   string
}

/** Diplôme / certification hockey */
export interface TrainingEntry {
  titre:       string
  organisme?:  string
  annee?:      string
}

/** Diplôme académique */
export interface EtudesEntry {
  diplome:  string
  ecole?:   string
  annee?:   string
}

/** Expérience professionnelle (style LinkedIn) */
export interface ExperienceEntry {
  poste:      string
  entreprise?: string
  periode?:   string
  detail?:    string
}

/**
 * Profil complet d'un gardien (remplace l'ancien Goalie + EXTENDED).
 * user_id est renseigné quand le gardien a créé un compte.
 */
/** Catégorie de membre — sert au classement de l'annuaire et au bulletin */
export type MemberCategory =
  | 'gardien' | 'entraineur_gardien' | 'entraineur' | 'joueur' | 'membre_soutien'

export interface GoalieProfile {
  id:          string
  user_id?:    string
  name:        string
  category?:   MemberCategory
  club?:       string
  division?:   string
  region?:     string
  photo_url?:  string
  bio_note?:   string
  role_angb?:  string
  parcours?:    CareerEntry[]
  formation?:   TrainingEntry[]
  etudes?:      EtudesEntry[]
  experiences?: ExperienceEntry[]
  palmares?:    string[]
  is_active:   boolean
  is_founder?: boolean
  created_at:  string
}

/** Alias rétro-compatible (certains imports utilisent encore Goalie) */
export type Goalie = GoalieProfile

// ── Auth ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id:                string
  role:              'gardien' | 'parent' | 'admin'
  display_name:      string
  membership_status: 'pending' | 'active' | 'rejected'
  created_at:        string
}

// ── Contacts (équipement) ───────────────────────────────────────────────────
export interface ContactRequest {
  listing_id:    string
  listing_title: string
  buyer_name:    string
  buyer_email:   string
  buyer_phone?:  string
  message?:      string
}

// ── Adhésion ─────────────────────────────────────────────────────────────────
export interface AdhesionFormData {
  nom:          string
  prenom:       string
  date_naissance: string
  telephone:    string
  email:        string
  adresse:      string
  club:         string
  statut:       'gardien_actif' | 'ancien_gardien' | 'entraineur_gardien' | 'membre_soutien'
  division:     string
  cotisation:   'actif_20' | 'soutien_10' | 'gratuit_0'
  accept_statuts:    boolean
  accept_rgpd:       boolean
  autorisation_image: boolean
}
