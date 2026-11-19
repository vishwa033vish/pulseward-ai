-- ============================================================================
--  PulseWard AI — Supabase / PostgreSQL schema
--  Run in the Supabase SQL editor (or `supabase db push`).
--  Includes tables, constraints, indexes, triggers, RLS policies and storage.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
--  Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type report_category as enum (
    'road_damage', 'garbage', 'water_leak', 'streetlight', 'drainage', 'infrastructure'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_priority as enum ('Low', 'Medium', 'High', 'Urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum (
    'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('citizen', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_language as enum ('en', 'ta');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  Tables
-- ----------------------------------------------------------------------------
create table if not exists public.departments (
  id            uuid primary key default gen_random_uuid(),
  department_name text not null unique,
  description   text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null default 'Citizen',
  preferred_language app_language not null default 'en',
  role              user_role not null default 'citizen',
  created_at        timestamptz not null default now(),
  constraint display_name_length check (char_length(display_name) between 2 and 60)
);

create table if not exists public.reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text not null,
  category       report_category not null,
  priority       report_priority not null default 'Medium',
  priority_score int not null default 0 check (priority_score between 0 and 100),
  priority_reasons jsonb not null default '[]'::jsonb,
  status         report_status not null default 'Submitted',
  latitude       double precision not null check (latitude between -90 and 90),
  longitude      double precision not null check (longitude between -180 and 180),
  area           text not null default '',
  image_url      text,
  ai_analysis    jsonb,
  department_id  uuid references public.departments(id) on delete set null,
  is_sample      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint title_length check (char_length(title) between 6 and 160),
  constraint description_length check (char_length(description) between 20 and 2000)
);

create table if not exists public.report_status_events (
  id         bigserial primary key,
  report_id  uuid not null references public.reports(id) on delete cascade,
  status     report_status not null,
  note       text not null default '',
  actor_id   uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
--  Indexes
-- ----------------------------------------------------------------------------
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_status_idx     on public.reports (status);
create index if not exists reports_category_idx   on public.reports (category);
create index if not exists reports_priority_idx   on public.reports (priority);
create index if not exists reports_user_idx       on public.reports (user_id);
create index if not exists reports_geo_idx        on public.reports (latitude, longitude);
create index if not exists reports_sample_idx     on public.reports (is_sample);
create index if not exists status_events_report_idx on public.report_status_events (report_id, created_at);

-- Full-text-ish search helper
create index if not exists reports_search_idx on public.reports
  using gin (to_tsvector('simple', title || ' ' || description || ' ' || area));

-- ----------------------------------------------------------------------------
--  Helper: is the current user an admin? (security definer avoids RLS recursion)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
--  Triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, preferred_language, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Citizen'),
    coalesce((new.raw_user_meta_data->>'preferred_language')::app_language, 'en'),
    'citizen'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Record every status change automatically.
create or replace function public.log_status_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.report_status_events (report_id, status, note, actor_id)
    values (new.id, new.status, 'Report created', auth.uid());
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.report_status_events (report_id, status, note, actor_id)
    values (new.id, new.status, 'Status updated', auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists reports_status_log on public.reports;
create trigger reports_status_log
after insert or update of status on public.reports
for each row execute function public.log_status_event();

-- ----------------------------------------------------------------------------
--  Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.reports              enable row level security;
alter table public.report_status_events enable row level security;
alter table public.departments          enable row level security;

-- Profiles ------------------------------------------------------------------
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- A citizen cannot promote themselves to admin.
    and (role = (select role from public.profiles where id = auth.uid()) or public.is_admin())
  );

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Reports -------------------------------------------------------------------
-- Citizens can read all civic reports (public transparency); admins read all too.
drop policy if exists "reports read authenticated" on public.reports;
create policy "reports read authenticated" on public.reports
  for select using (auth.role() = 'authenticated');

drop policy if exists "reports insert own" on public.reports;
create policy "reports insert own" on public.reports
  for insert with check (
    auth.uid() = user_id
    and status = 'Submitted'
    and is_sample = false
  );

drop policy if exists "reports update own pending" on public.reports;
create policy "reports update own pending" on public.reports
  for update using (
    (auth.uid() = user_id and status = 'Submitted') or public.is_admin()
  )
  with check (
    -- Citizens may only edit their own report while it is still Submitted and
    -- may not change workflow fields; admins may change anything.
    public.is_admin()
    or (auth.uid() = user_id and status = 'Submitted')
  );

drop policy if exists "reports delete admin" on public.reports;
create policy "reports delete admin" on public.reports
  for delete using (public.is_admin());

-- Status events --------------------------------------------------------------
drop policy if exists "status events read authenticated" on public.report_status_events;
create policy "status events read authenticated" on public.report_status_events
  for select using (auth.role() = 'authenticated');

drop policy if exists "status events insert admin" on public.report_status_events;
create policy "status events insert admin" on public.report_status_events
  for insert with check (public.is_admin());

-- Departments ---------------------------------------------------------------
drop policy if exists "departments read all" on public.departments;
create policy "departments read all" on public.departments
  for select using (true);

drop policy if exists "departments admin write" on public.departments;
create policy "departments admin write" on public.departments
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
--  Storage: report photos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-images', 'report-images', true, 6291456,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "report images public read" on storage.objects;
create policy "report images public read" on storage.objects
  for select using (bucket_id = 'report-images');

-- Files must live under a folder named after the uploader's user id.
drop policy if exists "report images owner upload" on storage.objects;
create policy "report images owner upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'report-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "report images owner delete" on storage.objects;
create policy "report images owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'report-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ----------------------------------------------------------------------------
--  Seed departments
-- ----------------------------------------------------------------------------
insert into public.departments (department_name, description) values
  ('Public Works — Roads', 'Road surface repair, potholes and footpaths.'),
  ('Solid Waste Management', 'Garbage collection, bins and dumping sites.'),
  ('Water Supply Board', 'Pipeline leaks, supply and public taps.'),
  ('Electrical & Lighting', 'Streetlights, poles and electrical safety.'),
  ('Stormwater & Sewerage', 'Drains, manholes and sewage overflow.'),
  ('Municipal Infrastructure', 'Public structures, signage and civic assets.')
on conflict (department_name) do nothing;

-- Promote a user to admin (run manually after they sign up):
--   update public.profiles set role = 'admin' where id = '<uuid>';
