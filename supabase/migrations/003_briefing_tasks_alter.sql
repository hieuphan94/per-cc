-- Migration: Upgrade briefing_tasks from simple schema to richer schema
-- Run this in Supabase Studio > SQL Editor if the table already exists with the old schema
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards)

-- 1. Add new columns (idempotent)
ALTER TABLE briefing_tasks
  ADD COLUMN IF NOT EXISTS priority smallint NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS source   text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS ai_note  text;

-- 2. Rename ai_priority → ai_score (only if ai_priority still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'briefing_tasks' AND column_name = 'ai_priority'
  ) THEN
    ALTER TABLE briefing_tasks RENAME COLUMN ai_priority TO ai_score;
  END IF;
END $$;

-- 3. Add ai_score check constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'briefing_tasks_ai_score_check'
  ) THEN
    ALTER TABLE briefing_tasks
      ADD CONSTRAINT briefing_tasks_ai_score_check
      CHECK (ai_score IS NULL OR ai_score BETWEEN 1 AND 10);
  END IF;
END $$;

-- 4. Add priority check constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'briefing_tasks_priority_check'
  ) THEN
    ALTER TABLE briefing_tasks
      ADD CONSTRAINT briefing_tasks_priority_check CHECK (priority BETWEEN 1 AND 5);
  END IF;
END $$;

-- 5. Add source check constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'briefing_tasks_source_check'
  ) THEN
    ALTER TABLE briefing_tasks
      ADD CONSTRAINT briefing_tasks_source_check CHECK (source IN ('sheet', 'manual'));
  END IF;
END $$;

-- 6. Migrate status values: pending → todo
UPDATE briefing_tasks SET status = 'todo' WHERE status = 'pending';

-- 7. Replace status check constraint to include 'todo' and 'skipped'
ALTER TABLE briefing_tasks DROP CONSTRAINT IF EXISTS briefing_tasks_status_check;
ALTER TABLE briefing_tasks
  ADD CONSTRAINT briefing_tasks_status_check CHECK (status IN ('todo', 'done', 'skipped'));

-- 8. Update status column default from 'pending' to 'todo'
ALTER TABLE briefing_tasks ALTER COLUMN status SET DEFAULT 'todo';

-- 9. Drop columns no longer needed
ALTER TABLE briefing_tasks
  DROP COLUMN IF EXISTS notes,
  DROP COLUMN IF EXISTS synced_at;

-- 10. Drop the old unique constraint on sheet_row_id alone
ALTER TABLE briefing_tasks DROP CONSTRAINT IF EXISTS briefing_tasks_sheet_row_id_key;

-- 11. Add compound unique index for sheet dedup (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_briefing_tasks_sheet_dedup
  ON briefing_tasks (sheet_row_id, task_date)
  WHERE sheet_row_id IS NOT NULL;

-- 12. Add missing index on status
CREATE INDEX IF NOT EXISTS idx_briefing_tasks_status ON briefing_tasks (status);
