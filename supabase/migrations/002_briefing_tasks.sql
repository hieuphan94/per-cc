-- Module 1: Morning Briefing tasks
-- Stores daily tasks from Google Sheets or manual input, with AI prioritization

create table if not exists briefing_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  status        text not null default 'todo'
                check (status in ('todo', 'done', 'skipped')),
  priority      smallint not null default 3
                check (priority between 1 and 5),
  source        text not null default 'manual'
                check (source in ('sheet', 'manual')),
  sheet_row_id  text,
  ai_score      smallint
                check (ai_score is null or ai_score between 1 and 10),
  ai_note       text,
  task_date     date not null default current_date,
  created_at    timestamptz not null default now()
);

create unique index if not exists idx_briefing_tasks_sheet_dedup
  on briefing_tasks (sheet_row_id, task_date)
  where sheet_row_id is not null;

create index if not exists idx_briefing_tasks_date on briefing_tasks (task_date desc);
create index if not exists idx_briefing_tasks_status on briefing_tasks (status);

alter table briefing_tasks enable row level security;
create policy "auth_only" on briefing_tasks for all using (auth.role() = 'authenticated');
