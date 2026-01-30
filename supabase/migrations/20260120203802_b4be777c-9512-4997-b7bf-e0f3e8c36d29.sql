-- Clean up duplicate demo teacher staff links
-- Keep only the first staff record linked to demo teacher (by created_at)
-- Unlink all other staff records from this user

WITH first_staff AS (
  SELECT id FROM staff 
  WHERE user_id = '544c41a3-fe3e-46c3-b12f-ee206986cf38'
  AND deleted_at IS NULL
  ORDER BY created_at
  LIMIT 1
)
UPDATE staff 
SET user_id = NULL
WHERE user_id = '544c41a3-fe3e-46c3-b12f-ee206986cf38'
AND id NOT IN (SELECT id FROM first_staff);