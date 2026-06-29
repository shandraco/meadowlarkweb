-- ============================================================================
-- Meadowlark Farm — commerce schema (Supabase / Postgres)
-- Single source of truth shared by the online store AND the POS register.
-- Run this in the Supabase SQL Editor (or via the Supabase CLI).
-- ============================================================================

-- ---- Enums ----------------------------------------------------------------
do $$ begin
  create type user_role     as enum ('admin', 'cashier');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_channel as enum ('online', 'pos');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status  as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

-- ---- Profiles (staff) — linked to Supabase auth.users ---------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       user_role not null default 'cashier',
  created_at timestamptz not null default now()
);

-- New auth users automatically get a profile row (default role: cashier).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Products / inventory -------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  tier           text,                              -- Flagship / Reserve / Fine / Farm Store
  category       text not null default 'cider',     -- 'cider' | 'farm-good'
  description    text,
  price_cents    integer not null check (price_cents >= 0),
  image_url      text,
  abv            text,
  stock_quantity integer not null default 0,
  active         boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---- Orders ---------------------------------------------------------------
create table if not exists public.orders (
  id                       uuid primary key default gen_random_uuid(),
  order_number             bigint generated always as identity,  -- human-friendly #
  channel                  order_channel not null,
  status                   order_status  not null default 'pending',
  subtotal_cents           integer not null default 0,
  tax_cents                integer not null default 0,
  total_cents              integer not null default 0,
  customer_name            text,
  customer_email           text,
  customer_phone           text,
  notes                    text,
  created_by               uuid references public.profiles(id),   -- staff (POS)
  stripe_payment_intent_id text unique,
  created_at               timestamptz not null default now(),
  paid_at                  timestamptz
);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id),
  name_snapshot    text not null,
  unit_price_cents integer not null,
  quantity         integer not null check (quantity > 0),
  line_total_cents integer not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_orders_created     on public.orders(created_at desc);
create index if not exists idx_orders_pi          on public.orders(stripe_payment_intent_id);

-- ---- Atomic "mark paid": flips status + decrements stock, idempotently ----
-- Called by the Stripe webhook (service role). Safe to call more than once.
create or replace function public.mark_order_paid(p_payment_intent text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
    where stripe_payment_intent_id = p_payment_intent
    for update;

  if not found then return; end if;
  if v_order.status = 'paid' or v_order.paid_at is not null then
    return;  -- already processed — idempotent no-op
  end if;

  update public.orders
     set status = 'paid', paid_at = now()
   where id = v_order.id;

  -- Decrement inventory for each line (never below zero).
  update public.products p
     set stock_quantity = greatest(0, p.stock_quantity - oi.quantity),
         updated_at = now()
    from public.order_items oi
   where oi.order_id = v_order.id
     and oi.product_id = p.id;
end $$;

-- ============================================================================
-- Row Level Security
--   • products: anyone may read ACTIVE products; only staff manage them.
--   • orders/order_items: only authenticated staff may read.
--       (Order creation happens server-side with the service_role key, which
--        bypasses RLS — public users never write to these tables directly.)
--   • profiles: a user reads their own; admins read all.
-- ============================================================================
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- helper: is the current user staff (has a profile)?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
drop policy if exists "read own profile"  on public.profiles;
create policy "read own profile" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- products
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select using (active = true or public.is_staff());
drop policy if exists "staff manage products" on public.products;
create policy "staff manage products" on public.products
  for all using (public.is_staff()) with check (public.is_staff());

-- orders + items (staff read only; writes via service role)
drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders
  for select using (public.is_staff());
drop policy if exists "staff read order items" on public.order_items;
create policy "staff read order items" on public.order_items
  for select using (public.is_staff());

-- ---- Realtime: stream order + product changes to the admin dashboard ------
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null; end $$;
