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
  created_at: string
  is_active: boolean
}

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

export interface Goalie {
  id: string
  name: string
  club?: string
  division?: string
  region?: string
  bio_note?: string
  is_active: boolean
  created_at: string
}

export interface ContactRequest {
  listing_id: string
  listing_title: string
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  message?: string
}

export interface AdhesionFormData {
  // Informations personnelles
  nom: string
  prenom: string
  date_naissance: string
  telephone: string
  email: string
  adresse: string
  // Profil hockey
  club: string
  statut: 'gardien_actif' | 'ancien_gardien' | 'entraineur_gardien' | 'membre_soutien'
  division: string
  // Cotisation
  cotisation: 'actif_20' | 'soutien_10' | 'gratuit_0'
  // Engagements
  accept_statuts: boolean
  accept_rgpd: boolean
  autorisation_image: boolean
}
