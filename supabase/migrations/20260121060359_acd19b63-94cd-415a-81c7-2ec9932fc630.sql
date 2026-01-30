-- Fix demo institution status to active
UPDATE institutions 
SET status = 'active', 
    updated_at = NOW()
WHERE is_demo = true;