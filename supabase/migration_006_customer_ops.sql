-- ============================================================================
-- Migration 006 — Customer communication + operational polish
--   • events table (live music, cider dinners, harvest days) — public read,
--     staff write. Realtime-subscribed for the admin dashboard.
--   • email_log table — every transactional email is recorded here for
--     compliance, dispute resolution, and "did the customer get their
--     receipt?" support tickets. Append-only.
--   • orders.customer_lookup_token — a random per-order token so a customer
--     can view their receipt without an account (they still need the email
--     they placed it with, but the token avoids enumerating orders by number).
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ---- Events ---------------------------------------------------------------
do $$ begin
  create type event_kind as enum ('live_music', 'cider_dinner', 'harvest_day', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  kind           event_kind not null default 'other',
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  description    text,
  hero_image_url text,
  ticket_url     text,
  price_cents    integer not null default 0 check (price_cents >= 0),
  capacity       integer check (capacity is null or capacity > 0),
  cancelled      boolean not null default false,
  featured       boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists idx_events_time on public.events(starts_at);
create index if not exists idx_events_featured_time on public.events(featured, starts_at) where cancelled = false;

alter table public.events enable row level security;
drop policy if exists "public read live events" on public.events;
create policy "public read live events" on public.events
  for select using (true);
drop policy if exists "staff manage events" on public.events;
create policy "staff manage events" on public.events
  for all using (public.is_staff()) with check (public.is_staff());

alter table public.events
  drop constraint if exists events_time_check;
alter table public.events
  add constraint events_time_check check (ends_at > starts_at);

-- ---- Email log ------------------------------------------------------------
do $$ begin
  create type email_kind as enum (
    'order_confirmation',
    'booking_confirmation',
    'booking_status_change',
    'club_welcome',
    'shipment_shipped',
    'season_blast',
    'admin_new_booking',
    'admin_new_order',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type email_status as enum ('sent', 'failed', 'skipped');
exception when duplicate_object then null; end $$;

create table if not exists public.email_log (
  id            uuid primary key default gen_random_uuid(),
  recipient     text not null,
  kind          email_kind not null,
  status        email_status not null default 'sent',
  subject       text,
  provider      text,
  provider_ref  text,
  entity_type   text,
  entity_id     text,
  error         text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_email_log_recipient_time on public.email_log(recipient, created_at desc);
create index if not exists idx_email_log_entity on public.email_log(entity_type, entity_id, created_at desc);
create index if not exists idx_email_log_kind_time on public.email_log(kind, created_at desc);

alter table public.email_log enable row level security;
drop policy if exists "admin read email log" on public.email_log;
create policy "admin read email log" on public.email_log
  for select using (public.is_admin());
-- No insert/update/delete policies — service-role writes only.

-- ---- Orders: customer_lookup_token ----------------------------------------
-- Random hex token attached at insert time. A visitor who knows their email
-- and the token URL can view their receipt. Order numbers are sequential and
-- can be guessed, so we don't want them alone to unlock the receipt.
alter table public.orders
  add column if not exists customer_lookup_token text;

-- Generate for any existing rows that don't have one.
update public.orders
   set customer_lookup_token = replace(gen_random_uuid()::text, '-', '')
 where customer_lookup_token is null;

alter table public.orders
  alter column customer_lookup_token set default replace(gen_random_uuid()::text, '-', '');

create unique index if not exists idx_orders_lookup_token
  on public.orders(customer_lookup_token);

-- IMPORTANT: no public RLS policy on orders. The customer lookup path uses
-- the service-role admin client on the server and enforces email + token
-- match inside the server action. RLS policies here would be too coarse
-- (they can't reference query params), so a public read policy would leak
-- every order by anyone iterating the token space. Keeping the door closed.

-- ---- lookup_order_by_token(token, email) — service-role SQL helper --------
-- Runs with security definer so the server action doesn't need to know the
-- physical schema shape. Returns a single order + its items if the token +
-- email match, otherwise nothing. Safe to expose to service role only.
create or replace function public.lookup_order_by_token(
  p_token text,
  p_email text
) returns table (
  order_data jsonb,
  items_data jsonb
) language plpgsql security definer set search_path = public as $$
begin
  return query
    select
      to_jsonb(o.*) as order_data,
      coalesce(
        (select jsonb_agg(to_jsonb(oi.*)) from public.order_items oi where oi.order_id = o.id),
        '[]'::jsonb
      ) as items_data
    from public.orders o
    where o.customer_lookup_token = p_token
      and lower(coalesce(o.customer_email, '')) = lower(p_email)
    limit 1;
end $$;

-- Restrict execution — only service role calls this from the server action.
revoke all on function public.lookup_order_by_token(text, text) from public;
revoke all on function public.lookup_order_by_token(text, text) from anon;
revoke all on function public.lookup_order_by_token(text, text) from authenticated;

-- ---- Realtime for admin dashboards ---------------------------------------
do $$ begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.email_log; exception when duplicate_object then null; end $$;
