-- ============================================================
-- ANGB — Adhésion = inscription + statut de membre
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Modèle :
--   • Remplir le bulletin d'adhésion crée un compte (auth.users + profiles).
--   • Le membre est « pending » (en attente) jusqu'à validation par le bureau.
--   • Seuls les membres « active » peuvent poster / déposer une annonce.
--   • 1re année gratuite pour tout le monde (cotisation gratuit_0).
-- ============================================================

-- 1. STATUT DE MEMBRE sur les profils
-- -------------------------------------------------------
alter table profiles
  add column if not exists membership_status text not null default 'pending'
    check (membership_status in ('pending', 'active', 'rejected'));

-- Un membre NE PEUT PAS fixer ni modifier lui-même son statut (anti-escalade).
-- Seul le service_role (API d'adhésion + page /admin) peut l'écrire ;
-- côté client, les insert/update omettent la colonne → valeur 'pending' par défaut.
revoke update (membership_status) on profiles from anon, authenticated;
revoke insert (membership_status) on profiles from anon, authenticated;

-- 2. LIEN adhesion_requests ↔ compte
-- -------------------------------------------------------
alter table adhesion_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists adhesion_requests_user_idx on adhesion_requests(user_id);

-- 3. VERROUILLAGE des actions : réservé aux membres actifs
-- -------------------------------------------------------
-- Forum : poster une réponse
drop policy if exists "Création de post sans auth (v1)" on posts;
create policy "Membres actifs créent des posts"
  on posts for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and membership_status = 'active'
    )
  );

-- Forum : créer un sujet
drop policy if exists "Création de thread sans auth (v1)" on threads;
create policy "Membres actifs créent des threads"
  on threads for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and membership_status = 'active'
    )
  );

-- Équipement : déposer une annonce
drop policy if exists "N'importe qui peut créer une annonce (v1 sans auth)" on listings;
drop policy if exists "Utilisateurs authentifiés créent des annonces" on listings;
create policy "Membres actifs créent des annonces"
  on listings for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and membership_status = 'active'
    )
  );
