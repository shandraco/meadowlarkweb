-- ============================================================================
-- Migration 001 — proper stock management + site content (CMS)
-- Run in the Supabase SQL Editor AFTER schema.sql/seed.sql.
-- Idempotent.
-- ============================================================================

-- ---- Stock movements: an audit trail for every inventory change -----------
do $$ begin
  create type stock_reason as enum ('initial', 'restock', 'sale', 'spoilage', 'correction', 'return');
exception when duplicate_object then null; end $$;

create table if not exists public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta      integer not null,                      -- + adds stock, - removes
  reason     stock_reason not null,
  note       text,
  order_id   uuid references public.orders(id) on delete set null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_stock_movements_product
  on public.stock_movements(product_id, created_at desc);

alter table public.stock_movements enable row level security;
drop policy if exists "staff read stock movements" on public.stock_movements;
create policy "staff read stock movements" on public.stock_movements
  for select using (public.is_staff());

-- ---- Atomic manual adjustment: update stock + log the movement ------------
create or replace function public.adjust_stock(
  p_product uuid,
  p_delta   integer,
  p_reason  stock_reason,
  p_note    text default null,
  p_user    uuid default null
) returns integer language plpgsql security definer set search_path = public as $$
declare v_new integer;
begin
  update public.products
     set stock_quantity = greatest(0, stock_quantity + p_delta),
         updated_at = now()
   where id = p_product
   returning stock_quantity into v_new;

  if not found then raise exception 'Product not found'; end if;

  insert into public.stock_movements (product_id, delta, reason, note, created_by)
    values (p_product, p_delta, p_reason, p_note, p_user);

  return v_new;
end $$;

-- ---- mark_order_paid now also LOGS each sale as a stock movement ----------
create or replace function public.mark_order_paid(p_payment_intent text)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype;
begin
  select * into v_order from public.orders
    where stripe_payment_intent_id = p_payment_intent for update;
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

-- ---- Site content (CMS): editable marketing blocks as JSON ----------------
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.site_content enable row level security;
drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content
  for select using (true);
drop policy if exists "staff manage site content" on public.site_content;
create policy "staff manage site content" on public.site_content
  for all using (public.is_staff()) with check (public.is_staff());

-- Seed default blocks (matches the current hardcoded copy). Won't overwrite
-- edits on re-run.
insert into public.site_content (key, value) values
  ('hero', '{
    "label": "Rose Hill, Kansas — Est. 2010",
    "line1": "Where the",
    "line2": "orchard",
    "emphasis": "meets the glass.",
    "body": "Tom & Gina Brown planted 5,000 trees on Kansas prairie and pressed their first cider in 2010. Every bottle is still made from fruit grown right here.",
    "primaryLabel": "Shop Cider",
    "primaryHref": "/store",
    "secondaryLabel": "Our Story",
    "secondaryHref": "/the-farm"
  }'::jsonb),
  ('seasonal_banner', '{
    "eyebrow": "Now Pouring",
    "line1": "Meadowlark Red · Meadowlark Gold · Meadow Hopper — on tap at the farm",
    "line2": "Also at Wichita Farmers Market every Saturday",
    "ctaLabel": "Visit Us →",
    "ctaHref": "/visit"
  }'::jsonb)
on conflict (key) do nothing;

-- Realtime for the admin (optional but nice).
do $$ begin
  alter publication supabase_realtime add table public.stock_movements;
exception when duplicate_object then null; end $$;
