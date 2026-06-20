-- ============================================================
-- 012 — Photo de couverture du profil (style LinkedIn/Twitter)
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

alter table goalie_profiles add column if not exists cover_url text;
