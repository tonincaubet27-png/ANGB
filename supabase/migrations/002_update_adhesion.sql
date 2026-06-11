-- Migration 002 — Mise à jour table adhesion_requests
-- À exécuter dans Supabase SQL Editor

-- 1. Supprime la contrainte CHECK sur statut
--    (on stocke maintenant plusieurs valeurs séparées par des virgules, ex: "gardien_actif, entraineur_gardien")
ALTER TABLE adhesion_requests
  DROP CONSTRAINT IF EXISTS adhesion_requests_statut_check;

-- 2. Ajoute la colonne categorie_enfant (optionnel — parents)
ALTER TABLE adhesion_requests
  ADD COLUMN IF NOT EXISTS categorie_enfant text;

-- 3. Index pour trier par statut de traitement
CREATE INDEX IF NOT EXISTS idx_adhesion_status
  ON adhesion_requests (status, created_at DESC);

-- 4. Politique lecture admin (service_role passe au-dessus de RLS — pas besoin)
--    Mais on documente que la lecture passe par service_role uniquement :
COMMENT ON TABLE adhesion_requests IS
  'Demandes d''adhésion ANGB. Lecture/mise à jour via service_role uniquement (page admin).';
