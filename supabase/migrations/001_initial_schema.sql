-- ============================================================
-- ANGB — Schéma initial Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- -------------------------------------------------------
-- 1. LISTINGS — Bourse d'équipement
-- -------------------------------------------------------
create table if not exists listings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null check (category in ('jambières','plastron','masque','gants','crosse','complet','autre')),
  condition   text not null check (condition in ('très bon état','bon état','usage')),
  price       integer not null,     -- en centimes
  description text,
  city        text,
  seller_name text,
  seller_division text,
  created_at  timestamptz default now(),
  is_active   boolean default true
);

-- Index pour le filtrage fréquent
create index if not exists listings_category_idx  on listings (category);
create index if not exists listings_condition_idx on listings (condition);
create index if not exists listings_active_idx    on listings (is_active);

-- RLS
alter table listings enable row level security;

create policy "Tout le monde peut lire les annonces actives"
  on listings for select
  using (is_active = true);

create policy "N'importe qui peut créer une annonce (v1 sans auth)"
  on listings for insert
  with check (true);


-- -------------------------------------------------------
-- 2. THREADS — Forum
-- -------------------------------------------------------
create table if not exists threads (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text not null,
  tag           text default 'Débat' check (tag in ('Officiel','Débat','Santé','Équipement','Tournoi','Retour')),
  author_name   text,
  author_initials varchar(2),
  is_pinned     boolean default false,
  reply_count   integer default 0,
  last_activity timestamptz default now(),
  created_at    timestamptz default now()
);

create index if not exists threads_category_idx on threads (category);
create index if not exists threads_pinned_idx   on threads (is_pinned desc, last_activity desc);

alter table threads enable row level security;

create policy "Lecture publique des threads"
  on threads for select using (true);

create policy "Création de thread sans auth (v1)"
  on threads for insert with check (true);

create policy "Mise à jour reply_count"
  on threads for update using (true);


-- -------------------------------------------------------
-- 3. POSTS — Réponses forum
-- -------------------------------------------------------
create table if not exists posts (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid references threads(id) on delete cascade,
  content         text not null,
  author_name     text,
  author_initials varchar(2),
  created_at      timestamptz default now()
);

create index if not exists posts_thread_idx on posts (thread_id, created_at);

alter table posts enable row level security;

create policy "Lecture publique des posts"
  on posts for select using (true);

create policy "Création de post sans auth (v1)"
  on posts for insert with check (true);

-- Trigger : incrémente reply_count sur le thread parent
create or replace function increment_reply_count()
returns trigger language plpgsql as $$
begin
  update threads
  set
    reply_count   = reply_count + 1,
    last_activity = now()
  where id = new.thread_id;
  return new;
end;
$$;

create trigger on_post_insert
  after insert on posts
  for each row execute function increment_reply_count();


-- -------------------------------------------------------
-- 4. GOALIES — Annuaire
-- -------------------------------------------------------
create table if not exists goalies (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  club      text,
  division  text check (division in ('Magnus','D1','D2','D3','Féminine Élite','Régionale')),
  region    text,
  bio_note  text,   -- texte libre, PAS de stats numériques
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists goalies_division_idx on goalies (division);
create index if not exists goalies_active_idx   on goalies (is_active);

alter table goalies enable row level security;

create policy "Lecture publique des gardiens actifs"
  on goalies for select using (is_active = true);

-- Goalies en lecture seule côté public (inserts via back-office uniquement)


-- -------------------------------------------------------
-- 5. ADHESION_REQUESTS — Bulletin d'adhésion
-- -------------------------------------------------------
create table if not exists adhesion_requests (
  id               uuid primary key default gen_random_uuid(),
  nom              text not null,
  prenom           text not null,
  date_naissance   date,
  telephone        text,
  email            text not null,
  adresse          text,
  club             text,
  statut           text check (statut in ('gardien_actif','ancien_gardien','entraineur_gardien','membre_soutien')),
  division         text,
  cotisation       text check (cotisation in ('actif_20','soutien_10','gratuit_0')),
  accept_statuts   boolean not null default false,
  accept_rgpd      boolean not null default false,
  autorisation_image boolean default false,
  status           text default 'pending' check (status in ('pending','validated','rejected')),
  created_at       timestamptz default now()
);

alter table adhesion_requests enable row level security;

create policy "Insertion publique des demandes d'adhésion"
  on adhesion_requests for insert
  with check (accept_statuts = true and accept_rgpd = true);

-- Lecture réservée aux admins (service_role uniquement)


-- -------------------------------------------------------
-- 6. SEED — Données de démonstration
-- -------------------------------------------------------

-- Listings
insert into listings (title, category, condition, price, description, city, seller_name, seller_division) values
  ('Warrior Ritual G7 — Jambières',  'jambières', 'très bon état', 28000, 'Jambières Pro taille 33+1. Peu portées (20 matchs). Colorway custom.', 'Rouen',    'Julien M.',   'Magnus'),
  ('Bauer NME VTX — Masque',         'masque',    'très bon état', 32000, 'Masque Pro. Cage cat-eye remplacée. Peinture personnalisée.',           'Paris',    'Alexandre B.','D1'),
  ('Vaughn V9 Pro — Gants',          'gants',     'bon état',      19000, 'Gant attrape-main + bloqueur. Taille standard.',                        'Bordeaux', 'Marc D.',     'D2'),
  ('CCM Axis Pro — Plastron',        'plastron',  'très bon état', 21000, 'Plastron XL. Protège-gorge intégré.',                                  'Grenoble', 'Hugo C.',     'D2'),
  ('Bauer Vapor 3X — Jambières',     'jambières', 'usage',         35000, 'Jambières Senior 34+1. Bon état général.',                             'Lyon',     'Thomas R.',   'D1'),
  ('CCM Premier III — Crosse',       'crosse',    'très bon état',  5500, 'Crosse senior P31. Lame presque neuve.',                               'Caen',     'Mathis L.',   'D1')
on conflict do nothing;

-- Goalies
insert into goalies (name, club, division, region, bio_note) values
  ('Tonin Caubet',    'Montpellier',      'Magnus',         'Occitanie',          'Gardien professionnel · Ex-Rouen Dragons · 2× Champion Ligue Magnus · International jeunes'),
  ('Julien Martin',   'Rouen Dragons',    'Magnus',         'Normandie',          'Gardien professionnel · Expérience internationale clubs'),
  ('Alexandre Bonnard','Bordeaux Boxers', 'D1',             'Nouvelle-Aquitaine', 'Titulaire · Formation Bordeaux · En progression vers le pro'),
  ('Mathis Laurent',  'Caen',             'D1',             'Normandie',          'Numéro 2 · Disponible pour prêt'),
  ('Sophie Renard',   'Paris Valkyries',  'Féminine Élite', 'Île-de-France',      'Internationale · Capitaine EDF féminine jeunes'),
  ('Hugo Chauveau',   'Grenoble B',       'D2',             'Rhône-Alpes',        'Jeune gardien · 19 ans · Formation CREPS Rhône-Alpes')
on conflict do nothing;

-- Thread épinglé + posts
insert into threads (id, title, category, tag, author_name, author_initials, is_pinned, reply_count, last_activity) values
  ('00000000-0000-0000-0000-000000000001', 'Bienvenue sur le forum officiel de l''ANGB', 'ANGB & institutionnel', 'Officiel', 'Bureau ANGB', 'BA', true,  12, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Ratio entraîneur gardien / gardiens en D1 — la réalité du terrain', 'Technique & coaching', 'Débat', 'Julien M.', 'JM', false, 24, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000003', 'Stage gardiens Grenoble — juillet 2026 — inscriptions ouvertes', 'Stages & tournois', 'Tournoi', 'Hugo C.', 'HC', false, 8,  now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000004', 'Protocole commotion ANGB — questions et retours d''expérience', 'Santé & blessures', 'Santé',   'Bureau ANGB', 'BA', false, 31, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000005', 'Warrior Ritual vs Bauer Vapor — comparatif jambières', 'Équipement', 'Équipement', 'Thomas R.', 'TR', false, 19, now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000006', 'Programme prépa physique été 2026 — sans glace', 'Prépa physique', 'Retour', 'Sophie R.', 'SR', false, 43, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000007', 'Cherche gardien pour Reims — D2 — saison 2026/2027', 'Vie des clubs', 'Officiel', 'Club Reims', 'CR', false, 5, now() - interval '9 days')
on conflict do nothing;

insert into posts (thread_id, content, author_name, author_initials) values
  ('00000000-0000-0000-0000-000000000001', 'Bienvenue à tous sur le forum de l''ANGB ! Cet espace est dédié aux échanges entre gardiens, entraîneurs et structures. Bonne discussion !', 'Bureau ANGB', 'BA'),
  ('00000000-0000-0000-0000-000000000001', 'Super initiative ! Est-ce qu''on peut créer des sous-groupes par région ?', 'Julien M.', 'JM'),
  ('00000000-0000-0000-0000-000000000004', 'Protocole officiel ANGB : tout choc à la tête = sortie immédiate. Retour progressif en 5 étapes sur 7 jours minimum.', 'Bureau ANGB', 'BA'),
  ('00000000-0000-0000-0000-000000000004', 'J''ai eu une commotion l''an dernier, mon club voulait que je revienne au bout de 3 jours. Ce protocole va dans le bon sens.', 'Hugo C.', 'HC')
on conflict do nothing;
