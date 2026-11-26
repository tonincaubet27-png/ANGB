-- ============================================================
-- ANGB : reconstruction complète de la base (remplace 001 à 014)
-- À exécuter UNE fois, en entier, dans le SQL Editor d'un NOUVEAU projet Supabase.
-- Tout passe ou rien ne passe (transaction). Peut être relancé sans danger.
-- ============================================================
begin;

-- ── 1. PROFILS ──────────────────────────────────────────────
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  role              text not null default 'gardien' check (role in ('gardien', 'parent', 'admin')),
  display_name      text not null default '',
  membership_status text not null default 'pending' check (membership_status in ('pending', 'active', 'rejected')),
  created_at        timestamptz default now()
);

-- ── 2. ANNUAIRE ─────────────────────────────────────────────
create table if not exists goalie_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  name        text not null,
  category    text not null default 'gardien'
              check (category in ('gardien', 'entraineur_gardien', 'entraineur', 'joueur', 'membre_soutien')),
  club        text,
  division    text,
  region      text,
  photo_url   text,
  cover_url   text,
  bio_note    text,
  role_angb   text,
  parcours    jsonb  default '[]'::jsonb,
  formation   jsonb  default '[]'::jsonb,
  etudes      jsonb  default '[]'::jsonb,
  experiences jsonb  default '[]'::jsonb,
  palmares    text[] default array[]::text[],
  gallery     text[] default '{}',
  is_active   boolean default true,
  is_founder  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists goalie_profiles_user_idx     on goalie_profiles(user_id);
create index if not exists goalie_profiles_active_idx   on goalie_profiles(is_active);
create index if not exists goalie_profiles_name_idx     on goalie_profiles(lower(name));
create index if not exists goalie_profiles_category_idx on goalie_profiles(category);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists goalie_profiles_updated_at on goalie_profiles;
create trigger goalie_profiles_updated_at
  before update on goalie_profiles
  for each row execute function update_updated_at();

create table if not exists parent_child_links (
  id                uuid primary key default gen_random_uuid(),
  parent_user_id    uuid not null references profiles(id) on delete cascade,
  goalie_profile_id uuid not null references goalie_profiles(id) on delete cascade,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz default now(),
  unique(parent_user_id, goalie_profile_id)
);
-- Rejeu sur une base existante : un lien n'est jamais actif par défaut.
alter table parent_child_links alter column status set default 'pending';

-- ── 3. BOURSE D'ÉQUIPEMENT ──────────────────────────────────
create table if not exists listings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete set null,
  title           text not null,
  category        text not null check (category in ('masque','plastron','gants','jambières','culotte','coquille','genouillères','protège-cou','patins','crosse','complet','autre')),
  condition       text not null check (condition in ('très bon état','bon état','usage')),
  price           integer not null,   -- en centimes
  description     text,
  city            text,
  seller_name     text,
  seller_division text,
  photos          text[] default '{}',
  is_active       boolean default true,
  created_at      timestamptz default now()
);
create index if not exists listings_category_idx  on listings(category);
create index if not exists listings_condition_idx on listings(condition);
create index if not exists listings_active_idx    on listings(is_active);
create index if not exists listings_user_idx      on listings(user_id);

create table if not exists contact_requests (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references listings(id) on delete cascade,
  listing_title text not null,
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  message       text,
  status        text default 'pending' check (status in ('pending','responded','closed')),
  created_at    timestamptz default now()
);
create index if not exists contact_requests_listing_idx on contact_requests(listing_id);
create index if not exists contact_requests_status_idx  on contact_requests(status);

-- ── 4. FORUM ────────────────────────────────────────────────
create table if not exists threads (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  category        text not null,
  tag             text default 'Débat' check (tag in ('Officiel','Débat','Santé','Équipement','Tournoi','Retour')),
  author_name     text,
  author_initials varchar(2),
  is_pinned       boolean default false,
  reply_count     integer default 0,
  last_activity   timestamptz default now(),
  created_at      timestamptz default now()
);
create index if not exists threads_category_idx on threads(category);
create index if not exists threads_pinned_idx   on threads(is_pinned desc, last_activity desc);

create table if not exists posts (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid references threads(id) on delete cascade,
  content         text not null,
  author_name     text,
  author_initials varchar(2),
  created_at      timestamptz default now()
);
create index if not exists posts_thread_idx on posts(thread_id, created_at);

-- Le compteur est mis à jour par la base : les membres n'ont pas le droit de modifier un sujet.
create or replace function increment_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update threads set reply_count = reply_count + 1, last_activity = now() where id = new.thread_id;
  return new;
end;
$$;
drop trigger if exists on_post_insert on posts;
create trigger on_post_insert
  after insert on posts
  for each row execute function increment_reply_count();

-- ── 5. ADHÉSIONS ────────────────────────────────────────────
create table if not exists adhesion_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  nom                text not null,
  prenom             text not null,
  date_naissance     date,
  telephone          text,
  email              text not null,
  adresse            text,
  club               text,
  statut             text,   -- plusieurs valeurs séparées par des virgules
  division           text,
  categorie_enfant   text,
  cotisation         text check (cotisation in ('actif_20','soutien_10','gratuit_0')),
  accept_statuts     boolean not null default false,
  accept_rgpd        boolean not null default false,
  autorisation_image boolean default false,
  status             text default 'pending' check (status in ('pending','validated','rejected')),
  member_no          integer unique,
  created_at         timestamptz default now()
);
create index if not exists adhesion_requests_user_idx on adhesion_requests(user_id);
create index if not exists idx_adhesion_status        on adhesion_requests(status, created_at desc);

-- ── 6. MESSAGERIE ───────────────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 4000),
  created_at   timestamptz not null default now(),
  read_at      timestamptz,
  constraint no_self_message check (sender_id <> recipient_id)
);
create index if not exists messages_pair_idx      on messages(sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on messages(recipient_id, created_at desc);

-- ── 7. STAGES & CONTENU ─────────────────────────────────────
create table if not exists stages (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  organisateur text,
  periode      text,
  date_debut   date,
  lieu         text,
  audience     text,
  niveau       text,
  tarif        text,
  places       text,
  description  text,
  image        text,
  lien         text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists site_content (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- ── 7 bis. SAVOIRS & ACTUALITÉS (gérés depuis /admin/articles) ──
-- Le résumé est public ; le texte complet est dans une table à part pour pouvoir
-- le réserver aux membres.
create table if not exists articles (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  rubrique     text not null,
  format       text not null default 'article' check (format in ('article','video','interview','podcast','reportage')),
  resume       text,
  image        text,
  members_only boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists articles_rubrique_idx on articles(rubrique, published_at desc);

create table if not exists article_bodies (
  article_id uuid primary key references articles(id) on delete cascade,
  body       text not null default '',
  lien       text
);

-- Si d'anciennes tables existent déjà (rejeu partiel des anciennes migrations), on complète les colonnes manquantes.
alter table goalie_profiles add column if not exists cover_url   text;
alter table goalie_profiles add column if not exists role_angb   text;
alter table goalie_profiles add column if not exists formation   jsonb  default '[]'::jsonb;
alter table goalie_profiles add column if not exists etudes      jsonb  default '[]'::jsonb;
alter table goalie_profiles add column if not exists experiences jsonb  default '[]'::jsonb;
alter table goalie_profiles add column if not exists palmares    text[] default array[]::text[];
alter table goalie_profiles add column if not exists gallery     text[] default '{}';
alter table goalie_profiles add column if not exists is_founder  boolean default false;
alter table goalie_profiles add column if not exists category    text not null default 'gardien';
alter table listings add column if not exists photos text[] default '{}';
alter table listings add column if not exists size_range  text;
alter table listings add column if not exists size_detail text;
alter table listings drop constraint if exists listings_category_check;
alter table listings add constraint listings_category_check check (category in ('masque','plastron','gants','jambières','culotte','coquille','genouillères','protège-cou','patins','crosse','complet','autre'));
alter table adhesion_requests add column if not exists member_no integer;
alter table adhesion_requests add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Entraîneurs gardiens : seul le bureau valide (colonne non modifiable par les membres).
alter table goalie_profiles add column if not exists coach_verified boolean not null default false;
alter table goalie_profiles add column if not exists coach_zone text;

-- ── 8. DROITS D'ACCÈS ───────────────────────────────────────
-- Les nouveaux projets Supabase n'exposent plus les tables automatiquement :
-- chaque droit est donné ici explicitement. Les colonnes sensibles restent
-- modifiables uniquement par le serveur (service_role).
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;

grant select on listings, threads, posts, goalie_profiles, stages, site_content, articles, article_bodies to anon, authenticated;
grant insert on contact_requests to anon, authenticated;

grant select on profiles to authenticated;
grant insert (id, role, display_name) on profiles to authenticated;
grant update (id, role, display_name) on profiles to authenticated;

grant insert (user_id, name, club, division, region, bio_note, photo_url) on goalie_profiles to authenticated;
grant update (name, club, division, region, photo_url, cover_url, bio_note, role_angb,
              parcours, formation, etudes, experiences, palmares, gallery) on goalie_profiles to authenticated;

-- Un parent peut seulement DEMANDER un lien (status = 'pending' par défaut) ; seul le bureau (service_role) l'active.
grant select, delete on parent_child_links to authenticated;
grant insert (parent_user_id, goalie_profile_id) on parent_child_links to authenticated;
grant insert, update, delete on listings to authenticated;
grant insert on threads, posts to authenticated;

grant select, insert, delete on messages to authenticated;
grant update (read_at) on messages to authenticated;

-- ── 9. RÈGLES PAR LIGNE (RLS) ───────────────────────────────
alter table profiles           enable row level security;
alter table goalie_profiles    enable row level security;
alter table parent_child_links enable row level security;
alter table listings           enable row level security;
alter table contact_requests   enable row level security;
alter table threads            enable row level security;
alter table posts              enable row level security;
alter table adhesion_requests  enable row level security;  -- aucun accès public : serveur uniquement
alter table messages           enable row level security;
alter table stages             enable row level security;
alter table site_content       enable row level security;
alter table articles           enable row level security;
alter table article_bodies     enable row level security;

-- Vérifie le statut d'un membre sans exposer la table profiles.
create or replace function is_active_member(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = uid and membership_status = 'active');
$$;
revoke all on function is_active_member(uuid) from public;
grant execute on function is_active_member(uuid) to anon, authenticated, service_role;

drop policy if exists "Lecture profil propre" on profiles;
create policy "Lecture profil propre" on profiles for select using (auth.uid() = id);
drop policy if exists "Insertion profil propre" on profiles;
create policy "Insertion profil propre" on profiles for insert with check (auth.uid() = id and role in ('gardien','parent'));
drop policy if exists "Mise à jour profil propre" on profiles;
create policy "Mise à jour profil propre" on profiles for update using (auth.uid() = id) with check (auth.uid() = id and role in ('gardien','parent'));

drop policy if exists "Lecture publique annuaire" on goalie_profiles;
create policy "Lecture publique annuaire" on goalie_profiles for select using (is_active = true);
drop policy if exists "Création de sa propre fiche" on goalie_profiles;
create policy "Création de sa propre fiche" on goalie_profiles for insert with check (user_id = auth.uid());
drop policy if exists "Modification propriétaire ou parent lié" on goalie_profiles;
create policy "Modification propriétaire ou parent lié" on goalie_profiles for update using (
  user_id = auth.uid()
  or exists (
    select 1 from parent_child_links
    where parent_user_id = auth.uid() and goalie_profile_id = goalie_profiles.id and status = 'approved'
  )
);

drop policy if exists "Parents gèrent leurs liens" on parent_child_links;
drop policy if exists "Parents voient leurs liens" on parent_child_links;
create policy "Parents voient leurs liens" on parent_child_links for select using (parent_user_id = auth.uid());
drop policy if exists "Parents demandent un lien" on parent_child_links;
create policy "Parents demandent un lien" on parent_child_links for insert
  with check (parent_user_id = auth.uid() and status = 'pending');
drop policy if exists "Parents suppriment leurs liens" on parent_child_links;
create policy "Parents suppriment leurs liens" on parent_child_links for delete using (parent_user_id = auth.uid());
drop policy if exists "Gardiens voient les liens qui les concernent" on parent_child_links;
create policy "Gardiens voient les liens qui les concernent" on parent_child_links for select using (
  exists (select 1 from goalie_profiles where id = goalie_profile_id and user_id = auth.uid())
);

drop policy if exists "Tout le monde peut lire les annonces actives" on listings;
create policy "Tout le monde peut lire les annonces actives" on listings for select using (is_active = true);
drop policy if exists "Membres actifs créent des annonces" on listings;
create policy "Membres actifs créent des annonces" on listings for insert
  with check (user_id = auth.uid() and is_active_member(auth.uid()));
drop policy if exists "Propriétaire modifie ses annonces" on listings;
create policy "Propriétaire modifie ses annonces" on listings for update using (user_id = auth.uid());
drop policy if exists "Propriétaire supprime ses annonces" on listings;
create policy "Propriétaire supprime ses annonces" on listings for delete using (user_id = auth.uid());

drop policy if exists "Insertion publique des demandes de contact" on contact_requests;
create policy "Insertion publique des demandes de contact" on contact_requests for insert with check (true);

drop policy if exists "Lecture publique des threads" on threads;
create policy "Lecture publique des threads" on threads for select using (true);
drop policy if exists "Membres actifs créent des threads" on threads;
create policy "Membres actifs créent des threads" on threads for insert with check (is_active_member(auth.uid()));

drop policy if exists "Lecture publique des posts" on posts;
create policy "Lecture publique des posts" on posts for select using (true);
drop policy if exists "Membres actifs créent des posts" on posts;
create policy "Membres actifs créent des posts" on posts for insert with check (is_active_member(auth.uid()));

drop policy if exists "Lecture de mes messages" on messages;
create policy "Lecture de mes messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "Envoi de messages (membres actifs)" on messages;
create policy "Envoi de messages (membres actifs)" on messages for insert
  with check (auth.uid() = sender_id and is_active_member(auth.uid()) and is_active_member(recipient_id));
drop policy if exists "Marquer mes messages comme lus" on messages;
create policy "Marquer mes messages comme lus" on messages for update
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
drop policy if exists "Supprimer mon message" on messages;
create policy "Supprimer mon message" on messages for delete using (auth.uid() = sender_id);

drop policy if exists "Lecture publique des stages actifs" on stages;
create policy "Lecture publique des stages actifs" on stages for select using (is_active = true);
drop policy if exists "Lecture publique du contenu" on site_content;
create policy "Lecture publique du contenu" on site_content for select using (true);

drop policy if exists "Lecture publique des articles publiés" on articles;
create policy "Lecture publique des articles publiés" on articles for select using (is_published = true);
drop policy if exists "Texte complet : public ou membres" on article_bodies;
create policy "Texte complet : public ou membres" on article_bodies for select using (
  exists (
    select 1 from articles a
    where a.id = article_id and a.is_published = true
      and (a.members_only = false or is_active_member(auth.uid()))
  )
);

-- ── 10. TEMPS RÉEL (messagerie) ─────────────────────────────
do $$
begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null;
end $$;

-- ── 11. PHOTOS (bucket public, chacun écrit dans son dossier) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('goalie-avatars', 'goalie-avatars', true, 10485760, array['image/*'])
on conflict (id) do update set public = true;

drop policy if exists "ANGB lecture publique avatars" on storage.objects;
create policy "ANGB lecture publique avatars" on storage.objects for select
  using (bucket_id = 'goalie-avatars');
drop policy if exists "ANGB upload dans son dossier" on storage.objects;
create policy "ANGB upload dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'goalie-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "ANGB remplacement dans son dossier" on storage.objects;
create policy "ANGB remplacement dans son dossier" on storage.objects for update to authenticated
  using (bucket_id = 'goalie-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "ANGB suppression dans son dossier" on storage.objects;
create policy "ANGB suppression dans son dossier" on storage.objects for delete to authenticated
  using (bucket_id = 'goalie-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── 12. CONTENU DE DÉPART ───────────────────────────────────
-- Aucun stage de départ : les événements de l'ANGB s'ajoutent depuis /admin/stages.

-- Le sujet d'accueil du forum.
insert into threads (id, title, category, tag, author_name, author_initials, is_pinned)
values ('00000000-0000-0000-0000-000000000001', 'Bienvenue sur le forum officiel de l''ANGB', 'ANGB & institutionnel', 'Officiel', 'Bureau ANGB', 'BA', true)
on conflict (id) do nothing;
insert into posts (thread_id, content, author_name, author_initials)
select '00000000-0000-0000-0000-000000000001',
       'Bienvenue à tous sur le forum de l''ANGB ! Cet espace est dédié aux échanges entre gardiens, entraîneurs et structures. Bonne discussion !',
       'Bureau ANGB', 'BA'
where not exists (select 1 from posts where thread_id = '00000000-0000-0000-0000-000000000001');

commit;
