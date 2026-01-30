// Timetable utility functions

/**
 * Extract numeric code from employee number (e.g., "EMP001" -> "001")
 */
export function getNumericCode(empNumber?: string): string {
  if (!empNumber) return '--';
  const num = empNumber.replace(/\D/g, '');
  return num.slice(-2).padStart(2, '0');
}

/**
 * Get initials from first and last name
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Format teacher display code for timetable views
 * Returns: "JO-001" format (initials-numericCode)
 */
export function formatTeacherCode(
  firstName?: string, 
  lastName?: string, 
  employeeNumber?: string
): string {
  const initials = getInitials(firstName, lastName);
  if (!employeeNumber) return initials || '??';
  const numCode = getNumericCode(employeeNumber);
  return `${initials}-${numCode}`;
}

/**
 * Get styling for slot type
 */
export function getSlotTypeStyle(slotType: string): string {
  switch (slotType) {
    case 'break':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'lunch':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'assembly':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'prep':
      return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    default:
      return '';
  }
}

/**
 * Get display label for slot type (with emoji)
 */
export function getSlotLabel(slotType: string): string {
  switch (slotType) {
    case 'break': return '☕ Break';
    case 'lunch': return '🍽️ Lunch';
    case 'assembly': return '📢 Assembly';
    case 'prep': return '📚 Prep';
    default: return slotType;
  }
}

/**
 * Check if slot type is a non-lesson type
 */
export function isNonLessonSlot(slotType: string): boolean {
  return ['break', 'lunch', 'assembly', 'prep'].includes(slotType);
}
