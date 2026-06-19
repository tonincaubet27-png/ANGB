-- ============================================================
-- 011 — Messagerie interne (messages directs entre membres)
-- À exécuter dans le SQL Editor de Supabase.
-- Sécurité : RLS stricte — chacun ne voit que ses propres conversations.
-- ============================================================

create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 4000),
  created_at   timestamptz not null default now(),
  read_at      timestamptz,
  constraint no_self_message check (sender_id <> recipient_id)
);

create index if not exists messages_pair_idx      on messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx on messages (recipient_id, created_at desc);

alter table messages enable row level security;

-- Lecture : uniquement les messages où je suis expéditeur ou destinataire
drop policy if exists "Lecture de mes messages" on messages;
create policy "Lecture de mes messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Envoi : je suis l'expéditeur, je suis membre actif, et le destinataire est membre actif
drop policy if exists "Envoi de messages (membres actifs)" on messages;
create policy "Envoi de messages (membres actifs)" on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (select 1 from profiles where id = auth.uid()     and membership_status = 'active')
    and exists (select 1 from profiles where id = recipient_id   and membership_status = 'active')
  );

-- Marquer comme lu : seul le destinataire peut mettre à jour read_at
drop policy if exists "Marquer mes messages comme lus" on messages;
create policy "Marquer mes messages comme lus" on messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Suppression : l'expéditeur peut supprimer son propre message
drop policy if exists "Supprimer mon message" on messages;
create policy "Supprimer mon message" on messages for delete
  using (auth.uid() = sender_id);

-- Temps réel (Supabase Realtime) — diffusion des nouveaux messages
do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when duplicate_object then null; -- déjà ajoutée
  end;
end $$;
