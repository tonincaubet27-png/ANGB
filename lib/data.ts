/**
 * Couche d'accès aux données ANGB.
 * Lit Supabase. En cas d'erreur ou de base non configurée : retour vide (jamais de fausses données).
 */
import type {
  Listing, Thread, Post, GoalieProfile,
  ContactRequest, CareerEntry, TrainingEntry, EtudesEntry,
  Message, MessageMember, Stage, Article,
} from './types'
import { getClient } from './supabase-client'

const UNAVAILABLE = 'Service momentanément indisponible (maintenance en cours). Réessaie plus tard.'

// Compat alias
export type Goalie = GoalieProfile

// ── Fondateurs (fiches réelles curées, affichées avec les fiches de la base) ──────────────────────────────────────
// Seul Tonin Caubet a des données réelles (source : Elite Prospects).
// Les autres fondateurs complèteront leur fiche via le système de profil.
export const FOUNDER_PROFILES: GoalieProfile[] = [
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
]

// ─── Exports data-fetching ──────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client
    .from('listings').select('*').eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data as Listing[]
}

export async function getThreads(): Promise<Thread[]> {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client
    .from('threads').select('*')
    .order('is_pinned', { ascending: false })
    .order('last_activity', { ascending: false })
  if (error || !data) return []
  return data as Thread[]
}

export async function getThread(id: string): Promise<Thread | null> {
  const client = getClient()
  if (!client) return null
  const { data, error } = await client.from('threads').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Thread
}

export async function getPosts(threadId: string): Promise<Post[]> {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client
    .from('posts').select('*').eq('thread_id', threadId)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data as Post[]
}

// ── Annuaire / Profils gardiens ─────────────────────────────────────────────

/** Profils actifs de la base + fondateurs curés. Base indisponible : liste vide. */
export async function getGoalieProfiles(): Promise<GoalieProfile[]> {
  const client = getClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('goalie_profiles').select('*').eq('is_active', true)
      .order('is_founder', { ascending: false })
      .order('name', { ascending: true })
    if (error || !data) return []
    // On PRIVILÉGIE les vraies fiches de la base (elles contiennent les infos
    // saisies par les membres). Un fondateur curaté (mock) n'est affiché que s'il
    // n'a pas encore de compte réel. Si un fondateur a une vraie fiche, on garde
    // la fiche réelle en récupérant juste sa photo curatée à défaut.
    // Le rapprochement se fait sur les tokens « significatifs » (≥5 lettres, ex.
    // le nom de famille) pour tolérer les variantes d'écriture du prénom/ordre.
    const sig = (s: string): string[] =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .split(/[\s-]+/).filter(t => t.length >= 5)
    // Vrai si TOUS les tokens significatifs du fondateur figurent dans le nom DB
    // (évite qu'un parent du même nom de famille soit pris pour le fondateur).
    const founderMatches = (founderName: string, dbName: string) => {
      const F = sig(founderName), D = sig(dbName)
      return F.length > 0 && F.every(t => D.includes(t))
    }
    const dbProfiles = data as GoalieProfile[]
    const founders = FOUNDER_PROFILES.filter(g => g.is_founder)
    const merged = dbProfiles.map(d => {
      const f = founders.find(ff => founderMatches(ff.name, d.name))
      return f ? { ...d, photo_url: d.photo_url || f.photo_url, is_founder: true } : d
    })
    const mockOnly = founders.filter(f => !dbProfiles.some(d => founderMatches(f.name, d.name)))
    return [...mockOnly, ...merged]
  } catch { return [] }
}

/** Compat : utilisé par l'ancien code */
export async function getGoalies(): Promise<GoalieProfile[]> {
  return getGoalieProfiles()
}

/** Recherche par nom pour le lien parent-enfant */
export async function searchGoalieProfiles(query: string): Promise<GoalieProfile[]> {
  if (!query.trim()) return []
  const client = getClient()
  if (!client) return []
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
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { data, error } = await client
    .from('goalie_profiles').insert(payload).select('id').single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, id: (data as { id: string }).id }
}

/** Mettre à jour un profil gardien */
export async function updateGoalieProfile(
  id: string,
  patch: Partial<Pick<GoalieProfile, 'name' | 'club' | 'division' | 'region' | 'bio_note' | 'role_angb' | 'parcours' | 'formation' | 'etudes' | 'experiences' | 'palmares' | 'gallery' | 'photo_url' | 'cover_url'>>
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { error } = await client.from('goalie_profiles').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Demande de lien parent-enfant : créée « en attente », activée seulement après validation du bureau. */
export async function linkParentToGoalie(
  parentUserId: string,
  goalieProfileId: string
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { error } = await client.from('parent_child_links').insert({
    parent_user_id: parentUserId,
    goalie_profile_id: goalieProfileId,
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
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { error } = await client
    .from('listings').insert({ ...payload, is_active: true, user_id: userId })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function createPost(payload: {
  thread_id: string; content: string; author_name?: string; author_initials?: string
}): Promise<{ ok: boolean; error?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { error } = await client.from('posts').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Stages actifs (lecture publique), triés par date de début. */
export async function getStages(): Promise<Stage[]> {
  const client = getClient()
  if (!client) return []
  try {
    const { data, error } = await client.from('stages').select('*').eq('is_active', true).order('date_debut', { ascending: true })
    if (error || !data) return []
    return data as Stage[]
  } catch { return [] }
}

/** Crée un nouveau sujet de forum (réservé aux membres actifs via RLS). */
export async function createThread(payload: {
  title: string; category: string; tag?: string; author_name?: string; author_initials?: string
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const client = getClient()
  if (!client) return { ok: false, error: UNAVAILABLE }
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
  if (!client) return { ok: false, error: UNAVAILABLE }
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
  if (!client) return { ok: false, error: UNAVAILABLE }
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
  if (!client) return { ok: false, error: UNAVAILABLE }
  const { error } = await client.from('profiles').upsert(
    { id: userId, role, display_name: displayName },
    { onConflict: 'id' }
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ── Savoirs & actualités ────────────────────────────────────────────────────

/** Articles publiés (résumés publics), du plus récent au plus ancien. */
export async function getArticles(): Promise<Article[]> {
  const client = getClient()
  if (!client) return []
  const { data, error } = await client.from('articles').select('*')
    .eq('is_published', true).order('published_at', { ascending: false })
  if (error || !data) return []
  return data as Article[]
}

export async function getArticle(id: string): Promise<Article | null> {
  const client = getClient()
  if (!client) return null
  const { data } = await client.from('articles').select('*').eq('id', id).maybeSingle()
  return (data as Article | null) ?? null
}

/** Texte complet + lien. Renvoie null si l'article est réservé aux membres et que le visiteur ne l'est pas. */
export async function getArticleBody(id: string): Promise<{ body: string; lien: string | null } | null> {
  const client = getClient()
  if (!client) return null
  const { data } = await client.from('article_bodies').select('body, lien').eq('article_id', id).maybeSingle()
  return (data as { body: string; lien: string | null } | null) ?? null
}
