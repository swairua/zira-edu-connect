-- Add new enum values (must be committed before use)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'coach';
ALTER TYPE permission_domain ADD VALUE IF NOT EXISTS 'activities';