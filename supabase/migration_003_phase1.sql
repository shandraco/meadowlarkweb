-- ============================================================================
-- Migration 003 — Phase 0 + Phase 1 foundations
--   • Locations (multi-register attribution: farm, market downtown, market heritage)
--   • Vendors + vendor stock movements (consignment tracking)
--   • Discount / sale pricing on products
--   • Age confirmation flag on orders (Phase 0 age gate)
--   • Payment provider + provider ref on orders (replaces stripe_payment_intent_id)
--   • CMS: expanded default blocks (story, tap_list, activities, admission, club_teaser)
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---- Locations -----------------------------------------------------------
do $$ begin
  create type location_kind as enum ('farm', 'market', 'popup');
exception when duplicate_object then null; end $$;

create table if not exists public.locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  kind       location_kind not null default 'farm',
  active     boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.locations enable row level security;
drop policy if exists "public read locations" on public.locations;
create policy "public read locations" on public.locations
  for select using (true);
drop policy if exists "staff manage locations" on public.locations;
create policy "staff manage locations" on public.locations
  for all using (public.is_staff()) with check (public.is_staff());

-- Seed defaults on first run only
insert into public.locations (name, kind, sort_order)
  select 'The Farm', 'farm', 0
  where not exists (select 1 from public.locations);
insert into public.locations (name, kind, sort_order)
  select 'Farmers Market — Downtown', 'market', 1
  where not exists (select 1 from public.locations where name = 'Farmers Market — Downtown');
insert into public.locations (name, kind, sort_order)
  select 'Farmers Market — Heritage', 'market', 2
  where not exists (select 1 from public.locations where name = 'Farmers Market — Heritage');

-- Orders get a location for POS attribution; null for online orders.
alter table public.orders
  add column if not exists location_id uuid references public.locations(id) on delete set null;
create index if not exists idx_orders_location on public.orders(location_id);

-- ---- Vendors (consignment) -----------------------------------------------
create table if not exists public.vendors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  contact_email text,
  contact_phone text,
  split_pct     numeric(5,2) not null default 70.00 check (split_pct >= 0 and split_pct <= 100),
  notes         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.vendors enable row level security;
drop policy if exists "staff read vendors" on public.vendors;
create policy "staff read vendors" on public.vendors
  for select using (public.is_staff());
drop policy if exists "staff manage vendors" on public.vendors;
create policy "staff manage vendors" on public.vendors
  for all using (public.is_staff()) with check (public.is_staff());

-- Products can optionally belong to a vendor (consignment stock).
alter table public.products
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

-- Stock movements can identify which vendor brought a restock.
alter table public.stock_movements
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

-- ---- Discount / sale pricing ---------------------------------------------
alter table public.products
  add column if not exists sale_price_cents integer check (sale_price_cents is null or sale_price_cents >= 0),
  add column if not exists sale_starts_at   timestamptz,
  add column if not exists sale_ends_at     timestamptz;

-- Convenience: current effective price. Live-computed so no cron needed.
create or replace function public.effective_price_cents(p public.products)
returns integer language sql immutable as $$
  select case
    when p.sale_price_cents is not null
      and (p.sale_starts_at is null or p.sale_starts_at <= now())
      and (p.sale_ends_at   is null or p.sale_ends_at   >  now())
      then p.sale_price_cents
    else p.price_cents
  end
$$;

-- ---- Age confirmation on orders -----------------------------------------
alter table public.orders
  add column if not exists age_confirmed_at timestamptz,
  add column if not exists age_confirm_ip   text;

-- Products can flag whether they require an age check (default true for cider).
alter table public.products
  add column if not exists requires_age_check boolean not null default false;

update public.products
   set requires_age_check = true
 where category = 'cider' and requires_age_check = false;

-- ---- Payment provider abstraction ---------------------------------------
alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_ref      text;

-- Backfill existing orders so we don't lose the paper trail.
update public.orders
   set payment_provider = 'stripe',
       payment_ref      = stripe_payment_intent_id
 where payment_ref is null
   and stripe_payment_intent_id is not null;

create index if not exists idx_orders_payment_ref on public.orders(payment_ref);

-- ---- mark_order_paid: keyed by payment_ref (fallback to legacy pi column) --
create or replace function public.mark_order_paid(p_payment_intent text)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
    where payment_ref = p_payment_intent
       or stripe_payment_intent_id = p_payment_intent
    for update;
  if not found then return; end if;
  if v_order.status = 'paid' or v_order.paid_at is not null then return; end if;

  update public.orders set status = 'paid', paid_at = now() where id = v_order.id;

  update public.products p
     set stock_quantity = greatest(0, p.stock_quantity - oi.quantity),
         updated_at = now()
    from public.order_items oi
   where oi.order_id = v_order.id and oi.product_id = p.id;

  insert into public.stock_movements (product_id, delta, reason, order_id)
    select oi.product_id, -oi.quantity, 'sale', v_order.id
      from public.order_items oi
     where oi.order_id = v_order.id and oi.product_id is not null;
end $$;

-- ---- Vendor payout summary view ------------------------------------------
create or replace view public.vendor_sales_summary as
  select
    v.id                                             as vendor_id,
    v.name                                           as vendor_name,
    v.split_pct                                      as split_pct,
    count(distinct o.id)                             as order_count,
    coalesce(sum(oi.line_total_cents), 0)::int       as gross_cents,
    coalesce(sum(oi.line_total_cents * v.split_pct / 100), 0)::int as vendor_owed_cents
  from public.vendors v
  left join public.products p    on p.vendor_id = v.id
  left join public.order_items oi on oi.product_id = p.id
  left join public.orders o       on o.id = oi.order_id and o.status = 'paid'
  group by v.id, v.name, v.split_pct;

-- ---- CMS defaults for new blocks (won't overwrite edits) ------------------
insert into public.site_content (key, value) values
  ('story', '{
    "eyebrow": "Tom & Gina Brown",
    "headline": "Two lives abroad.",
    "emphasis": "One farm back home.",
    "paragraph1": "Tom and Gina are Kansas born and raised — but for years, Kansas wasn''t home. Tom spent time in Pakistan and Afghanistan working in agriculture development. Gina worked in healthcare. They lived rich lives of creative work and friendships from all over the world.",
    "paragraph2": "When they came back, they brought everything they''d learned about land, food, and community. In 2010, with the help of many friends, they planted 5,000 peach and apple trees east of Wichita and started building what Meadowlark is today.",
    "paragraph3": "Their cider is different because it has to be: every apple pressed at Meadowlark was grown here, on this land. No concentrate. No outside fruit. An estate cidery in the truest sense.",
    "quote": "We love the good people of Kansas and we really enjoy our customers at the farm.",
    "attribution": "— Tom & Gina Brown",
    "primaryImageUrl": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85",
    "secondaryImageUrl": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80"
  }'::jsonb),
  ('activities', '{
    "eyebrow": "At the Farm",
    "headline": "Walk, play,",
    "emphasis": "drink, eat, enjoy.",
    "paragraph1": "Meadowlark isn''t just a place to buy cider — it''s a place to spend an afternoon. Bring the family, bring your dog, bring a blanket. There''s always something happening in Rose Hill.",
    "paragraph2": "Hard cider on tap alongside sparkling apple cider, house-made root beer, and seasonal slushies — something for everyone, every age."
  }'::jsonb),
  ('club_teaser', '{
    "eyebrow": "Cider Club",
    "headline": "First from the press.",
    "emphasis": "Every season.",
    "body": "Members receive their allocation before each release goes public — shipped to your door or held for farm pickup.",
    "fineprint": "From $120/season · Free first tasting room visit · 10–15% off the shop",
    "ctaLabel": "Become a Member",
    "ctaHref": "/cider-club",
    "imageUrl": "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=80"
  }'::jsonb),
  ('admission', '{
    "admissionValue": "$3.50–$4.00",
    "admissionSub": "per person (10+) · Kids under 10 free",
    "hoursValue": "Wed–Sun",
    "hoursSub": "10am–5pm · Fri until 6:30pm · Year-round",
    "locationValue": "Rose Hill, KS",
    "locationSub": "11249 SW 160th St · No appointment needed"
  }'::jsonb)
on conflict (key) do nothing;

do $$ begin
  alter publication supabase_realtime add table public.locations;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.vendors;
exception when duplicate_object then null; end $$;
