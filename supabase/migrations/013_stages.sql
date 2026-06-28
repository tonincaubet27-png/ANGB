-- ============================================================
-- 013 — Stages (gérés depuis /admin/stages)
-- À exécuter dans le SQL Editor de Supabase.
-- Lecture publique des stages actifs ; écriture réservée au service_role
-- (les server actions admin l'utilisent et contournent la RLS).
-- ============================================================

create table if not exists stages (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  organisateur text,
  periode      text,
  date_debut   date,
  lieu         text,
  audience     text,
  niveau       text,
  tarif        text,
  places       text,
  description  text,
  image        text,
  lien         text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table stages enable row level security;

drop policy if exists "Lecture publique des stages actifs" on stages;
create policy "Lecture publique des stages actifs" on stages for select using (is_active = true);

-- Seed : les 3 stages de l'Académie du Hockey (modifiables/supprimables depuis l'admin)
insert into stages (titre, organisateur, periode, date_debut, lieu, audience, niveau, tarif, places, description, image, lien)
select * from (values
  ('Stage Jeunes · Pralognan', 'Académie du Hockey', 'Été · juillet 2026', date '2026-07-06', 'Pralognan-la-Vanoise',
   'U9 à U15 · filles & garçons', 'Programme spécifique gardiens', 'Voir le site', '2 sessions : 6-11 & 13-18 juillet (ou 2 semaines)',
   'Stage estival de développement et de perfectionnement, en altitude, avec un programme dédié aux gardiens de but. Groupes par âge et par niveau.',
   '/images/florian-hardy.jpg', 'https://academieduhockey.com'),
  ('Skills Days · Meudon', 'Académie du Hockey', 'Skills Days · juin 2026', date '2026-06-09', 'Patinoire de Meudon',
   'U11 à U18 + loisirs adultes', 'Joueurs & gardiens', 'Voir le site', 'Groupes gardiens U11/U13/U15/U18',
   'Journées « skills » de travail technique intensif, avec des groupes gardiens dédiés à chaque catégorie d''âge et un groupe loisirs adultes.',
   '/images/hardy.jpg', 'https://academieduhockey.com'),
  ('Loisirs Adultes · Vaujany', 'Académie du Hockey', 'Loisirs adultes · mai 2026', date '2026-05-22', 'Vaujany',
   'Adultes loisirs', 'Programme gardiens inclus', 'Voir le site', '22-25 mai 2026',
   'Stage loisirs pour adultes, glace et perfectionnement dans un cadre montagnard, avec un programme spécifique pour les gardiens.',
   '/images/fabrice-lhenry.jpg', 'https://academieduhockey.com')
) as v
where not exists (select 1 from stages);
