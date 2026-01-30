/**
 * Centralized notification utilities for creating consistent notifications
 */

export type NotificationType = 
  | 'payment' 
  | 'reminder' 
  | 'announcement' 
  | 'result' 
  | 'attendance'
  | 'attendance_absent'
  | 'attendance_late'
  | 'assignment'
  | 'grade_approval'
  | 'exam_deadline'
  | 'birthday'
  | 'payment_confirmation'
  | 'activity_reminder'
  | 'library_due'
  | 'library_overdue'
  | 'transport'
  | 'system'
  | 'general';

export interface CreateNotificationOptions {
  institutionId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceType?: string;
  referenceId?: string;
  // Target audience (at least one required)
  userId?: string;
  parentId?: string;
  studentId?: string;
}

export interface NotificationPayload {
  institution_id: string;
  title: string;
  message: string;
  type: string;
  reference_type?: string;
  reference_id?: string;
  user_id?: string;
  parent_id?: string;
  student_id?: string;
  user_type?: 'staff' | 'parent' | 'student';
  is_read: boolean;
  created_at: string;
}

/**
 * Build a notification payload ready for insertion
 */
export function buildNotificationPayload(options: CreateNotificationOptions): NotificationPayload {
  const { userId, parentId, studentId, ...rest } = options;
  
  let userType: 'staff' | 'parent' | 'student' | undefined;
  if (userId) userType = 'staff';
  else if (parentId) userType = 'parent';
  else if (studentId) userType = 'student';

  return {
    institution_id: rest.institutionId,
    title: rest.title,
    message: rest.message,
    type: rest.type,
    reference_type: rest.referenceType,
    reference_id: rest.referenceId,
    user_id: userId,
    parent_id: parentId,
    student_id: studentId,
    user_type: userType,
    is_read: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get icon emoji for notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    payment: '💰',
    reminder: '⏰',
    announcement: '📢',
    result: '📊',
    attendance: '✅',
    attendance_absent: '⚠️',
    attendance_late: '⏰',
    assignment: '📝',
    grade_approval: '✔️',
    exam_deadline: '📋',
    birthday: '🎂',
    payment_confirmation: '✅',
    activity_reminder: '📅',
    library_due: '📖',
    library_overdue: '📕',
    transport: '🚌',
    system: '⚙️',
    general: '🔔',
  };
  return icons[type] || icons.general;
}

/**
 * Get badge variant for notification type
 */
export function getNotificationBadgeVariant(type: NotificationType): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<NotificationType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    payment: 'default',
    reminder: 'destructive',
    announcement: 'secondary',
    result: 'default',
    attendance: 'secondary',
    attendance_absent: 'destructive',
    attendance_late: 'destructive',
    assignment: 'outline',
    grade_approval: 'default',
    exam_deadline: 'destructive',
    birthday: 'default',
    payment_confirmation: 'default',
    activity_reminder: 'secondary',
    library_due: 'outline',
    library_overdue: 'destructive',
    transport: 'secondary',
    system: 'outline',
    general: 'secondary',
  };
  return variants[type] || 'secondary';
}

/**
 * Format notification message with placeholders
 */
export function formatNotificationMessage(
  template: string,
  data: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return result;
}
