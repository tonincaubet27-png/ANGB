/**
 * Couche d'accès aux données ANGB.
 * Essaie Supabase en premier — retombe sur les mock data si non configuré.
 */

import type { Listing, Thread, Post, Goalie } from './types'
import { createClient } from '@supabase/supabase-js'

// ─── Client browser (null si non configuré) ────────────────────────────────
function getBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === '' || key === '') return null
  return createClient(url, key)
}

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
  { id:'1', title:"Bienvenue sur le forum officiel de l'ANGB",                      category:'ANGB & institutionnel', author_name:'Bureau ANGB', author_initials:'BA', is_pinned:true,  reply_count:12, last_activity:'2026-06-06', created_at:'2026-06-01' },
  { id:'2', title:'Ratio entraîneur gardien / gardiens en D1 — la réalité du terrain', category:'Technique & coaching',  author_name:'Julien M.',  author_initials:'JM', is_pinned:false, reply_count:24, last_activity:'2026-06-05', created_at:'2026-06-02' },
  { id:'3', title:'Stage gardiens Grenoble — juillet 2026 — inscriptions ouvertes', category:'Stages & tournois',    author_name:'Hugo C.',    author_initials:'HC', is_pinned:false, reply_count:8,  last_activity:'2026-06-04', created_at:'2026-06-03' },
  { id:'4', title:"Protocole commotion ANGB — questions et retours d'expérience",   category:'Santé & blessures',    author_name:'Bureau ANGB', author_initials:'BA', is_pinned:false, reply_count:31, last_activity:'2026-06-03', created_at:'2026-06-03' },
  { id:'5', title:'Warrior Ritual vs Bauer Vapor — comparatif jambières',           category:'Équipement',           author_name:'Thomas R.',  author_initials:'TR', is_pinned:false, reply_count:19, last_activity:'2026-06-02', created_at:'2026-06-04' },
  { id:'6', title:'Programme prépa physique été 2026 — sans glace',                 category:'Prépa physique',       author_name:'Sophie R.',  author_initials:'SR', is_pinned:false, reply_count:43, last_activity:'2026-06-01', created_at:'2026-06-05' },
  { id:'7', title:'Cherche gardien pour Reims — D2 — saison 2026/2027',             category:'Vie des clubs',        author_name:'Club Reims', author_initials:'CR', is_pinned:false, reply_count:5,  last_activity:'2026-05-30', created_at:'2026-05-28' },
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

const MOCK_GOALIES: Goalie[] = [
  { id:'1', name:'Tonin Caubet',     club:'Montpellier',      division:'Magnus',         region:'Occitanie',          bio_note:'Gardien professionnel · Ex-Rouen Dragons · 2× Champion Ligue Magnus · International jeunes', is_active:true, created_at:'2026-06-01' },
  { id:'2', name:'Julien Martin',    club:'Rouen Dragons',    division:'Magnus',         region:'Normandie',          bio_note:'Gardien professionnel · Expérience internationale clubs', is_active:true, created_at:'2026-06-01' },
  { id:'3', name:'Alexandre Bonnard',club:'Bordeaux Boxers',  division:'D1',             region:'Nouvelle-Aquitaine', bio_note:'Titulaire · Formation Bordeaux · En progression vers le pro', is_active:true, created_at:'2026-06-01' },
  { id:'4', name:'Mathis Laurent',   club:'Caen',             division:'D1',             region:'Normandie',          bio_note:'Numéro 2 · Disponible pour prêt', is_active:true, created_at:'2026-06-01' },
  { id:'5', name:'Sophie Renard',    club:'Paris Valkyries',  division:'Féminine Élite', region:'Île-de-France',      bio_note:'Internationale · Capitaine EDF féminine jeunes', is_active:true, created_at:'2026-06-01' },
  { id:'6', name:'Hugo Chauveau',    club:'Grenoble B',       division:'D2',             region:'Rhône-Alpes',        bio_note:'Jeune gardien · 19 ans · Formation CREPS Rhône-Alpes', is_active:true, created_at:'2026-06-01' },
]

// ─── Exports data-fetching ──────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const client = getBrowserClient()
  if (!client) return MOCK_LISTINGS

  const { data, error } = await client
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !data) return MOCK_LISTINGS
  return data as Listing[]
}

export async function getThreads(): Promise<Thread[]> {
  const client = getBrowserClient()
  if (!client) return MOCK_THREADS

  const { data, error } = await client
    .from('threads')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('last_activity', { ascending: false })

  if (error || !data) return MOCK_THREADS
  return data as Thread[]
}

export async function getThread(id: string): Promise<Thread | null> {
  const client = getBrowserClient()
  if (!client) return MOCK_THREADS.find(t => t.id === id) ?? null

  const { data, error } = await client
    .from('threads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return MOCK_THREADS.find(t => t.id === id) ?? null
  return data as Thread
}

export async function getPosts(threadId: string): Promise<Post[]> {
  const client = getBrowserClient()
  if (!client) return MOCK_POSTS[threadId] ?? []

  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error || !data) return MOCK_POSTS[threadId] ?? []
  return data as Post[]
}

export async function getGoalies(): Promise<Goalie[]> {
  const client = getBrowserClient()
  if (!client) return MOCK_GOALIES

  const { data, error } = await client
    .from('goalies')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data) return MOCK_GOALIES
  return data as Goalie[]
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function createListing(payload: Omit<Listing, 'id' | 'created_at' | 'is_active'>): Promise<{ ok: boolean; error?: string }> {
  const client = getBrowserClient()
  if (!client) return { ok: true } // mode démo : on fait semblant

  const { error } = await client.from('listings').insert({ ...payload, is_active: true })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function createPost(payload: { thread_id: string; content: string; author_name?: string; author_initials?: string }): Promise<{ ok: boolean; error?: string }> {
  const client = getBrowserClient()
  if (!client) return { ok: true }

  const { error } = await client.from('posts').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function submitAdhesion(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  const client = getBrowserClient()
  if (!client) return { ok: true }

  const { error } = await client.from('adhesion_requests').insert(payload)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
