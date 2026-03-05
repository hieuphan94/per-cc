-- Add domain expiry tracking to wordpress_sites
-- Allows countdown display in WordPress Monitor module

alter table wordpress_sites
  add column if not exists domain_expiry_at date;
