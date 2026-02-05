create table event_attachments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  content_type text not null,
  file_size integer not null,
  created_at timestamptz default now() not null
);

create index idx_event_attachments_event_id on event_attachments(event_id);

-- RLS: reuse existing is_trip_owner / is_trip_shared_with helpers
alter table event_attachments enable row level security;

create policy "attachments_owner_all" on event_attachments
  for all using (
    exists (
      select 1 from events e
      join trips t on t.id = e.trip_id
      where e.id = event_attachments.event_id
        and (is_trip_owner(t.id, auth.uid()) or is_trip_shared_with(t.id, auth.uid()))
    )
  );
