-- Add sort_order column to todos for drag-and-drop reordering
alter table todos add column sort_order integer default 0;

-- Backfill existing todos with sort_order based on created_at
with numbered as (
  select id, row_number() over (partition by trip_id order by created_at) as rn
  from todos
)
update todos set sort_order = numbered.rn
from numbered
where todos.id = numbered.id;
