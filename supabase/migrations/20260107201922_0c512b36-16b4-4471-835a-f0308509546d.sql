-- Function to update student count
CREATE OR REPLACE FUNCTION update_institution_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE institutions 
    SET student_count = student_count + 1 
    WHERE id = NEW.institution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE institutions 
    SET student_count = GREATEST(0, student_count - 1) 
    WHERE id = OLD.institution_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle institution_id change
    IF OLD.institution_id IS DISTINCT FROM NEW.institution_id THEN
      IF OLD.institution_id IS NOT NULL THEN
        UPDATE institutions 
        SET student_count = GREATEST(0, student_count - 1) 
        WHERE id = OLD.institution_id;
      END IF;
      IF NEW.institution_id IS NOT NULL THEN
        UPDATE institutions 
        SET student_count = student_count + 1 
        WHERE id = NEW.institution_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update staff count (handles soft delete)
CREATE OR REPLACE FUNCTION update_institution_staff_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.deleted_at IS NULL THEN
      UPDATE institutions 
      SET staff_count = staff_count + 1 
      WHERE id = NEW.institution_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.deleted_at IS NULL THEN
      UPDATE institutions 
      SET staff_count = GREATEST(0, staff_count - 1) 
      WHERE id = OLD.institution_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete (deleted_at changes from NULL to value)
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      UPDATE institutions 
      SET staff_count = GREATEST(0, staff_count - 1) 
      WHERE id = NEW.institution_id;
    -- Handle restore (deleted_at changes from value to NULL)
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      UPDATE institutions 
      SET staff_count = staff_count + 1 
      WHERE id = NEW.institution_id;
    -- Handle institution_id change for non-deleted staff
    ELSIF OLD.institution_id IS DISTINCT FROM NEW.institution_id AND NEW.deleted_at IS NULL THEN
      IF OLD.institution_id IS NOT NULL THEN
        UPDATE institutions 
        SET staff_count = GREATEST(0, staff_count - 1) 
        WHERE id = OLD.institution_id;
      END IF;
      IF NEW.institution_id IS NOT NULL THEN
        UPDATE institutions 
        SET staff_count = staff_count + 1 
        WHERE id = NEW.institution_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for students table
DROP TRIGGER IF EXISTS trigger_update_institution_student_count ON students;
CREATE TRIGGER trigger_update_institution_student_count
  AFTER INSERT OR DELETE OR UPDATE OF institution_id
  ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_student_count();

-- Trigger for staff table
DROP TRIGGER IF EXISTS trigger_update_institution_staff_count ON staff;
CREATE TRIGGER trigger_update_institution_staff_count
  AFTER INSERT OR DELETE OR UPDATE OF institution_id, deleted_at
  ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_staff_count();

-- Sync existing counts to fix current data
UPDATE institutions i
SET student_count = (
  SELECT COUNT(*) FROM students s WHERE s.institution_id = i.id
);

UPDATE institutions i
SET staff_count = (
  SELECT COUNT(*) FROM staff s 
  WHERE s.institution_id = i.id AND s.deleted_at IS NULL
);