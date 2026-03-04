-- Add project grouping and due date to dev_tasks
alter table dev_tasks
  add column if not exists project  text,
  add column if not exists due_date date;

create index if not exists idx_dev_tasks_project  on dev_tasks (project);
create index if not exists idx_dev_tasks_due_date on dev_tasks (due_date);
