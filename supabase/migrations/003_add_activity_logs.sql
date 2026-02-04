-- Activity logs for admin console
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action_type text not null,
  action_details jsonb default '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_activity_logs_created_at on activity_logs(created_at desc);
create index idx_activity_logs_user_id on activity_logs(user_id);
create index idx_activity_logs_action_type on activity_logs(action_type);
