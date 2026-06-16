-- ============================================================
-- ANGB — Expérience professionnelle sur les fiches annuaire (style LinkedIn)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Ajoute la liste des expériences pro (poste, entreprise, période)
-- éditable par le membre depuis sa fiche d'annuaire.
-- ============================================================

alter table goalie_profiles
  add column if not exists experiences jsonb default '[]'::jsonb;
