-- Travel Itinerary Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trips table
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('flight', 'hotel', 'restaurant', 'activity')),
  title text not null,
  description text,
  start_datetime timestamptz not null,
  end_datetime timestamptz,
  location text,
  confirmation_number text,
  notes text,
  created_at timestamptz default now() not null
);

-- Todos table
create table if not exists todos (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  due_date date,
  created_at timestamptz default now() not null
);

-- Row Level Security

alter table trips enable row level security;
alter table events enable row level security;
alter table todos enable row level security;

-- Trips policies
create policy "Users can view their own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can create their own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on trips for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on trips for delete
  using (auth.uid() = user_id);

-- Events policies
create policy "Users can view their own events"
  on events for select
  using (auth.uid() = user_id);

create policy "Users can create their own events"
  on events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on events for delete
  using (auth.uid() = user_id);

-- Todos policies
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can create their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_trips_user_id on trips(user_id);
create index if not exists idx_events_trip_id on events(trip_id);
create index if not exists idx_events_user_id on events(user_id);
create index if not exists idx_todos_trip_id on todos(trip_id);
create index if not exists idx_todos_user_id on todos(user_id);
