-- ============================================================================
--  SMART BOOKING RDC 🇨🇩 — Schéma de base de données (PostgreSQL / Supabase)
--  Plateforme de réservation des services de cérémonie en RD Congo
--  (mariage, dot, réunion, conférence, anniversaire, baptême, graduation...)
--
--  À exécuter dans : Supabase Studio → SQL Editor → New query → Run
--  Le script est idempotent : il peut être rejoué sans tout réinstaller.
--
--  Contact admin : +243 976 459 970
-- ============================================================================

-- Extensions ----------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "unaccent";   -- recherche sans accents (optionnel)

-- ============================================================================
-- 1. TYPES ÉNUMÉRÉS
-- ============================================================================

do $$ begin
  create type provider_status as enum ('pending', 'approved', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- Opérateurs Mobile Money de la RDC
do $$ begin
  create type payment_method as enum ('M-Pesa', 'Orange Money', 'Airtel Money');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payout_status as enum ('pending', 'processing', 'processed', 'paid', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type chat_role as enum ('client', 'provider', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum (
    'provider_register',
    'service_submit',
    'service_approve',
    'service_reject',
    'booking_created',
    'payout_request'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- 2.1 Comptes prestataires (inscription obligatoire avant connexion) --------
create table if not exists public.providers (
  id             text primary key default gen_random_uuid()::text,
  name           text        not null unique,            -- raison sociale / nom commercial
  contact_person text        not null,
  phone          text        not null,                   -- +243 ...
  whatsapp       text,
  email          text,
  city           text        not null,                   -- Goma, Kinshasa, Bukavu...
  location       text,                                   -- commune / quartier
  category       text        not null,                   -- id de catégorie
  experience     text,
  bio            text,
  rccm           text,                                   -- registre du commerce RDC
  id_nat         text,                                   -- identification nationale
  status         provider_status      not null default 'pending',
  rating         numeric(3,2)         not null default 5.00 check (rating between 0 and 5),
  reviews_count  integer              not null default 0,
  verified       boolean              not null default false,
  avatar         text,
  admin_notes    text,
  payout_method  payment_method,                         -- canal de retrait préféré
  payout_number  text,                                   -- numéro Mobile Money de retrait
  registered_at  timestamptz          not null default now(),
  created_at     timestamptz          not null default now(),
  updated_at     timestamptz          not null default now()
);

create index if not exists providers_status_idx  on public.providers (status);
create index if not exists providers_city_idx    on public.providers (city);
create index if not exists providers_category_idx on public.providers (category);

-- 2.2 Prestations / services publiés (soumis à approbation admin) -----------
create table if not exists public.services (
  id                    text primary key default gen_random_uuid()::text,
  provider_id           text     references public.providers (id) on delete cascade,
  provider_name         text        not null,             -- dénormalisé pour l'affichage
  name                  text        not null,
  category              text        not null,
  description           text        not null default '',
  long_description      text        not null default '',
  price                 numeric(12,2) not null default 0 check (price >= 0),   -- USD
  price_unit            text        not null default 'la prestation',          -- 'par invité', 'par jour'...
  duration              integer     not null default 240,                      -- minutes
  rating                numeric(3,2) not null default 5.00 check (rating between 0 and 5),
  reviews               integer     not null default 0,
  image                 text,
  images                text[]      not null default '{}',
  city                  text        not null,
  location              text,
  features              text[]      not null default '{}',
  event_types           text[]      not null default '{}',                     -- mariage, dot, conférence...
  capacity              integer,
  popular               boolean     not null default false,
  instant               boolean     not null default false,                    -- réservation instantanée
  paused                boolean     not null default false,                    -- masquée du catalogue client
  is_custom             boolean     not null default false,                    -- créée depuis l'espace prestataire
  admin_approval_status admin_approval_status not null default 'pending',
  admin_feedback        text,
  is_deleted            boolean     not null default false,                    -- suppression logique par l'admin
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists services_provider_idx    on public.services (provider_id);
create index if not exists services_category_idx    on public.services (category);
create index if not exists services_city_idx        on public.services (city);
create index if not exists services_approval_idx    on public.services (admin_approval_status);

-- Vitrine publique : prestations approuvées, ni supprimées ni en pause,
-- dont le prestataire n'est pas suspendu.
create or replace view public.services_public as
select s.*
from public.services s
left join public.providers p on p.id = s.provider_id
where s.admin_approval_status = 'approved'
  and s.is_deleted = false
  and s.paused = false
  and (p.id is null or p.status <> 'suspended');

-- 2.3 Cérémonies créées par les clients -------------------------------------
create table if not exists public.ceremony_events (
  id         text primary key default gen_random_uuid()::text,
  type       text        not null,                       -- id du type de cérémonie
  title      text        not null,
  date       date        not null,
  time       time        not null default '10:00',
  city       text        not null,
  venue      text,
  guests     integer     not null default 100 check (guests > 0),
  budget     numeric(12,2) not null default 0,           -- USD, 0 = non défini
  notes      text,
  customer_name  text,
  customer_phone text,
  created_at timestamptz not null default now()
);

create index if not exists ceremony_events_date_idx on public.ceremony_events (date);

-- 2.4 Réservations ------------------------------------------------------------
create table if not exists public.bookings (
  id              text primary key default gen_random_uuid()::text,
  event_id        text     references public.ceremony_events (id) on delete set null,
  service_id      text     references public.services (id) on delete set null,
  provider_id     text     references public.providers (id) on delete set null,
  service_name    text        not null,
  service_image   text,
  service_category text,
  provider_name   text        not null,
  date            date        not null,
  time            time        not null default '10:00',
  duration        integer     not null default 240,
  price           numeric(12,2) not null default 0,       -- total USD
  deposit         numeric(12,2) not null default 0,       -- acompte payé USD (50%)
  payment_method  payment_method not null default 'M-Pesa',
  status          booking_status not null default 'pending',
  customer_name   text        not null,
  customer_phone  text        not null,
  customer_email  text,
  location        text,
  city            text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists bookings_service_idx  on public.bookings (service_id);
create index if not exists bookings_provider_idx on public.bookings (provider_id);
create index if not exists bookings_status_idx   on public.bookings (status);
create index if not exists bookings_date_idx     on public.bookings (date);

-- 2.5 Panier multi-prestations (devis global) --------------------------------
create table if not exists public.cart_items (
  id         text primary key default gen_random_uuid()::text,
  session_id text        not null,                        -- identifiant du panier client
  service_id text     references public.services (id) on delete cascade,
  date       date        not null,
  time       time        not null default '10:00',
  notes      text,
  created_at timestamptz not null default now()
);

create index if not exists cart_items_session_idx on public.cart_items (session_id);

-- 2.6 Devis pro-forma & factures d'acompte -----------------------------------
create table if not exists public.quotes (
  id             text primary key default gen_random_uuid()::text,
  quote_number   text        not null unique,             -- ex. DEV-2026-0001
  kind           text        not null default 'devis' check (kind in ('devis', 'facture')),
  session_id     text,
  customer_name  text        not null,
  customer_phone text        not null,
  customer_email text,
  ceremony_type  text,
  ceremony_date  date,
  city           text,
  items          jsonb       not null default '[]',       -- lignes du devis (prestations)
  subtotal       numeric(12,2) not null default 0,        -- USD
  discount       numeric(12,2) not null default 0,        -- USD
  total          numeric(12,2) not null default 0,        -- USD
  deposit        numeric(12,2) not null default 0,        -- acompte 50%
  balance        numeric(12,2) not null default 0,        -- solde à régler
  payment_method payment_method not null default 'M-Pesa',
  notes          text,
  date           date        not null default current_date,
  valid_until    date,
  created_at     timestamptz not null default now()
);

create index if not exists quotes_customer_idx on public.quotes (customer_phone);

-- 2.7 Messagerie (client ↔ prestataire ↔ admin) ------------------------------
create table if not exists public.messages (
  id         text primary key default gen_random_uuid()::text,
  thread_id  text        not null,                        -- ex. 'cp-<prestataire>-<téléphone>'
  from_role  chat_role   not null,
  from_name  text        not null,
  to_role    chat_role   not null,
  to_name    text        not null,
  content    text        not null,
  booking_id text     references public.bookings (id) on delete set null,
  service_id text     references public.services (id) on delete set null,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_idx on public.messages (thread_id, created_at desc);
create index if not exists messages_unread_idx on public.messages (read) where read = false;

-- 2.8 Demandes de retrait Mobile Money ---------------------------------------
create table if not exists public.payout_requests (
  id             text primary key default gen_random_uuid()::text,
  provider_id    text     references public.providers (id) on delete cascade,
  provider_name  text        not null,
  amount_usd     numeric(12,2) not null check (amount_usd > 0),
  amount_fc      numeric(14,2) not null default 0,        -- équivalent francs congolais
  method         payment_method not null,
  phone_number   text        not null,
  status         payout_status not null default 'pending',
  transaction_ref text,                                   -- référence opérateur (MPESA-..., OM-...)
  notes          text,
  admin_notes    text,
  requested_at   timestamptz not null default now(),
  processed_at   timestamptz
);

create index if not exists payouts_status_idx   on public.payout_requests (status);
create index if not exists payouts_provider_idx on public.payout_requests (provider_id);

-- 2.9 Journal d'activité de la plateforme ------------------------------------
create table if not exists public.activity_log (
  id          text primary key default gen_random_uuid()::text,
  type        activity_type not null,
  title       text        not null,
  description text,
  actor_role  chat_role   not null default 'admin',
  timestamp   timestamptz not null default now()
);

create index if not exists activity_log_ts_idx on public.activity_log (timestamp desc);

-- 2.10 Avis clients ------------------------------------------------------------
create table if not exists public.reviews (
  id            text primary key default gen_random_uuid()::text,
  service_id    text     references public.services (id) on delete cascade,
  provider_id   text     references public.providers (id) on delete cascade,
  author_name   text        not null,
  author_city   text,
  rating        integer     not null check (rating between 1 and 5),
  comment       text,
  event_type    text,
  created_at    timestamptz not null default now()
);

create index if not exists reviews_service_idx on public.reviews (service_id);

-- 2.11 Répartition des paiements & comptes de collecte plateforme ############
-- ⚠️ INTERNE — ne jamais exposer dans l'interface publique de la plateforme.
--
-- Règle : le paiement du client part DIRECTEMENT sur le numéro / compte que
-- le prestataire a fourni à son inscription (providers.payout_method /
-- providers.payout_number, instantané copié sur chaque réservation).
-- Sur chaque paiement, la plateforme prélève une commission de service de 4 %
-- (bookings.platform_fee) ; le solde (bookings.provider_net, 96 %) revient
-- au prestataire.

-- Colonnes de répartition sur les réservations (idempotent)
alter table public.bookings add column if not exists provider_payout_method text;
alter table public.bookings add column if not exists provider_payout_number text;
alter table public.bookings add column if not exists commission_rate numeric(6,4) not null default 0.04;
alter table public.bookings add column if not exists platform_fee    numeric(12,2) not null default 0;  -- 4 % du paiement
alter table public.bookings add column if not exists provider_net    numeric(12,2) not null default 0;  -- 96 % du paiement

-- Comptes de collecte des commissions de la plateforme (usage admin/finance
-- uniquement — lecture réservée au rôle service, voir section RLS).
create table if not exists public.platform_accounts (
  id          text primary key default gen_random_uuid()::text,
  label       text not null,                        -- ex. 'Airtel Money', 'SMICO'
  channel     text not null,                        -- 'Mobile Money' | 'Banque'
  account_ref text not null unique,                 -- numéro / n° de compte de collecte
  currency    text not null default 'USD',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.platform_accounts (label, channel, account_ref)
select v.label, v.channel, v.account_ref
from (values
  ('Airtel Money', 'Mobile Money', '+243976459970'),
  ('SMICO',        'Banque',       'GM018008')
) as v (label, channel, account_ref)
where not exists (select 1 from public.platform_accounts);

-- ============================================================================
-- 3. TRIGGERS updated_at
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$ begin
  create trigger providers_touch_updated_at before update on public.providers
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger services_touch_updated_at before update on public.services
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger bookings_touch_updated_at before update on public.bookings
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 4. ROW LEVEL SECURITY
--    Vitrine publique en lecture ; écriture réservée au service role
--    (clés serveur / Edge Functions) et aux administrateurs authentifiés.
-- ============================================================================

alter table public.providers       enable row level security;
alter table public.services        enable row level security;
alter table public.ceremony_events enable row level security;
alter table public.bookings        enable row level security;
alter table public.cart_items      enable row level security;
alter table public.quotes          enable row level security;
alter table public.messages        enable row level security;
alter table public.payout_requests enable row level security;
alter table public.activity_log    enable row level security;
alter table public.reviews         enable row level security;
alter table public.platform_accounts enable row level security;

-- Lecture publique : catalogue approuvé + avis
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read" on public.services
  for select using (admin_approval_status = 'approved' and is_deleted = false and paused = false);

drop policy if exists "providers_public_read" on public.providers;
create policy "providers_public_read" on public.providers
  for select using (status = 'approved');

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews for select using (true);

-- Données transactionnelles : lecture pour un utilisateur authentifié
drop policy if exists "bookings_auth_read" on public.bookings;
create policy "bookings_auth_read" on public.bookings
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "quotes_auth_read" on public.quotes;
create policy "quotes_auth_read" on public.quotes
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "messages_auth_read" on public.messages;
create policy "messages_auth_read" on public.messages
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "payouts_auth_read" on public.payout_requests;
create policy "payouts_auth_read" on public.payout_requests
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

drop policy if exists "activity_auth_read" on public.activity_log;
create policy "activity_auth_read" on public.activity_log
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Écriture : rôle service uniquement (Next.js côté serveur / Edge Functions)
drop policy if exists "service_role_write_services" on public.services;
create policy "service_role_write_services" on public.services
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_providers" on public.providers;
create policy "service_role_write_providers" on public.providers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_bookings" on public.bookings;
create policy "service_role_write_bookings" on public.bookings
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_quotes" on public.quotes;
create policy "service_role_write_quotes" on public.quotes
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_messages" on public.messages;
create policy "service_role_write_messages" on public.messages
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_payouts" on public.payout_requests;
create policy "service_role_write_payouts" on public.payout_requests
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_cart" on public.cart_items;
create policy "service_role_write_cart" on public.cart_items
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_events" on public.ceremony_events;
create policy "service_role_write_events" on public.ceremony_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_activity" on public.activity_log;
create policy "service_role_write_activity" on public.activity_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role_write_reviews" on public.reviews;
create policy "service_role_write_reviews" on public.reviews
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Comptes de collecte plateforme : accès intégral réservé au rôle service
-- (jamais lisibles par la clé anon du navigateur — non affichés sur la plateforme)
drop policy if exists "service_role_only_platform_accounts" on public.platform_accounts;
create policy "service_role_only_platform_accounts" on public.platform_accounts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ============================================================================
-- 5. DONNÉES DE RÉFÉRENCE (provinces, catégories, types de cérémonie)
-- ============================================================================

create table if not exists public.categories (
  id    text primary key,
  name  text not null,
  icon  text,
  rank  integer not null default 0
);

create table if not exists public.cities (
  id       text primary key,
  name     text not null,
  province text not null
);

create table if not exists public.event_types (
  id    text primary key,
  label text not null,
  icon  text,
  descr text
);

insert into public.categories (id, name, icon, rank) values
  ('salles',      'Salles & Jardins',      '🏛️', 1),
  ('traiteur',    'Traiteur & Buffet',     '🍽️', 2),
  ('decoration',  'Décoration & Fleurs',   '💐', 3),
  ('sono',        'Sono & Lumière',        '🔊', 4),
  ('photo',       'Photo & Vidéo / Drone', '📸', 5),
  ('animation',   'Animation & MC',        '🎤', 6),
  ('beaute',      'Beauté & Coiffure',     '💄', 7),
  ('transport',   'Transport & Cortège',   '🚗', 8),
  ('gateaux',     'Gâteaux & Pièces montées', '🎂', 9),
  ('enfants',     'Animation Enfants',     '🧸', 10),
  ('materiel',    'Location Matériel',     '🪑', 11),
  ('securite',    'Sécurité & Protocole',  '🛡️', 12)
on conflict (id) do update set name = excluded.name, icon = excluded.icon, rank = excluded.rank;

insert into public.cities (id, name, province) values
  ('goma',        'Goma',        'Nord-Kivu'),
  ('bukavu',      'Bukavu',      'Sud-Kivu'),
  ('kinshasa',    'Kinshasa',    'Kinshasa'),
  ('lubumbashi',  'Lubumbashi',  'Haut-Katanga'),
  ('matadi',      'Matadi',      'Kongo Central'),
  ('bunia',       'Bunia',       'Ituri'),
  ('kolwezi',     'Kolwezi',     'Lualaba'),
  ('kananga',     'Kananga',     'Kasaï-Central'),
  ('mbuji-mayi',  'Mbuji-Mayi',  'Kasaï Oriental'),
  ('kisangani',   'Kisangani',   'Tshopo')
on conflict (id) do update set name = excluded.name, province = excluded.province;

insert into public.event_types (id, label, icon, descr) values
  ('mariage',     'Mariage',      '💍', 'Cérémonie civile, religieuse et réception'),
  ('dot',         'Dot',          '🎁', 'Cérémonie traditionnelle de remise de la dot'),
  ('conference',  'Conférence',   '🎙️', 'Séminaires, colloques et journées professionnelles'),
  ('reunion',     'Réunion',      '🤝', 'Réunions d''affaires et assemblées'),
  ('anniversaire','Anniversaire', '🎉', 'Fêtes d''anniversaire enfants et adultes'),
  ('bapteme',     'Baptême',      '🕊️', 'Baptême religieux et réception familiale'),
  ('graduation',  'Graduation',   '🎓', 'Remise de diplômes et soirées de promotion'),
  ('concert',     'Concert',      '🎶', 'Concerts, spectacles et festivals')
on conflict (id) do update set label = excluded.label, icon = excluded.icon, descr = excluded.descr;

alter table public.categories   enable row level security;
alter table public.cities       enable row level security;
alter table public.event_types  enable row level security;

drop policy if exists "ref_read" on public.categories;
create policy "ref_read" on public.categories for select using (true);
drop policy if exists "ref_read" on public.cities;
create policy "ref_read" on public.cities for select using (true);
drop policy if exists "ref_read" on public.event_types;
create policy "ref_read" on public.event_types for select using (true);

-- ============================================================================
-- 6. FIN — vérification rapide
-- ============================================================================
-- select table_name from information_schema.tables
-- where table_schema = 'public' order by table_name;
