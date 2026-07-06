-- ============================================================================
-- Migration 007 — Pricing engines + season passes
--   • tax_rates: state → rate + display label. Kansas is the home state.
--   • shipping_rates: state → cost + estimated days. KS is farm pickup free.
--   • season_passes: annual farm access product. Buyers get a pass number
--     they present at the gate; expires one year after purchase.
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ---- Tax rates ------------------------------------------------------------
create table if not exists public.tax_rates (
  id             uuid primary key default gen_random_uuid(),
  state_code     text not null unique check (char_length(state_code) = 2),
  rate_bp        integer not null check (rate_bp >= 0 and rate_bp <= 2000), -- basis points (100 = 1%)
  label          text,
  effective_from timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
create index if not exists idx_tax_rates_state on public.tax_rates(state_code);

alter table public.tax_rates enable row level security;
drop policy if exists "public read tax rates" on public.tax_rates;
create policy "public read tax rates" on public.tax_rates
  for select using (true);
drop policy if exists "staff manage tax rates" on public.tax_rates;
create policy "staff manage tax rates" on public.tax_rates
  for all using (public.is_staff()) with check (public.is_staff());

-- Seed defaults — Kansas 6.5% state, common ship-to states from schema.sql.
-- Real local variations should be layered on separately (city + county
-- add-ons are their own compliance nightmare).
insert into public.tax_rates (state_code, rate_bp, label) values
  ('KS', 650, 'Kansas state sales tax'),
  ('MO', 423, 'Missouri state sales tax'),
  ('CO', 290, 'Colorado state sales tax'),
  ('NE', 550, 'Nebraska state sales tax'),
  ('OK', 450, 'Oklahoma state sales tax')
on conflict (state_code) do nothing;

-- ---- Shipping rates -------------------------------------------------------
create table if not exists public.shipping_rates (
  id            uuid primary key default gen_random_uuid(),
  state_code    text not null unique check (char_length(state_code) = 2),
  base_cents    integer not null default 0 check (base_cents >= 0),
  per_bottle_cents integer not null default 0 check (per_bottle_cents >= 0),
  days_min      integer not null default 3 check (days_min > 0),
  days_max      integer not null default 7 check (days_max >= days_min),
  notes         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_shipping_rates_state on public.shipping_rates(state_code);

alter table public.shipping_rates enable row level security;
drop policy if exists "public read shipping rates" on public.shipping_rates;
create policy "public read shipping rates" on public.shipping_rates
  for select using (true);
drop policy if exists "staff manage shipping rates" on public.shipping_rates;
create policy "staff manage shipping rates" on public.shipping_rates
  for all using (public.is_staff()) with check (public.is_staff());

-- Seed. Kansas is free (farm pickup or local delivery). Out-of-state rates
-- roughly track UPS Ground for a 6-bottle case.
insert into public.shipping_rates (state_code, base_cents, per_bottle_cents, days_min, days_max, notes) values
  ('KS', 0, 0, 1, 3, 'Farm pickup or local delivery'),
  ('MO', 2500, 200, 2, 5, 'UPS Ground'),
  ('CO', 3500, 250, 3, 6, 'UPS Ground'),
  ('NE', 2800, 200, 2, 5, 'UPS Ground'),
  ('OK', 2500, 200, 2, 5, 'UPS Ground')
on conflict (state_code) do nothing;

-- ---- Season passes --------------------------------------------------------
do $$ begin
  create type season_pass_status as enum ('active', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

create table if not exists public.season_passes (
  id              uuid primary key default gen_random_uuid(),
  pass_number     bigint generated always as identity,
  order_id        uuid references public.orders(id) on delete set null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  status          season_pass_status not null default 'active',
  price_cents     integer not null default 0 check (price_cents >= 0),
  purchased_at    timestamptz not null default now(),
  expires_at      timestamptz not null,
  redeem_token    text not null default replace(gen_random_uuid()::text, '-', ''),
  notes           text
);
create index if not exists idx_season_passes_email on public.season_passes(lower(customer_email));
create index if not exists idx_season_passes_status_exp on public.season_passes(status, expires_at);
create unique index if not exists idx_season_passes_token on public.season_passes(redeem_token);

alter table public.season_passes enable row level security;
drop policy if exists "staff read passes" on public.season_passes;
create policy "staff read passes" on public.season_passes
  for select using (public.is_staff());
-- Public inserts go through the service role admin client from the checkout
-- server action. No public policies here.

-- ---- Realtime for admin dashboards ---------------------------------------
do $$ begin alter publication supabase_realtime add table public.season_passes; exception when duplicate_object then null; end $$;
