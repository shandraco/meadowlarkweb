-- Migration 009 — Farm incidents log
-- A simple operational log for anything that happens on the grounds: a downed
-- tree, a broken irrigation line, wildlife damage, a pest sighting, a safety
-- issue. Each entry can carry a photo (stored in the existing product-images
-- bucket), device geolocation (lat/lng captured in the browser), and details.
-- Staff-only — never exposed to the public site.

create table if not exists public.farm_incidents (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  details       text,
  category      text not null default 'other',
  severity      text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  status        text not null default 'open'   check (status in ('open', 'resolved')),
  photo_url     text,
  latitude      double precision,
  longitude     double precision,
  location_note text,
  occurred_at   timestamptz not null default now(),
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_farm_incidents_status on public.farm_incidents(status);
create index if not exists idx_farm_incidents_occurred on public.farm_incidents(occurred_at desc);

alter table public.farm_incidents enable row level security;

-- Staff-only, both read and write. No public policy — this is internal ops.
drop policy if exists "staff read incidents" on public.farm_incidents;
create policy "staff read incidents" on public.farm_incidents
  for select using (public.is_staff());

drop policy if exists "staff manage incidents" on public.farm_incidents;
create policy "staff manage incidents" on public.farm_incidents
  for all using (public.is_staff()) with check (public.is_staff());
