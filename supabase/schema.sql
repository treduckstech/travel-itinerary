-- Travel Itinerary Database Schema
-- Run this in your Supabase SQL editor
--
-- NOTE: Auth and Row Level Security are deferred and will be re-added later.
-- When re-enabling, add user_id columns, RLS policies, and user_id indexes.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trips table
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now() not null
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  type text not null check (type in ('travel', 'hotel', 'restaurant', 'activity')),
  sub_type text,
  title text not null,
  description text,
  start_datetime timestamptz not null,
  end_datetime timestamptz,
  location text,
  confirmation_number text,
  notes text,
  timezone text,
  created_at timestamptz default now() not null
);

-- Todos table
create table if not exists todos (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false not null,
  due_date date,
  reminder_sent boolean default false not null,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Event attachments table
create table if not exists event_attachments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  content_type text not null,
  file_size integer not null,
  created_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists idx_events_trip_id on events(trip_id);
create index if not exists idx_todos_trip_id on todos(trip_id);
create index if not exists idx_event_attachments_event_id on event_attachments(event_id);
