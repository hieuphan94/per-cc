-- per-cc initial schema
-- Single-user personal command center
-- All tables use auth.uid() for RLS (only the logged-in user can access their data)

-- ============================================================
-- MODULE 2: WordPress Monitor
-- Stores site configs; uptime/stats are fetched live
-- ============================================================
create table if not exists wordpress_sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text not null unique,
  -- WP Application Password (stored server-side only, never exposed to client)
  wp_user     text,
  wp_app_password text,
  is_active   boolean not null default true,
  -- Last known status (cached to avoid hitting all sites on every load)
  last_status text check (last_status in ('online', 'offline', 'warning')) default 'online',
  last_checked_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- MODULE 3: Dev Tracker
-- Tasks are synced from Google Sheets (chị Hà's sheet)
-- Stored locally as cache + enriched with notes
-- ============================================================
create table if not exists dev_tasks (
  id            uuid primary key default gen_random_uuid(),
  sheet_row_id  text unique, -- row identifier from Google Sheets
  title         text not null,
  description   text,
  status        text not null default 'todo'
                check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority      text default 'medium'
                check (priority in ('low', 'medium', 'high')),
  clarification_notes text, -- notes after AI clarification step
  synced_at     timestamptz, -- last sync from Google Sheets
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists dev_logs (
  id          uuid primary key default gen_random_uuid(),
  log_date    date not null default current_date,
  done        text[], -- array of completed items
  blocked     text[], -- array of blockers
  next        text[], -- array of next steps
  created_at  timestamptz not null default now()
);

-- ============================================================
-- MODULE 4: Trading Journal (DAC 7.0)
-- Manual entries via Telegram or web UI
-- ============================================================
create table if not exists trading_entries (
  id          uuid primary key default gen_random_uuid(),
  entry_date  date not null default current_date,
  session     text check (session in ('morning', 'afternoon', 'evening')),
  market      text, -- e.g. "XAUUSD", "BTC/USDT"
  direction   text check (direction in ('long', 'short')),
  entry_price numeric(18,4),
  exit_price  numeric(18,4),
  lot_size    numeric(10,4),
  pnl         numeric(18,2), -- profit/loss in USD
  result      text check (result in ('win', 'loss', 'breakeven')),
  notes       text,
  telegram_msg_id bigint, -- Telegram message ID for deduplication
  created_at  timestamptz not null default now()
);

-- ============================================================
-- MODULE 5: Content Pipeline
-- Idea → AI outline → post/blog/script
-- ============================================================
create table if not exists content_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content_type  text not null check (content_type in ('fb_post', 'blog', 'video_script')),
  status        text not null default 'idea'
                check (status in ('idea', 'outlined', 'drafted', 'published')),
  raw_idea      text,       -- original idea input
  ai_outline    text,       -- AI-generated outline
  final_content text,       -- final drafted content
  scheduled_for date,       -- optional publish date
  published_url text,       -- URL after publishing
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- MODULE 6: Learning Tracker
-- Daily reading, AI tools, English notes
-- ============================================================
create table if not exists learning_entries (
  id          uuid primary key default gen_random_uuid(),
  entry_date  date not null default current_date,
  entry_type  text not null check (entry_type in ('reading', 'ai_tool', 'english', 'other')),
  title       text not null,
  source      text, -- book/article/tool name
  notes       text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- MODULE 7: Auto Reports & Notifications
-- Log of sent notifications for audit + deduplication
-- ============================================================
create table if not exists notification_logs (
  id           uuid primary key default gen_random_uuid(),
  channel      text not null check (channel in ('telegram', 'email')),
  notif_type   text not null, -- 'eod_report', 'domain_alert', 'trading_reminder', etc.
  payload      jsonb,         -- full message payload for debugging
  status       text not null default 'sent' check (status in ('sent', 'failed', 'skipped')),
  error_msg    text,
  sent_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_dev_tasks_status        on dev_tasks (status);
create index if not exists idx_dev_logs_date           on dev_logs (log_date desc);
create index if not exists idx_trading_entries_date    on trading_entries (entry_date desc);
create index if not exists idx_content_items_status    on content_items (status);
create index if not exists idx_learning_entries_date   on learning_entries (entry_date desc);
create index if not exists idx_notification_logs_sent  on notification_logs (sent_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-user app: RLS enforces only the auth'd user can read/write
-- ============================================================
alter table wordpress_sites    enable row level security;
alter table dev_tasks          enable row level security;
alter table dev_logs           enable row level security;
alter table trading_entries    enable row level security;
alter table content_items      enable row level security;
alter table learning_entries   enable row level security;
alter table notification_logs  enable row level security;

-- Policy pattern: authenticated users only (single-user → only you can log in)
create policy "auth_only" on wordpress_sites    for all using (auth.role() = 'authenticated');
create policy "auth_only" on dev_tasks          for all using (auth.role() = 'authenticated');
create policy "auth_only" on dev_logs           for all using (auth.role() = 'authenticated');
create policy "auth_only" on trading_entries    for all using (auth.role() = 'authenticated');
create policy "auth_only" on content_items      for all using (auth.role() = 'authenticated');
create policy "auth_only" on learning_entries   for all using (auth.role() = 'authenticated');
create policy "auth_only" on notification_logs  for all using (auth.role() = 'authenticated');
