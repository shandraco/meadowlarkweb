-- ============================================================================
-- Migration 008 — Catalog + operational features
--   • product_images: multi-image gallery per product with primary flag +
--     sort ordering. Existing products.image_url stays as the "primary" URL
--     for backwards compat.
--   • products.barcode: for POS barcode-scanner-to-add flow.
--   • refunds: full or partial refund of an order, with reason + stock
--     restoration semantics handled in the server action.
--   • gift_memberships: pre-paid Cider Club memberships. The buyer pays; a
--     recipient claims via magic-link URL; on claim we create a real
--     subscription.
--   • loyalty_events: append-only visit / purchase log per customer email.
--     Displayable "punch card" is computed on read (no separate state).
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ---- Enum extensions ------------------------------------------------------
-- Season pass confirmation email is dispatched from lib/email/send.ts; add its
-- kind so email_log inserts don't fail. Safe in a transaction because the
-- enum was created in a prior migration.
alter type email_kind add value if not exists 'season_pass_confirmation';

-- ---- Product images (gallery) ---------------------------------------------
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  is_primary  boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_product_images_product on public.product_images(product_id, sort_order);
create unique index if not exists idx_product_images_primary
  on public.product_images(product_id) where is_primary = true;

alter table public.product_images enable row level security;
drop policy if exists "public read product images" on public.product_images;
create policy "public read product images" on public.product_images
  for select using (true);
drop policy if exists "staff manage product images" on public.product_images;
create policy "staff manage product images" on public.product_images
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Products: barcode ----------------------------------------------------
alter table public.products
  add column if not exists barcode text;
create unique index if not exists idx_products_barcode
  on public.products(barcode) where barcode is not null;

-- ---- Refunds --------------------------------------------------------------
do $$ begin
  create type refund_reason as enum ('customer_request', 'damaged', 'wrong_item', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.refunds (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  amount_cents   integer not null check (amount_cents > 0),
  reason         refund_reason not null default 'customer_request',
  notes          text,
  restock        boolean not null default true,
  processed_by   uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);
create index if not exists idx_refunds_order on public.refunds(order_id, created_at desc);

alter table public.refunds enable row level security;
drop policy if exists "staff read refunds" on public.refunds;
create policy "staff read refunds" on public.refunds
  for select using (public.is_staff());
-- Writes via service role from the admin action.

-- ---- Gift memberships -----------------------------------------------------
do $$ begin
  create type gift_membership_status as enum ('pending', 'claimed', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.gift_memberships (
  id                    uuid primary key default gen_random_uuid(),
  gift_number           bigint generated always as identity,
  plan_id               uuid references public.subscription_plans(id) on delete set null,
  buyer_name            text not null,
  buyer_email           text not null,
  recipient_name        text not null,
  recipient_email       text not null,
  message               text,
  price_cents           integer not null default 0 check (price_cents >= 0),
  status                gift_membership_status not null default 'pending',
  claim_token           text not null default replace(gen_random_uuid()::text, '-', ''),
  claimed_subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at            timestamptz not null default now(),
  claimed_at            timestamptz,
  expires_at            timestamptz not null default (now() + interval '1 year')
);
create unique index if not exists idx_gift_memberships_token on public.gift_memberships(claim_token);
create index if not exists idx_gift_memberships_status on public.gift_memberships(status);
create index if not exists idx_gift_memberships_recipient on public.gift_memberships(lower(recipient_email));

alter table public.gift_memberships enable row level security;
drop policy if exists "staff read gift memberships" on public.gift_memberships;
create policy "staff read gift memberships" on public.gift_memberships
  for select using (public.is_staff());
-- Public inserts + claims go through the service role.

-- ---- Loyalty (punch card) --------------------------------------------------
do $$ begin
  create type loyalty_event_kind as enum ('visit', 'purchase', 'bonus', 'redeem');
exception when duplicate_object then null; end $$;

create table if not exists public.loyalty_events (
  id            uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name  text,
  kind          loyalty_event_kind not null,
  points        integer not null default 1,
  order_id      uuid references public.orders(id) on delete set null,
  notes         text,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_loyalty_events_email_time
  on public.loyalty_events(lower(customer_email), created_at desc);

alter table public.loyalty_events enable row level security;
drop policy if exists "staff manage loyalty" on public.loyalty_events;
create policy "staff manage loyalty" on public.loyalty_events
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Wholesale accounts (stub for a bigger portal build) ------------------
-- Bare minimum table so the schema shape is stable while the portal itself
-- is designed separately. Not exposed publicly yet.
create table if not exists public.wholesale_accounts (
  id                uuid primary key default gen_random_uuid(),
  business_name     text not null,
  contact_name      text,
  contact_email     text not null,
  contact_phone     text,
  discount_pct      numeric(5,2) not null default 20.00 check (discount_pct between 0 and 60),
  license_number    text,
  tax_exempt        boolean not null default false,
  approved_at       timestamptz,
  notes             text,
  created_at        timestamptz not null default now()
);
create unique index if not exists idx_wholesale_email on public.wholesale_accounts(lower(contact_email));

alter table public.wholesale_accounts enable row level security;
drop policy if exists "staff manage wholesale" on public.wholesale_accounts;
create policy "staff manage wholesale" on public.wholesale_accounts
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Realtime -------------------------------------------------------------
do $$ begin alter publication supabase_realtime add table public.refunds; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.gift_memberships; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.loyalty_events; exception when duplicate_object then null; end $$;
