-- ============================================================
-- ANGB — Politiques de stockage pour le bucket "goalie-avatars"
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================
-- Le bucket est public (lecture libre). On autorise en plus
-- les utilisateurs connectés à y déposer des fichiers
-- (avatars, galerie profil, photos d'équipement).
-- ============================================================

drop policy if exists "ANGB lecture publique avatars" on storage.objects;
create policy "ANGB lecture publique avatars"
  on storage.objects for select
  using (bucket_id = 'goalie-avatars');

drop policy if exists "ANGB upload avatars authentifie" on storage.objects;
create policy "ANGB upload avatars authentifie"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'goalie-avatars');

drop policy if exists "ANGB suppression avatars proprietaire" on storage.objects;
create policy "ANGB suppression avatars proprietaire"
  on storage.objects for delete to authenticated
  using (bucket_id = 'goalie-avatars' and owner = auth.uid());
