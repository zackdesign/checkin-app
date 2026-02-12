-- Check-In PWA Database Schema
-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Events (a check-in session, e.g. "Monday Open Day")
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profiles (named people)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- Devices (NFC tag or web browser)
create table devices (
  id uuid primary key default uuid_generate_v4(),
  device_identifier text not null unique,
  device_type text not null check (device_type in ('nfc', 'web')),
  profile_id uuid references profiles(id) on delete set null,
  label text,
  created_at timestamptz not null default now()
);

-- Check-ins
create table check_ins (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  device_id uuid not null references devices(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  source text not null check (source in ('nfc', 'qr_web'))
);

create index idx_checkins_event on check_ins(event_id);
create index idx_checkins_time on check_ins(checked_in_at desc);

-- Enable realtime
alter publication supabase_realtime add table check_ins;

-- Permissive RLS (tighten later with auth)
alter table events enable row level security;
alter table profiles enable row level security;
alter table devices enable row level security;
alter table check_ins enable row level security;

create policy "public_all" on events for all using (true) with check (true);
create policy "public_all" on profiles for all using (true) with check (true);
create policy "public_all" on devices for all using (true) with check (true);
create policy "public_all" on check_ins for all using (true) with check (true);
