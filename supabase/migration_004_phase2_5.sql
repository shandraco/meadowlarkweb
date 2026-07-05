-- ============================================================================
-- Migration 004 — Phase 2–5 foundations
--   • Bookable resources + bookings (shelters, spaces) + blocked dates
--   • Field trip programs (a specialized bookable)
--   • Cider Club: plans, subscriptions, shipment queue
--   • Season reminder subscribers
--   • Discount campaigns (with social auto-post state)
--   • Shipping provider config (Vino Shipper API bridge)
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---- Enums ----------------------------------------------------------------
do $$ begin
  create type resource_kind as enum ('shelter', 'barn', 'field', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active', 'paused', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shipment_status as enum ('queued', 'packed', 'shipped', 'delivered', 'skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum ('draft', 'scheduled', 'live', 'ended');
exception when duplicate_object then null; end $$;

-- ---- Bookable resources (shelters, barn, fields) --------------------------
create table if not exists public.bookable_resources (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  kind               resource_kind not null default 'shelter',
  capacity           integer,
  description        text,
  price_cents        integer not null default 0 check (price_cents >= 0),
  deposit_pct        integer not null default 25 check (deposit_pct between 0 and 100),
  hero_image_url     text,
  floor_plan_url     text,
  amenities          jsonb not null default '{}'::jsonb,
  active             boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now()
);

alter table public.bookable_resources enable row level security;
drop policy if exists "public read active resources" on public.bookable_resources;
create policy "public read active resources" on public.bookable_resources
  for select using (active = true or public.is_staff());
drop policy if exists "staff manage resources" on public.bookable_resources;
create policy "staff manage resources" on public.bookable_resources
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Field trip programs (specialized bookings) --------------------------
create table if not exists public.field_trip_programs (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text,
  price_per_student_cents integer not null default 0 check (price_per_student_cents >= 0),
  min_students          integer not null default 10,
  max_students          integer not null default 60,
  season_start_month    integer check (season_start_month between 1 and 12),
  season_end_month      integer check (season_end_month between 1 and 12),
  schedule              jsonb not null default '[]'::jsonb,
  teacher_notes         text,
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

alter table public.field_trip_programs enable row level security;
drop policy if exists "public read active field trip programs" on public.field_trip_programs;
create policy "public read active field trip programs" on public.field_trip_programs
  for select using (active = true or public.is_staff());
drop policy if exists "staff manage field trip programs" on public.field_trip_programs;
create policy "staff manage field trip programs" on public.field_trip_programs
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Bookings (facility + field trip share this table) -------------------
create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  booking_number     bigint generated always as identity,
  resource_id        uuid references public.bookable_resources(id) on delete set null,
  program_id         uuid references public.field_trip_programs(id) on delete set null,
  status             booking_status not null default 'pending',
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  guest_count        integer not null default 1 check (guest_count > 0),
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text,
  organization       text,
  notes              text,
  total_cents        integer not null default 0,
  deposit_cents      integer not null default 0,
  payment_provider   text,
  payment_ref        text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists idx_bookings_resource_time on public.bookings(resource_id, starts_at);
create index if not exists idx_bookings_program_time  on public.bookings(program_id, starts_at);
create index if not exists idx_bookings_status        on public.bookings(status);

alter table public.bookings enable row level security;
drop policy if exists "staff read bookings" on public.bookings;
create policy "staff read bookings" on public.bookings
  for select using (public.is_staff());
-- Public inserts happen via service-role admin key, same pattern as orders.

-- ---- Blocked dates (admin-managed unavailability) ------------------------
create table if not exists public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  resource_id  uuid references public.bookable_resources(id) on delete cascade,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  reason       text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_blocked_dates_resource_time on public.blocked_dates(resource_id, starts_at);

alter table public.blocked_dates enable row level security;
drop policy if exists "public read blocked dates" on public.blocked_dates;
create policy "public read blocked dates" on public.blocked_dates
  for select using (true);
drop policy if exists "staff manage blocked dates" on public.blocked_dates;
create policy "staff manage blocked dates" on public.blocked_dates
  for all using (public.is_staff()) with check (public.is_staff());

-- Convenience: are any bookings/blocks in [t1, t2) for a resource?
create or replace function public.resource_has_conflict(
  p_resource uuid,
  p_start    timestamptz,
  p_end      timestamptz
) returns boolean language sql stable as $$
  select exists (
    select 1 from public.bookings b
     where b.resource_id = p_resource
       and b.status in ('pending', 'confirmed')
       and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
  ) or exists (
    select 1 from public.blocked_dates x
     where x.resource_id = p_resource
       and tstzrange(x.starts_at, x.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
  );
$$;

-- ---- Cider Club: plans + subscriptions + shipment queue ------------------
create table if not exists public.subscription_plans (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  tier             text not null,
  cadence          text not null default 'quarterly',
  bottles_per_shipment integer not null default 2,
  price_cents      integer not null check (price_cents >= 0),
  description      text,
  benefits         text,
  active           boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.subscription_plans enable row level security;
drop policy if exists "public read active plans" on public.subscription_plans;
create policy "public read active plans" on public.subscription_plans
  for select using (active = true or public.is_staff());
drop policy if exists "staff manage plans" on public.subscription_plans;
create policy "staff manage plans" on public.subscription_plans
  for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  member_number      bigint generated always as identity,
  plan_id            uuid references public.subscription_plans(id) on delete set null,
  status             subscription_status not null default 'active',
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text,
  shipping_address   text,
  fulfillment_mode   text not null default 'ship',
  member_token       text not null default replace(gen_random_uuid()::text, '-', ''),
  started_at         timestamptz not null default now(),
  paused_until       timestamptz,
  cancelled_at       timestamptz,
  notes              text
);
create unique index if not exists idx_subscriptions_token on public.subscriptions(member_token);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

alter table public.subscriptions enable row level security;
drop policy if exists "staff read subscriptions" on public.subscriptions;
create policy "staff read subscriptions" on public.subscriptions
  for select using (public.is_staff());

create table if not exists public.subscription_shipments (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  ship_date       date not null,
  status          shipment_status not null default 'queued',
  product_ids     jsonb not null default '[]'::jsonb,
  tracking_number text,
  notes           text,
  created_at      timestamptz not null default now(),
  shipped_at      timestamptz
);
create index if not exists idx_shipments_subscription_date on public.subscription_shipments(subscription_id, ship_date);
create index if not exists idx_shipments_status on public.subscription_shipments(status);

alter table public.subscription_shipments enable row level security;
drop policy if exists "staff read shipments" on public.subscription_shipments;
create policy "staff read shipments" on public.subscription_shipments
  for select using (public.is_staff());

-- ---- Season reminders (per-topic subscribers) ---------------------------
create table if not exists public.season_subscribers (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  phone              text,
  topics             jsonb not null default '[]'::jsonb,
  confirmed_at       timestamptz not null default now(),
  unsubscribe_token  text not null default replace(gen_random_uuid()::text, '-', ''),
  created_at         timestamptz not null default now()
);
create unique index if not exists idx_season_subscribers_email on public.season_subscribers(lower(email));
create unique index if not exists idx_season_subscribers_token on public.season_subscribers(unsubscribe_token);

alter table public.season_subscribers enable row level security;
drop policy if exists "staff read season subscribers" on public.season_subscribers;
create policy "staff read season subscribers" on public.season_subscribers
  for select using (public.is_staff());
-- Public signup writes via service role (like orders).

-- ---- Discount campaigns (auto-social hook) ------------------------------
create table if not exists public.discount_campaigns (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  status           campaign_status not null default 'draft',
  product_ids      jsonb not null default '[]'::jsonb,
  starts_at        timestamptz,
  ends_at          timestamptz,
  hero_image_url   text,
  headline         text,
  body             text,
  social_posted_at timestamptz,
  social_post_ref  text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_campaigns_status_window on public.discount_campaigns(status, starts_at, ends_at);

alter table public.discount_campaigns enable row level security;
drop policy if exists "public read live campaigns" on public.discount_campaigns;
create policy "public read live campaigns" on public.discount_campaigns
  for select using (
    status = 'live'
    or public.is_staff()
  );
drop policy if exists "staff manage campaigns" on public.discount_campaigns;
create policy "staff manage campaigns" on public.discount_campaigns
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Shipping providers (Vino Shipper + future contracts) ----------------
create table if not exists public.shipping_providers (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  code              text not null unique,
  states_covered    jsonb not null default '[]'::jsonb,
  api_base_url      text,
  active            boolean not null default true,
  notes             text,
  created_at        timestamptz not null default now()
);

alter table public.shipping_providers enable row level security;
drop policy if exists "staff manage shipping providers" on public.shipping_providers;
create policy "staff manage shipping providers" on public.shipping_providers
  for all using (public.is_staff()) with check (public.is_staff());

insert into public.shipping_providers (name, code, states_covered, notes)
  select 'Vino Shipper', 'vino_shipper', '["CA","CO","FL","IL","MO","NE","NY","OK","TX"]'::jsonb,
         'Fallback carrier for out-of-Kansas cider orders. API bridge pending.'
   where not exists (select 1 from public.shipping_providers where code = 'vino_shipper');
insert into public.shipping_providers (name, code, states_covered, notes)
  select 'Farm Direct (KS)', 'farm_direct', '["KS"]'::jsonb,
         'Local Kansas orders — no third-party carrier needed.'
   where not exists (select 1 from public.shipping_providers where code = 'farm_direct');

-- ---- CMS: add farm-page video shorts block ------------------------------
insert into public.site_content (key, value) values
  ('farm_videos', '{
    "eyebrow": "Come see this in action",
    "headline": "Small snippets.",
    "emphasis": "Same farm.",
    "videos": [
      {"title": "Pressing", "url": "", "posterUrl": ""},
      {"title": "Fermenting", "url": "", "posterUrl": ""},
      {"title": "Bottling", "url": "", "posterUrl": ""}
    ]
  }'::jsonb)
on conflict (key) do nothing;

-- ---- Realtime for admin dashboards ---------------------------------------
do $$ begin alter publication supabase_realtime add table public.bookings; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.subscriptions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.subscription_shipments; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.discount_campaigns; exception when duplicate_object then null; end $$;
