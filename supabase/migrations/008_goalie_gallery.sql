-- ============================================================
-- ANGB — Galerie photos sur les profils (style réseau social)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Liste d'URLs de photos (hockey, action…) que le membre ajoute
-- depuis son profil. Les fichiers vont dans le bucket Storage
-- "goalie-avatars" (déjà utilisé pour les avatars).
-- ============================================================

alter table goalie_profiles
  add column if not exists gallery text[] default '{}';
