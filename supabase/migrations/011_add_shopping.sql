-- Add shopping event type and shopping_stores table

-- Update events type constraint to include 'shopping'
alter table events drop constraint if exists events_type_check;
alter table events add constraint events_type_check
  check (type in ('travel', 'hotel', 'restaurant', 'activity', 'shopping'));

-- Shopping stores table (child of events)
create table shopping_stores (
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

create index idx_shopping_stores_event_id on shopping_stores(event_id);

-- RLS: reuse existing is_trip_owner / is_trip_shared_with helpers
alter table shopping_stores enable row level security;

create policy "shopping_stores_owner_all" on shopping_stores
  for all using (
    exists (
      select 1 from events e
      join trips t on t.id = e.trip_id
      where e.id = shopping_stores.event_id
        and (is_trip_owner(t.id, auth.uid()) or is_trip_shared_with(t.id, auth.uid()))
    )
  );
