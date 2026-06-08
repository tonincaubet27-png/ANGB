-- ============================================================
-- ANGB — Contact requests (demandes d'achat équipement)
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

create table if not exists contact_requests (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references listings(id) on delete cascade,
  listing_title text not null,
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  message       text,
  status        text default 'pending' check (status in ('pending','responded','closed')),
  created_at    timestamptz default now()
);

create index if not exists contact_requests_listing_idx on contact_requests (listing_id);
create index if not exists contact_requests_status_idx  on contact_requests (status);

alter table contact_requests enable row level security;

-- Tout le monde peut envoyer une demande de contact
create policy "Insertion publique des demandes de contact"
  on contact_requests for insert
  with check (true);

-- Lecture réservée aux admins (service_role uniquement)
