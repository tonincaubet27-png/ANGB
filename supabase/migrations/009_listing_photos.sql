-- ============================================================
-- ANGB — Photos sur les annonces d'équipement (style Vinted)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Liste d'URLs de photos de l'équipement (1re = couverture).
-- Fichiers stockés dans le bucket Storage "goalie-avatars".
-- ============================================================

alter table listings
  add column if not exists photos text[] default '{}';
