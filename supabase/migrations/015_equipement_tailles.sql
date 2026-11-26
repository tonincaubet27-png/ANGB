-- 015 · Bourse d'équipement : nouvelles catégories + taille
-- À lancer une fois dans Supabase (projet ANGB 1) › SQL Editor. Sans danger si relancé.

alter table listings drop constraint if exists listings_category_check;
alter table listings add constraint listings_category_check check (category in (
  'masque','plastron','gants','jambières','culotte','coquille','genouillères','protège-cou','patins','crosse','complet','autre'
));

-- Gabarit (Enfant, Junior, Intermédiaire, Senior) + taille précise libre (ex. 33+1, pointure 8, L)
alter table listings add column if not exists size_range  text;
alter table listings add column if not exists size_detail text;
