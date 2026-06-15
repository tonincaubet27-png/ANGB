-- ============================================================
-- ANGB — Numéro d'adhérent séquentiel (1, 2, 3…)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Le numéro est attribué au moment de la VALIDATION par le bureau
-- (le 1er validé = n°1, etc.), pas à l'adhésion. Stocké une fois,
-- il ne change plus. Voir app/admin/page.tsx (changeStatus).
-- ============================================================

alter table adhesion_requests
  add column if not exists member_no integer unique;
