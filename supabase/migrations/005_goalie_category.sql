-- ============================================================
-- ANGB — Catégorie de membre sur les fiches annuaire
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Permet de classer chaque fiche de l'annuaire par catégorie
-- (gardien, entraîneur gardien, entraîneur, joueur, membre soutien).
-- La fiche est créée à l'adhésion (is_active = false) puis rendue
-- visible quand le bureau valide la demande dans /admin.
-- ============================================================

alter table goalie_profiles
  add column if not exists category text not null default 'gardien'
    check (category in ('gardien', 'entraineur_gardien', 'entraineur', 'joueur', 'membre_soutien'));

create index if not exists goalie_profiles_category_idx on goalie_profiles(category);
