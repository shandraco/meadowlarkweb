-- ============================================================================
-- Migration 005 — Security hardening
--   • DB-level CHECK constraints for every controlled vocabulary (defense in
--     depth: the TypeScript layer already narrows these, this makes sure a
--     rogue SQL insert or a future code path can't slip through).
--   • Admin audit log (who did what, from where, to which row, with a
--     before/after snapshot). Written by every mutating server action.
--   • Rate-limit counter table (server-side, per-key/per-window). Used by
--     the login form today; can back any future public endpoint.
-- Idempotent. Safe to re-run.
-- ============================================================================

-- ---- product_category (was loose text; keep as text + CHECK) --------------
alter table public.products
  drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('cider', 'farm-good'));

-- ---- payment_provider on orders + bookings (controlled vocabulary) --------
alter table public.orders
  drop constraint if exists orders_payment_provider_check;
alter table public.orders
  add constraint orders_payment_provider_check
  check (
    payment_provider is null
    or payment_provider in ('stripe', 'pos_terminal', 'manual_invoice')
  );

alter table public.bookings
  drop constraint if exists bookings_payment_provider_check;
alter table public.bookings
  add constraint bookings_payment_provider_check
  check (
    payment_provider is null
    or payment_provider in ('stripe', 'pos_terminal', 'manual_invoice')
  );

-- ---- fulfillment_mode on subscriptions (ship | pickup) -------------------
alter table public.subscriptions
  drop constraint if exists subscriptions_fulfillment_mode_check;
alter table public.subscriptions
  add constraint subscriptions_fulfillment_mode_check
  check (fulfillment_mode in ('ship', 'pickup'));

-- ---- subscription plan tiers + cadences -----------------------------------
alter table public.subscription_plans
  drop constraint if exists subscription_plans_tier_check;
alter table public.subscription_plans
  add constraint subscription_plans_tier_check
  check (tier in ('basic', 'reserve', 'fine'));

alter table public.subscription_plans
  drop constraint if exists subscription_plans_cadence_check;
alter table public.subscription_plans
  add constraint subscription_plans_cadence_check
  check (cadence in ('monthly', 'quarterly', 'seasonal', 'biannual'));

-- ---- Guardrails on numeric fields ----------------------------------------
alter table public.subscription_plans
  drop constraint if exists subscription_plans_bottles_check;
alter table public.subscription_plans
  add constraint subscription_plans_bottles_check
  check (bottles_per_shipment > 0 and bottles_per_shipment <= 24);

alter table public.field_trip_programs
  drop constraint if exists field_trip_programs_size_check;
alter table public.field_trip_programs
  add constraint field_trip_programs_size_check
  check (min_students > 0 and max_students >= min_students and max_students <= 500);

alter table public.bookable_resources
  drop constraint if exists bookable_resources_capacity_check;
alter table public.bookable_resources
  add constraint bookable_resources_capacity_check
  check (capacity is null or (capacity > 0 and capacity <= 5000));

alter table public.bookings
  drop constraint if exists bookings_time_check;
alter table public.bookings
  add constraint bookings_time_check
  check (ends_at > starts_at);

alter table public.blocked_dates
  drop constraint if exists blocked_dates_time_check;
alter table public.blocked_dates
  add constraint blocked_dates_time_check
  check (ends_at > starts_at);

-- ---- Admin audit log ------------------------------------------------------
do $$ begin
  create type audit_action as enum (
    'create', 'update', 'delete', 'status_change',
    'stock_adjust', 'sign_in', 'sign_out', 'other'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.admin_audit_log (
  id             uuid primary key default gen_random_uuid(),
  actor_id       uuid references public.profiles(id) on delete set null,
  actor_email    text,
  action         audit_action not null,
  entity_type    text not null,
  entity_id      text,
  summary        text,
  before_state   jsonb,
  after_state    jsonb,
  ip_address     text,
  user_agent     text,
  request_id     text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_audit_actor_time
  on public.admin_audit_log(actor_id, created_at desc);
create index if not exists idx_audit_entity
  on public.admin_audit_log(entity_type, entity_id, created_at desc);
create index if not exists idx_audit_action_time
  on public.admin_audit_log(action, created_at desc);

alter table public.admin_audit_log enable row level security;

-- Admins can read audit log; nobody can update or delete it. Writes happen
-- via service role (admin client) from the server actions.
drop policy if exists "admin read audit log" on public.admin_audit_log;
create policy "admin read audit log" on public.admin_audit_log
  for select using (public.is_admin());

-- Deliberately no insert/update/delete policies → clients can't mutate the
-- audit trail. Only the service-role key (server-side) can write.

-- ---- Rate limit counters --------------------------------------------------
-- Simple {key, window_start} pair with an attempt count. Any endpoint that
-- needs throttling picks a key ("login:<email>", "signup:<ip>", …) and
-- calls consume_rate_limit(). The function returns whether the caller is
-- still within budget.

create table if not exists public.rate_limit_events (
  id           uuid primary key default gen_random_uuid(),
  bucket       text not null,        -- "login", "signup", etc.
  identifier   text not null,        -- email, IP, or user id
  attempted_at timestamptz not null default now()
);
create index if not exists idx_rate_limit_bucket_id_time
  on public.rate_limit_events(bucket, identifier, attempted_at desc);

alter table public.rate_limit_events enable row level security;
-- No policies — service-role writes only.

-- Returns TRUE if the caller is still under budget and the attempt was
-- recorded. Returns FALSE if the caller has exceeded the budget in the
-- window and the attempt was NOT recorded (so the failure itself doesn't
-- extend the ban).
create or replace function public.consume_rate_limit(
  p_bucket     text,
  p_identifier text,
  p_max        integer,
  p_window_sec integer
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  -- Clean up old events lazily so the table doesn't grow unbounded.
  delete from public.rate_limit_events
   where attempted_at < now() - make_interval(secs => p_window_sec * 4);

  select count(*)
    into v_count
    from public.rate_limit_events
   where bucket = p_bucket
     and identifier = p_identifier
     and attempted_at > now() - make_interval(secs => p_window_sec);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limit_events (bucket, identifier)
    values (p_bucket, p_identifier);
  return true;
end $$;

-- ---- Realtime (optional; admin dashboard could tail audit log) ------------
do $$ begin
  alter publication supabase_realtime add table public.admin_audit_log;
exception when duplicate_object then null; end $$;
