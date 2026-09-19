-- ============================================================================
-- SMART BOOKING — MIGRATION "PAIEMENT DIRECT + COMMISSION 4 %"
-- (script autonome pour une base Supabase EXISTANTE)
--
-- Que fait ce script, dans cet ordre :
--   1. Ajoute à `bookings` les colonnes de routage / répartition
--      (provider_payout_*, commission_rate, platform_fee, provider_net).
--   2. Crée la table interne `platform_accounts` (comptes de collecte des
--      commissions), active sa RLS et y insère les 2 comptes de la plateforme.
--   3. Reprend les réservations déjà enregistrées :
--        a) compte de réception recopié depuis le profil du prestataire
--           (providers.payout_method / providers.payout_number) ;
--        b) commission 4 % / part nette 96 % calculée sur l'acompte encaissé,
--           avec la même règle d'arrondi que src/lib/commission.ts.
--   4. Termine par un SELECT de contrôle — le panneau "Results" doit
--      afficher :  STATUT = OK / colonnes = 5 / comptes actifs = 2 /
--      réservations restant à reprendre = 0.
--
-- Sécurité :
--   · une seule transaction ATOMIQUE — en cas d'erreur, TOUT est annulé,
--     votre base reste exactement comme avant ;
--   · entièrement idempotent — vous pouvez le rejouer autant de fois que vous
--     voulez : rien n'est dupliqué, rien de déjà rempli n'est écrasé.
--
-- Mode d'emploi : Supabase Studio → SQL Editor → New query → coller CE
-- FICHIER EN ENTIER → Run → lire la dernière ligne des résultats.
-- ============================================================================

begin;

-- --------------------------------------------------------------------------
-- 0. Pré-requis : les tables de base doivent déjà exister. Sinon, arrêt net
--    (la transaction est annulée) avec un message explicite — il faut alors
--    d'abord exécuter le schéma complet `supabase-schema.sql`.
-- --------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.bookings') is null
     or to_regclass('public.providers') is null then
    raise exception
      'Tables public.bookings / public.providers introuvables. Exécutez d''abord supabase-schema.sql (schéma complet), puis relancez ce script.';
  end if;

  -- Compatibilité : si la colonne providers.payout_number n'existe pas encore
  -- (très ancienne base), on la crée pour permettre le routage des paiements.
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'providers'
                   and column_name = 'payout_number') then
    alter table public.providers add column payout_number text;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'providers'
                   and column_name = 'payout_method') then
    alter table public.providers add column payout_method text;
  end if;
end $$;

-- --------------------------------------------------------------------------
-- 1. Colonnes de routage / répartition sur les réservations
-- --------------------------------------------------------------------------
alter table public.bookings add column if not exists provider_payout_method text;
alter table public.bookings add column if not exists provider_payout_number text;
alter table public.bookings add column if not exists commission_rate numeric(6,4) not null default 0.04;
alter table public.bookings add column if not exists platform_fee  numeric(12,2) not null default 0;  -- 4 % du paiement
alter table public.bookings add column if not exists provider_net  numeric(12,2) not null default 0;  -- 96 % du paiement

-- --------------------------------------------------------------------------
-- 2. Table interne des comptes de collecte de la plateforme
--    (usage admin/finance uniquement — RLS : lecture réservée au rôle service)
-- --------------------------------------------------------------------------
create table if not exists public.platform_accounts (
  id          text primary key default gen_random_uuid()::text,
  label       text not null,              -- ex. 'Airtel Money', 'SMICO'
  channel     text not null,              -- 'Mobile Money' | 'Banque'
  account_ref text not null unique,       -- numéro / n° de compte de collecte
  currency    text not null default 'USD',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.platform_accounts enable row level security;

drop policy if exists "service_role_only_platform_accounts" on public.platform_accounts;
create policy "service_role_only_platform_accounts" on public.platform_accounts
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Initialisation : uniquement si la table est vide (les éventuelles
-- modifications faites depuis l'interface admin sont toujours préservées).
insert into public.platform_accounts (label, channel, account_ref)
select v.label, v.channel, v.account_ref
from (values
  ('Airtel Money', 'Mobile Money', '+243976459970'),
  ('SMICO',        'Banque',       'GM018008')
) as v (label, channel, account_ref)
where not exists (select 1 from public.platform_accounts);

-- --------------------------------------------------------------------------
-- 3. Reprise des réservations enregistrées AVANT cette version
--    (seules les lignes encore vides sont touchées)
-- --------------------------------------------------------------------------
--   a) compte de réception : recopié depuis le profil du prestataire
update public.bookings b
   set provider_payout_method = p.payout_method::text,
       provider_payout_number = p.payout_number
  from public.providers p
 where p.id = b.provider_id
   and b.provider_payout_number is null
   and p.payout_number is not null;

--   b) répartition sur l'acompte déjà encaissé :
--      commission = round(acompte × taux) au dollar près,
--      net = acompte − commission (même règle que src/lib/commission.ts)
update public.bookings
   set platform_fee = round(deposit * commission_rate),
       provider_net = deposit - round(deposit * commission_rate)
 where deposit > 0
   and platform_fee = 0
   and provider_net = 0;

-- --------------------------------------------------------------------------
-- 4. Contrôle final automatique (affiché dans le panneau Results)
--
--    STATUT attendu : ✅ OK
--      · colonnes bookings ......... 5
--      · comptes de collecte actifs  2
--      · réservations à reprendre .. 0
--      · politique RLS ............. présente
-- --------------------------------------------------------------------------
select case
         when c.nb_colonnes = 5 and c.nb_comptes = 2
              and c.a_reprendre = 0 and c.policy_ok = 1
           then '✅ OK — migration terminée'
         else '❌ À VÉRIFIER — voir les colonnes ci-dessous'
       end as statut,
       c.nb_colonnes  as colonnes_bookings,        -- attendu : 5
       c.nb_comptes   as comptes_actifs,           -- attendu : 2
       c.a_reprendre  as reservations_a_reprendre, -- attendu : 0
       c.policy_ok    as politique_rls_presente    -- attendu : 1
from (
  select
    (select count(*) from information_schema.columns
      where table_schema = 'public' and table_name = 'bookings'
        and column_name in ('provider_payout_method', 'provider_payout_number',
                            'commission_rate', 'platform_fee', 'provider_net')) as nb_colonnes,
    (select count(*) from public.platform_accounts where is_active)            as nb_comptes,
    (select count(*) from public.bookings
      where deposit > 0 and platform_fee = 0 and provider_net = 0)             as a_reprendre,
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'platform_accounts'
        and policyname = 'service_role_only_platform_accounts')                as policy_ok
) c;

commit;
