-- Module 1: Morning Briefing tasks
-- Cached copy of personal Google Sheet tasks for today's briefing

create table if not exists briefing_tasks (
  id           uuid primary key default gen_random_uuid(),
  sheet_row_id text unique,           -- stable row identifier from Google Sheets
  title        text not null,
  notes        text,
  status       text not null default 'pending'
               check (status in ('pending', 'done')),
  task_date    date not null default current_date,
  ai_priority  smallint,              -- 1 = highest; set by AI prioritization
  synced_at    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index if not exists idx_briefing_tasks_date on briefing_tasks (task_date desc);

alter table briefing_tasks enable row level security;
create policy "auth_only" on briefing_tasks for all using (auth.role() = 'authenticated');
