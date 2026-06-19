/**
 * Couche d'accès aux données ANGB.
 * Essaie Supabase en premier — retombe sur les mock data si non configuré.
 */
import type {
  Listing, Thread, Post, GoalieProfile,
  ContactRequest, CareerEntry, TrainingEntry, EtudesEntry,
  Message, MessageMember,
} from './types'
import { getClient } from './supabase-client'

// Compat alias
export type Goalie = GoalieProfile

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_LISTINGS: Listing[] = [
  { id:'1', title:'Warrior Ritual G7 — Jambières',  category:'jambières', condition:'très bon état', price:28000, description:'Jambières Pro taille 33+1. Peu portées (20 matchs). Colorway custom.',  city:'Rouen',    seller_name:'Julien M.',    seller_division:'Magnus', created_at:'2026-06-01', is_active:true },
  { id:'2', title:'Bauer NME VTX — Masque',         category:'masque',    condition:'très bon état', price:32000, description:"Masque Pro. Cage cat-eye remplacée. Peinture personnalisée.",          city:'Paris',    seller_name:'Alexandre B.', seller_division:'D1',     created_at:'2026-06-02', is_active:true },
  { id:'3', title:'Vaughn V9 Pro — Gants',           category:'gants',     condition:'bon état',      price:19000, description:"Gant attrape-main + bloqueur. Taille standard. Lacets d'origine.",   city:'Bordeaux', seller_name:'Marc D.',      seller_division:'D2',     created_at:'2026-06-03', is_active:true },
  { id:'4', title:'CCM Axis Pro — Plastron',         category:'plastron',  condition:'très bon état', price:21000, description:'Plastron XL. Protège-gorge intégré. Protection dorsale maximale.',   city:'Grenoble', seller_name:'Hugo C.',      seller_division:'D2',     created_at:'2026-06-04', is_active:true },
  { id:'5', title:'Bauer Vapor 3X — Jambières',     category:'jambières', condition:'usage',         price:35000, description:"Jambières Senior 34+1. Bon état général malgré l'usure apparente.",  city:'Lyon',     seller_name:'Thomas R.',    seller_division:'D1',     created_at:'2026-06-05', is_active:true },
  { id:'6', title:'CCM Premier III — Crosse',        category:'crosse',    condition:'très bon état', price:5500,  description:'Crosse senior P31. Lame presque neuve. Peu utilisée.',               city:'Caen',     seller_name:'Mathis L.',    seller_division:'D1',     created_at:'2026-06-06', is_active:true },
]

const MOCK_THREADS: Thread[] = [
  { id:'1', title:"Bienvenue sur le forum officiel de l'ANGB",                         category:'ANGB & institutionnel', author_name:'Bureau ANGB', author_initials:'BA', is_pinned:true,  reply_count:12, last_activity:'2026-06-06', created_at:'2026-06-01' },
  { id:'2', title:'Ratio entraîneur gardien / gardiens en D1 — la réalité du terrain', category:'Technique & coaching',  author_name:'Julien M.',  author_initials:'JM', is_pinned:false, reply_count:24, last_activity:'2026-06-05', created_at:'2026-06-02' },
  { id:'3', title:'Stage gardiens Grenoble — juillet 2026 — inscriptions ouvertes',    category:'Stages & tournois',     author_name:'Hugo C.',    author_initials:'HC', is_pinned:false, reply_count:8,  last_activity:'2026-06-04', created_at:'2026-06-03' },
  { id:'4', title:"Protocole commotion ANGB — questions et retours d'expérience",      category:'Santé & blessures',     author_name:'Bureau ANGB', author_initials:'BA', is_pinned:false, reply_count:31, last_activity:'2026-06-03', created_at:'2026-06-03' },
  { id:'5', title:'Warrior Ritual vs Bauer Vapor — comparatif jambières',              category:'Équipement',            author_name:'Thomas R.',  author_initials:'TR', is_pinned:false, reply_count:19, last_activity:'2026-06-02', created_at:'2026-06-04' },
  { id:'6', title:'Programme prépa physique été 2026 — sans glace',                    category:'Prépa physique',        author_name:'Sophie R.',  author_initials:'SR', is_pinned:false, reply_count:43, last_activity:'2026-06-01', created_at:'2026-06-05' },
  { id:'7', title:'Cherche gardien pour Reims — D2 — saison 2026/2027',                category:'Vie des clubs',         author_name:'Club Reims', author_initials:'CR', is_pinned:false, reply_count:5,  last_activity:'2026-05-30', created_at:'2026-05-28' },
]

const MOCK_POSTS: Record<string, Post[]> = {
  '1': [
    { id:'p1', thread_id:'1', content:"Bienvenue à tous sur le forum de l'ANGB ! Cet espace est dédié aux échanges entre gardiens, entraîneurs et structures. Bonne discussion !", author_name:'Bureau ANGB', author_initials:'BA', created_at:'2026-06-01T10:00:00' },
    { id:'p2', thread_id:'1', content:"Super initiative ! J'attends ça depuis longtemps. Est-ce qu'on peut créer des sous-groupes par région ?", author_name:'Julien M.', author_initials:'JM', created_at:'2026-06-01T11:30:00' },
    { id:'p3', thread_id:'1', content:"C'est exactement ce que la communauté des gardiens français attendait.", author_name:'Sophie R.', author_initials:'SR', created_at:'2026-06-01T14:00:00' },
  ],
  '4': [
    { id:'p4', thread_id:'4', content:"Protocole officiel ANGB : tout choc à la tête = sortie immédiate. Retour progressif en 5 étapes sur 7 jours minimum. Aucun retour anticipé ne sera recommandé, quelle que soit l'importance du match.", author_name:'Bureau ANGB', author_initials:'BA', created_at:'2026-06-03T09:00:00' },
    { id:'p5', thread_id:'4', content:"J'ai eu une commotion l'an dernier. Mon club voulait que je revienne au bout de 3 jours. Ce protocole va dans le bon sens.", author_name:'Hugo C.', author_initials:'HC', created_at:'2026-06-03T10:15:00' },
  ],
}

// ── Profils mock (fondateurs + démo) ──────────────────────────────────────
// Seul Tonin Caubet a des données réelles (source : Elite Prospects).
// Les autres fondateurs complèteront leur fiche via le système de profil.
export const MOCK_GOALIE_PROFILES: GoalieProfile[] = [
  {
    id: 'f1', name: 'Tonin Caubet', category: 'gardien',
    club: 'Montpellier HC', division: 'D2', region: 'Occitanie',
    photo_url: '/images/tonin caubet.jpg',
    bio_note: 'Président fondateur ANGB · Gardien · Rouen Dragons (Magnus 2022-24) · International France U16, U18, U20',
    role_angb: 'Président fondateur',
    parcours: [
      { periode: '2026 – présent', club: 'Montpellier HC',  division: 'D2',     detail: 'Gardien' },
      { periode: '2024 – 2026',   club: 'Valenciennes HC', division: 'D2',     detail: 'Gardien' },
      { periode: '2022 – 2024',   club: 'Rouen Dragons',   division: 'Magnus', detail: "Backup · 25 matchs en 2022/23" },
      { periode: "Jusqu'en 2022", club: 'Anglet Hormadi',                      detail: 'Formation juniors' },
      { periode: 'Formation',     club: 'Bordeaux HC',                         detail: 'École de hockey' },
    ],
    etudes: [
      { diplome: 'Licence STAPS — Entraînement sportif', ecole: 'Spécialité hockey sur glace', annee: 'En cours' },
    ],
    palmares: [
      'International équipe de France U20 — Mondiaux D1B, Tallinn 2021',
      'Sélections équipe de France U16, U18, U20',
    ],
    is_active: true, is_founder: true, created_at: '2026-01-01',
  },
  { id:'f2', name:'Pacôme Courtoison', category:'gardien', photo_url:'/images/pacôme courtoison.jpeg', role_angb:'Fondateur', bio_note:'Fondateur ANGB', is_active:true, is_founder:true, created_at:'2026-01-01' },
  { id:'f3', name:'Steven Catelin',    category:'gardien', photo_url:'/images/steven catelin.png',      role_angb:'Fondateur', bio_note:'Fondateur ANGB', is_active:true, is_founder:true, created_at:'2026-01-01' },
  { id:'f4', name:'Flo Gourdin',       category:'gardien', photo_url:'/images/flo gourdin.jpg',          role_angb:'Fondateur', bio_note:'Fondateur ANGB', is_active:true, is_founder:true, created_at:'2026-01-01' },
  { id:'f5', name:'Jean-JP Fontaine',  category:'gardien', photo_url:'/images/jean jp fontaine.jpg',     role_angb:'Fondateur', bio_note:'Fondateur ANGB', is_active:true, is_founder:true, created_at:'2026-01-01' },
  { id:'f6', name:'Adrien Vazzaz',     category:'gardien', photo_url:'/images/adrien vazzaz.jpg',        role_angb:'Fondateur', bio_note:'Fondateur ANGB', is_active:true, is_founder:true, created_at:'2026-01-01' },
  // Démo
  { id:'1',  name:'Julien Martin',     club:'Rouen Dragons',   division:'Magnus',         region:'Normandie',          bio_note:'Gardien professionnel', is_active:true, created_at:'2026-06-01' },
  { id:'2',  name:'Alexandre Bonnard', club:'Bordeaux Boxers',  division:'D1',             region:'Nouvelle-Aquitaine', bio_note:'Titulaire D1',          is_active:true, created_at:'2026-06-01' },
  { id:'3',  name:'Mathis Laurent',    club:'Caen',             division:'D1',             region:'Normandie',          bio_note:'Gardien numéro 2',       is_active:true, created_at:'2026-06-01' },
  { id:'4',  name:'Sophie Renard',     club:'Paris Valkyries',  division:'Féminine Élite', region:'Île-de-France',      bio_note:'Internationale EDF',     is_active:true, created_at:'2026-06-01' },
  { id:'5',  name:'Hugo Chauveau',     club:'Grenoble B',       division:'D2',             region:'Rhône-Alpes',        bio_note:'Jeune gardien 19 ans',   is_active:true, created_at:'2026-06-01' },
]

// ─── Exports data-fetching ──────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const client = getClient()
  if (!client) return MOCK_LISTINGS
  const { data, error } = await client
    .from('listings').select('*').eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error || !data) return MOCK_LISTINGS
  return data as Listing[]
}

export async function getThreads(): Promise<Thread[]> {
  const client = getClient()
  if (!client) return MOCK_THREADS
  const { data, error } = await client
    .from('threads').select('*')
    .order('is_pinned', { ascending: false })
    .order('last_activity', { ascending: false })
  if (error || !data) return MOCK_THREADS
  return data as Thread[]
}

export async function getThread(id: string): Promise<Thread | null> {
  const client = getClient()
  if (!client) return MOCK_THREADS.find(t => t.id === id) ?? null
  const { data, error } = await client.from('threads').select('*').eq('id', id).single()
  if (error || !data) return MOCK_THREADS.find(t => t.id === id) ?? null
  return data as Thread
}

export async function getPosts(threadId: string): Promise<Post[]> {
  const client = getClient()
  if (!client) return MOCK_POSTS[threadId] ?? []
  const { data, error } = await client
    .from('posts').select('*').eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error || !data) return MOCK_POSTS[threadId] ?? []
  return data as Post[]
}

// ── Annuaire / Profils gardiens ─────────────────────────────────────────────

/** Récupère tous les profils actifs (DB → mock) */
export async function getGoalieProfiles(): Promise<GoalieProfile[]> {
  const client = getClient()
  if (!client) return MOCK_GOALIE_PROFILES
  try {
    const { data, error } = await client
      .from('goalie_profiles').select('*').eq('is_active', true)
      .order('is_founder', { ascending: false })
      .order('name', { ascending: true })
    if (error || !data) return MOCK_GOALIE_PROFILES
    // Les fondateurs (contenu curaté avec photos) sont toujours affichés ;
    // on ajoute ensuite les membres réels de la base (hors doublons de nom).
    const founders = MOCK_GOALIE_PROFILES.filter(g => g.is_founder)
    const founderNames = new Set(founders.map(f => f.name))
    const dbMembers = (data as GoalieProfile[]).filter(d => !founderNames.has(d.name))
    return [...founders, ...dbMembers]
  } catch { return MOCK_GOALIE_PROFILES }
}

/** Compat : utilisé par l'ancien code */
export async function getGoalies(): Promise<GoalieProfile[]> {
  return getGoalieProfiles()
}

/** Recherche par nom pour le lien parent-enfant */
export async function searchGoalieProfiles(query: string): Promise<GoalieProfile[]> {
  if (!query.trim()) return []
  const client = getClient()
  if (!client) {
    const q = query.toLowerCase()
    return MOCK_GOALIE_PROFILES.filter(g => g.name.toLowerCase().includes(q)).slice(0, 6)
  }
  try {
    const { data } = await client
      .from('goalie_profiles').select('*').eq('is_active', true)
      .ilike('name', `%${query}%`).limit(6)
    return (data ?? []) as GoalieProfile[]
  } catch { return [] }
}

/** Créer un profil gardien (à la création de compte) */
export async function createGoalieProfile(payload: {
  user_id: string; name: string; club?: string
  division?: string; region?: string; bio_note?: string
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true, id: 'demo-' + Date.now() }
  const { data, error } = await client
    .from('goalie_profiles').insert(payload).select('id').single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: (data as { id: string }).id }
}

/** Mettre à jour un profil gardien */
export async function updateGoalieProfile(
  id: string,
  patch: Partial<Pick<GoalieProfile, 'name' | 'club' | 'division' | 'region' | 'bio_note' | 'role_angb' | 'parcours' | 'formation' | 'etudes' | 'experiences' | 'palmares' | 'gallery' | 'photo_url'>>
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true } // mode démo
  const { error } = await client.from('goalie_profiles').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Lier un parent à un profil gardien */
export async function linkParentToGoalie(
  parentUserId: string,
  goalieProfileId: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client.from('parent_child_links').insert({
    parent_user_id: parentUserId,
    goalie_profile_id: goalieProfileId,
    status: 'approved',
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Récupérer les profils liés à un parent */
export async function getLinkedGoalieProfiles(parentUserId: string): Promise<GoalieProfile[]> {
  const client = getClient()
  if (!client) return []
  try {
    const { data } = await client
      .from('parent_child_links')
      .select('goalie_profiles(*)')
      .eq('parent_user_id', parentUserId)
      .eq('status', 'approved')
    return (data ?? []).map((l: Record<string, unknown>) => l.goalie_profiles).filter(Boolean) as GoalieProfile[]
  } catch { return [] }
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function createListing(
  payload: Omit<Listing, 'id' | 'created_at' | 'is_active'>,
  userId?: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client
    .from('listings').insert({ ...payload, is_active: true, user_id: userId })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function createPost(payload: {
  thread_id: string; content: string; author_name?: string; author_initials?: string
}): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client.from('posts').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Crée un nouveau sujet de forum (réservé aux membres actifs via RLS). */
export async function createThread(payload: {
  title: string; category: string; tag?: string; author_name?: string; author_initials?: string
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { data, error } = await client
    .from('threads')
    .insert({ ...payload, is_pinned: false, reply_count: 0, last_activity: new Date().toISOString() })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: (data as { id: string } | null)?.id }
}

export async function submitAdhesion(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; code?: string }> {
  // Passe par l'API route server-side : crée le compte + sauvegarde + email Resend
  try {
    const res = await fetch('/api/adhesion', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
      return { ok: false, error: data.error ?? 'Erreur serveur', code: data.code }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Erreur réseau — vérifiez votre connexion' }
  }
}

export async function createContactRequest(
  payload: ContactRequest
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client.from('contact_requests').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── Messagerie interne ──────────────────────────────────────────────────────

/** Membres joignables (comptes actifs présents dans l'annuaire). */
export async function getMessageableMembers(): Promise<MessageMember[]> {
  const client = getClient()
  if (!client) return []
  const { data } = await client
    .from('goalie_profiles')
    .select('user_id, name, photo_url')
    .not('user_id', 'is', null)
    .eq('is_active', true)
    .order('name')
  return (data ?? []) as MessageMember[]
}

/** Tous les messages impliquant l'utilisateur (boîte de réception, ordre chronologique). */
export async function getInboxMessages(userId: string): Promise<Message[]> {
  const client = getClient()
  if (!client) return []
  const { data } = await client
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true })
  return (data ?? []) as Message[]
}

/** Envoie un message (RLS : expéditeur = soi, les deux doivent être membres actifs). */
export async function sendMessage(
  senderId: string, recipientId: string, content: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, content: content.trim() })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Marque comme lus les messages reçus d'un interlocuteur donné. */
export async function markConversationRead(userId: string, otherUserId: string): Promise<void> {
  const client = getClient()
  if (!client) return
  await client
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('sender_id', otherUserId)
    .is('read_at', null)
}

// ── Storage — upload photo ──────────────────────────────────────────────────

export async function uploadGoaliePhoto(
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const client = getClient()
  if (!client) return { error: 'Non configuré' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await client.storage
    .from('goalie-avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadErr) return { error: uploadErr.message }

  const { data: { publicUrl } } = client.storage
    .from('goalie-avatars')
    .getPublicUrl(path)

  return { url: publicUrl }
}

// ── Auth helpers (profils utilisateurs) ────────────────────────────────────

export async function createUserProfile(
  userId: string, role: 'gardien' | 'parent', displayName: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: true }
  const { error } = await client.from('profiles').upsert(
    { id: userId, role, display_name: displayName },
    { onConflict: 'id' }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
