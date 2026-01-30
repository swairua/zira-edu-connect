-- Create CBC grading scale for Demo Academy Kenya
INSERT INTO grading_scales (institution_id, name, scale_type, is_default)
VALUES ('3624fd5e-aa5f-4009-a2e6-386974565e8a', 'CBC 8-Point Rubric', 'rubric', true)
ON CONFLICT DO NOTHING;

-- Insert CBC rubric grade levels
INSERT INTO grade_levels (grading_scale_id, grade, min_marks, max_marks, points, description, sort_order)
SELECT 
  gs.id,
  v.grade,
  v.min_marks,
  v.max_marks,
  v.points,
  v.description,
  v.sort_order
FROM grading_scales gs
CROSS JOIN (VALUES
  ('EE1', 90.00, 100.00, 8, 'Highly Exceeding Expectations', 1),
  ('EE2', 80.00, 89.99, 7, 'Exceeding Expectations', 2),
  ('ME1', 70.00, 79.99, 6, 'Strongly Meeting Expectations', 3),
  ('ME2', 65.00, 69.99, 5, 'Meeting Expectations', 4),
  ('AE1', 55.00, 64.99, 4, 'Approaching Expectations', 5),
  ('AE2', 50.00, 54.99, 3, 'Nearly Approaching Expectations', 6),
  ('BE1', 40.00, 49.99, 2, 'Below Expectations', 7),
  ('BE2', 0.00, 39.99, 1, 'Significantly Below Expectations', 8)
) AS v(grade, min_marks, max_marks, points, description, sort_order)
WHERE gs.institution_id = '3624fd5e-aa5f-4009-a2e6-386974565e8a'
  AND gs.name = 'CBC 8-Point Rubric'
ON CONFLICT DO NOTHING;

-- Update existing student_scores for Demo Academy Kenya to use CBC rubrics
UPDATE student_scores
SET grade = CASE
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 90 THEN 'EE1'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 80 THEN 'EE2'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 70 THEN 'ME1'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 65 THEN 'ME2'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 55 THEN 'AE1'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 50 THEN 'AE2'
  WHEN (student_scores.marks::numeric / NULLIF(e.max_marks, 0) * 100) >= 40 THEN 'BE1'
  ELSE 'BE2'
END
FROM exams e, students s
WHERE student_scores.exam_id = e.id
  AND student_scores.student_id = s.id
  AND s.institution_id = '3624fd5e-aa5f-4009-a2e6-386974565e8a'
  AND student_scores.marks IS NOT NULL;