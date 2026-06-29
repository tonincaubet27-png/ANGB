-- ============================================================
-- 014 — Contenu éditable du site (mini-CMS)
-- À exécuter dans le SQL Editor de Supabase.
-- Clé/valeur ; lecture publique ; écriture réservée au service_role
-- (l'éditeur /admin/contenu l'utilise via server actions).
-- ============================================================

create table if not exists site_content (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

drop policy if exists "Lecture publique du contenu" on site_content;
create policy "Lecture publique du contenu" on site_content for select using (true);
