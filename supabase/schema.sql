-- AgriAssist AI — Supabase schema
-- Reference schema for the current AgriAssist AI application.
-- Based on the current Supabase project structure.
-- Auth users are managed by Supabase Auth.

create extension if not exists "pgcrypto";

------------------------------------------------------------
-- APP ROLE
------------------------------------------------------------

do $$
begin
  create type public.app_role as enum ('farmer', 'admin');
exception
  when duplicate_object then null;
end $$;

------------------------------------------------------------
-- PROFILES
------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  phone text,
  preferred_language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles owner select"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles owner insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles owner update"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

------------------------------------------------------------
-- USER ROLES
------------------------------------------------------------

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'farmer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "roles owner select"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

------------------------------------------------------------
-- FARMS
------------------------------------------------------------

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  village text,
  district text,
  state text,
  country text,
  farm_size_acres numeric,
  primary_crop text,
  secondary_crop text,
  soil_type text,
  water_source text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.farms enable row level security;

create policy "farms owner all"
on public.farms
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

------------------------------------------------------------
-- CHAT HISTORY
------------------------------------------------------------

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  pinned boolean not null default false,
  agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_history enable row level security;

create policy "chat_history owner all"
on public.chat_history
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists chat_history_user_updated_idx
on public.chat_history(user_id, updated_at desc);

------------------------------------------------------------
-- CHAT MESSAGES
------------------------------------------------------------

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chat_history(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  image_url text,
  agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages owner all"
on public.chat_messages
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists chat_messages_chat_created_idx
on public.chat_messages(chat_id, created_at);

------------------------------------------------------------
-- REPORTS
------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chat_id uuid references public.chat_history(id) on delete set null,
  title text not null,
  kind text not null,
  summary text,
  file_url text,
  size_bytes bigint,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "reports owner all"
on public.reports
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

------------------------------------------------------------
-- DISEASE SCANS
------------------------------------------------------------

create table if not exists public.disease_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crop text,
  disease_name text not null,
  severity text,
  confidence integer,
  emergency_level text,
  intro text,
  blocks jsonb not null,
  image_data_url text,
  created_at timestamptz not null default now()
);

alter table public.disease_scans enable row level security;

create policy "Users can view their own scans"
on public.disease_scans
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own scans"
on public.disease_scans
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own scans"
on public.disease_scans
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists disease_scans_user_created_idx
on public.disease_scans(user_id, created_at desc);

------------------------------------------------------------
-- ACTIVITY LOG
------------------------------------------------------------

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "Users can insert own activity"
on public.activity_log
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own activity"
on public.activity_log
for select
to authenticated
using (auth.uid() = user_id);

create policy "activity owner all"
on public.activity_log
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists activity_log_user_created_idx
on public.activity_log(user_id, created_at desc);

------------------------------------------------------------
-- USER SETTINGS
------------------------------------------------------------

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null,
  language text not null,
  notify_weather boolean not null default true,
  notify_disease boolean not null default true,
  notify_weekly_report boolean not null default false,
  notify_market boolean not null default true,
  share_anon_data boolean not null default true,
  personalised boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: owner all"
on public.user_settings
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

------------------------------------------------------------
-- SERVICE ROLE ACCESS
------------------------------------------------------------

grant all on public.profiles to service_role;
grant all on public.user_roles to service_role;
grant all on public.farms to service_role;
grant all on public.chat_history to service_role;
grant all on public.chat_messages to service_role;
grant all on public.reports to service_role;
grant all on public.disease_scans to service_role;
grant all on public.activity_log to service_role;
grant all on public.user_settings to service_role;