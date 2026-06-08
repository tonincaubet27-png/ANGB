# ANGB Site — Next.js 14

Site web de l'Association Nationale des Gardiens de But (ANGB).

## Stack
- Next.js 14 App Router · TypeScript · Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage)
- Déploiement : Vercel (région `cdg1` Paris)

## Lancement
```bash
npm run dev      # port 3002 via /tmp/angb-site-dev.sh
npm run build    # vérification TypeScript + build prod
```

## Variables d'environnement
Copier `.env.local` et remplir :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
Sans ces variables, toutes les pages utilisent les **mock data** embarquées dans `lib/data.ts`.

## Architecture
```
app/
  layout.tsx              # fonts Bebas Neue + DM Sans, dark mode
  ClientLayout.tsx        # Navbar + Footer + AdhesionModal (client)
  page.tsx                # Home — Hero, stats, features
  association/page.tsx    # 7 onglets (client component)
  equipement/page.tsx     # Bourse d'occasion (Supabase → mock)
  forum/page.tsx          # Liste threads (Supabase → mock)
  forum/[threadId]/page.tsx
  annuaire/page.tsx       # Annuaire gardiens (Supabase → mock)
  sitemap.ts              # Sitemap automatique
components/
  Navbar.tsx              # sticky blur, barre tricolore verticale
  Footer.tsx              # barre tricolore bas
  AdhesionModal.tsx       # bulletin 4 étapes, checkboxes obligatoires
  about/                  # 7 sections onglets Association
lib/
  types.ts                # interfaces TypeScript
  supabase.ts             # browser client
  supabase-server.ts      # server client (SSR)
  data.ts                 # data layer — Supabase first, mock fallback
supabase/
  migrations/001_initial_schema.sql  # à exécuter dans Supabase SQL editor
```

## Palette / Design
Dark mode exclusif. Fonts : Bebas Neue (titres) + DM Sans (corps).
CSS variables dans `app/globals.css` : `--navy`, `--accent` (#4a7fff), `--red-fr` (#ED2939).
Barre tricolore (bleu-blanc-rouge) en haut ET bas du site.

## Supabase — mise en production
1. Créer un projet sur supabase.com
2. Exécuter `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL
3. Remplir `.env.local` avec l'URL et la clé anon
4. Ajouter les mêmes variables dans Vercel (Settings → Environment Variables)

## Contraintes importantes
- **Annuaire** : pas de stats numériques (SV%, GAA, matchs) — données non officiellement vérifiables
- **Adhésion** : modal standalone, checkboxes statuts + RGPD obligatoires pour soumettre
- **Agent sportif** : l'ANGB n'est pas un agent sportif, ne peut pas négocier de contrats
