-- Add bars event type and bar_venues table

-- Update events type constraint to include 'bars'
alter table events drop constraint if exists events_type_check;
alter table events add constraint events_type_check
  check (type in ('travel', 'hotel', 'restaurant', 'activity', 'shopping', 'bars'));

-- Bar venues table (child of events)
create table bar_venues (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  address text,
  google_maps_url text,
  category text,
  notes text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

create index idx_bar_venues_event_id on bar_venues(event_id);

-- RLS: reuse existing is_trip_owner / is_trip_shared_with helpers
alter table bar_venues enable row level security;

create policy "bar_venues_owner_all" on bar_venues
  for all using (
    exists (
      select 1 from events e
      join trips t on t.id = e.trip_id
      where e.id = bar_venues.event_id
        and (is_trip_owner(t.id, auth.uid()) or is_trip_shared_with(t.id, auth.uid()))
    )
  );
