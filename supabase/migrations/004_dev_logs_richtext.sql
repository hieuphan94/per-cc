-- Convert dev_logs done/blocked/next from text[] to text (HTML rich text)
-- Preserve existing data by joining array items with <br> tags

alter table dev_logs
  alter column done    type text using array_to_string(done,    '<br>'),
  alter column blocked type text using array_to_string(blocked, '<br>'),
  alter column next    type text using array_to_string(next,    '<br>');
