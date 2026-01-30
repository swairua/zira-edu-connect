-- Fix search_path for the new trigger functions
ALTER FUNCTION update_institution_student_count() SET search_path = public;
ALTER FUNCTION update_institution_staff_count() SET search_path = public;