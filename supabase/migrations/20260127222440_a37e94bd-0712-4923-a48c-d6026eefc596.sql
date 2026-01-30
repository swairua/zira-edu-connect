-- Add 'submitted' and 'rejected' values to the scheme_status enum for approval workflow
ALTER TYPE scheme_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE scheme_status ADD VALUE IF NOT EXISTS 'rejected';