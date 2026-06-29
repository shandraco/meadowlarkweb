-- ============================================================================
-- Migration 002 — POS layout: categories (pages) + per-category ordering
-- Run in the Supabase SQL Editor after migration_001. Idempotent.
-- ============================================================================

create table if not exists public.pos_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists pos_category_id uuid references public.pos_categories(id) on delete set null;
alter table public.products
  add column if not exists pos_order integer not null default 0;

alter table public.pos_categories enable row level security;
drop policy if exists "public read pos categories" on public.pos_categories;
create policy "public read pos categories" on public.pos_categories
  for select using (true);
drop policy if exists "staff manage pos categories" on public.pos_categories;
create policy "staff manage pos categories" on public.pos_categories
  for all using (public.is_staff()) with check (public.is_staff());

-- Seed once: one category per existing tier, products assigned + ordered.
do $$
begin
  if not exists (select 1 from public.pos_categories) then
    insert into public.pos_categories (name, sort_order)
      select tier, (row_number() over (order by min(sort_order)))::int
        from public.products
       where tier is not null
       group by tier;

    update public.products p
       set pos_category_id = c.id,
           pos_order = p.sort_order
      from public.pos_categories c
     where c.name = p.tier;
  end if;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.pos_categories;
exception when duplicate_object then null; end $$;
