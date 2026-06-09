-- ============================================================
-- ANGB — Authentification & Profils utilisateurs
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- 1. PROFILS (étend Supabase Auth)
-- -------------------------------------------------------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'gardien'
               check (role in ('gardien', 'parent', 'admin')),
  display_name text not null default '',
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Lecture profil propre"
  on profiles for select using (auth.uid() = id);
create policy "Insertion profil propre"
  on profiles for insert with check (auth.uid() = id);
create policy "Mise à jour profil propre"
  on profiles for update using (auth.uid() = id);


-- 2. GOALIE_PROFILES (l'annuaire enrichi)
-- -------------------------------------------------------
create table if not exists goalie_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  name        text not null,
  club        text,
  division    text,
  region      text,
  photo_url   text,
  bio_note    text,
  role_angb   text,
  parcours    jsonb  default '[]'::jsonb,
  formation   jsonb  default '[]'::jsonb,
  etudes      jsonb  default '[]'::jsonb,
  palmares    text[] default array[]::text[],
  is_active   boolean default true,
  is_founder  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists goalie_profiles_user_idx    on goalie_profiles(user_id);
create index if not exists goalie_profiles_active_idx  on goalie_profiles(is_active);
create index if not exists goalie_profiles_name_idx    on goalie_profiles(lower(name));

-- Trigger updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger goalie_profiles_updated_at
  before update on goalie_profiles
  for each row execute function update_updated_at();

alter table goalie_profiles enable row level security;

-- Lecture publique (annuaire)
create policy "Lecture publique annuaire"
  on goalie_profiles for select using (is_active = true);

-- Création par tout utilisateur authentifié
create policy "Création profil authentifié"
  on goalie_profiles for insert with check (auth.uid() is not null);

-- Modification : propriétaire OU parent lié
create policy "Modification propriétaire ou parent lié"
  on goalie_profiles for update using (
    user_id = auth.uid()
    or exists (
      select 1 from parent_child_links
      where parent_user_id = auth.uid()
        and goalie_profile_id = goalie_profiles.id
        and status = 'approved'
    )
  );


-- 3. PARENT_CHILD_LINKS (lien parent ↔ gardien enfant)
-- -------------------------------------------------------
create table if not exists parent_child_links (
  id                uuid primary key default gen_random_uuid(),
  parent_user_id    uuid not null references profiles(id) on delete cascade,
  goalie_profile_id uuid not null references goalie_profiles(id) on delete cascade,
  status            text default 'approved'
                    check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz default now(),
  unique(parent_user_id, goalie_profile_id)
);

alter table parent_child_links enable row level security;

create policy "Parents gèrent leurs liens"
  on parent_child_links for all using (parent_user_id = auth.uid());

create policy "Gardiens voient les liens qui les concernent"
  on parent_child_links for select using (
    exists (
      select 1 from goalie_profiles
      where id = goalie_profile_id and user_id = auth.uid()
    )
  );


-- 4. MISE À JOUR de listings (ajout user_id)
-- -------------------------------------------------------
alter table listings add column if not exists
  user_id uuid references profiles(id) on delete set null;

create index if not exists listings_user_idx on listings(user_id);

-- Remplacer la policy permissive par une policy auth
drop policy if exists "N'importe qui peut créer une annonce (v1 sans auth)" on listings;

create policy "Utilisateurs authentifiés créent des annonces"
  on listings for insert with check (auth.uid() is not null);

create policy "Propriétaire modifie ses annonces"
  on listings for update using (user_id = auth.uid());

create policy "Propriétaire supprime ses annonces"
  on listings for delete using (user_id = auth.uid());
