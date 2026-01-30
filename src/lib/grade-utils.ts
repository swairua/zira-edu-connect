/**
 * Shared grade utility functions for curriculum-aware grading
 * Supports both CBC Rubrics (EE1, EE2, ME1, ME2, AE1, AE2, BE1, BE2) 
 * and traditional letter grades (A, B, C, D, E, F)
 */

/**
 * Get the appropriate Tailwind color classes for a grade badge
 * Works with CBC rubric grades and traditional letter grades
 */
export function getGradeColor(grade: string | null): string {
  if (!grade) return 'bg-muted text-muted-foreground';
  const g = grade.toUpperCase();
  
  // CBC Rubric colors (primary check)
  if (g.startsWith('EE')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (g.startsWith('ME')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (g.startsWith('AE')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (g.startsWith('BE')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  
  // KCSE/Standard letter grades (fallback)
  if (g === 'A' || g === 'A+' || g === 'A-') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (g.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (g.startsWith('C')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (g.startsWith('D')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

/**
 * Get human-readable description for CBC rubric grades
 */
export function getGradeDescription(grade: string | null): string {
  if (!grade) return '';
  const g = grade.toUpperCase();
  
  // CBC 8-point Rubric descriptions
  if (g === 'EE1') return 'Highly Exceeding Expectations';
  if (g === 'EE2' || g === 'EE') return 'Exceeding Expectations';
  if (g === 'ME1') return 'Strongly Meeting Expectations';
  if (g === 'ME2' || g === 'ME') return 'Meeting Expectations';
  if (g === 'AE1') return 'Approaching Expectations';
  if (g === 'AE2' || g === 'AE') return 'Nearly Approaching Expectations';
  if (g === 'BE1') return 'Below Expectations';
  if (g === 'BE2' || g === 'BE') return 'Significantly Below Expectations';
  
  // Letter grade descriptions
  if (g.startsWith('A')) return 'Excellent';
  if (g.startsWith('B')) return 'Good';
  if (g.startsWith('C')) return 'Average';
  if (g.startsWith('D')) return 'Below Average';
  if (g.startsWith('E') || g.startsWith('F')) return 'Needs Improvement';
  
  return '';
}

/**
 * Check if a grade string represents a CBC rubric grade
 */
export function isCBCGrade(grade: string | null): boolean {
  if (!grade) return false;
  const g = grade.toUpperCase();
  return g.startsWith('EE') || g.startsWith('ME') || g.startsWith('AE') || g.startsWith('BE');
}
