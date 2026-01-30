-- Add location and number_of_learners columns to demo_requests table
ALTER TABLE demo_requests 
  ADD COLUMN location text,
  ADD COLUMN number_of_learners text;