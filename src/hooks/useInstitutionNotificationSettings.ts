import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import { 
  Cake, 
  UserX, 
  Clock, 
  Calendar,
  Receipt, 
  CreditCard, 
  Wallet,
  FileText,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  BookX,
  Bus,
  MapPin,
  Route,
  Bell,
  type LucideIcon 
} from 'lucide-react';

export interface NotificationCategoryItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultChannels: string[];
  triggerType: 'realtime' | 'daily' | 'weekly';
  defaultTemplate: string;
}

export interface NotificationCategoryGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NotificationCategoryItem[];
}

export interface InstitutionNotificationSetting {
  id: string;
  institution_id: string;
  category: string;
  is_enabled: boolean;
  channels: string[];
  schedule_time: string;
  schedule_days: number[];
  custom_template: string | null;
  created_at: string;
  updated_at: string;
}

// All notification categories grouped by type
export const NOTIFICATION_CATEGORIES: NotificationCategoryGroup[] = [
  {
    id: 'celebrations',
    label: 'Celebrations',
    icon: Cake,
    items: [
      {
        id: 'birthday',
        label: 'Birthday Wishes',
        description: 'Send birthday greetings to students via parents',
        icon: Cake,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'daily',
        defaultTemplate: '🎂 Happy Birthday {student_name}! {school_name} wishes you a wonderful day filled with joy. May this year bring you great success!',
      },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: UserX,
    items: [
      {
        id: 'attendance_absent',
        label: 'Absent Alert',
        description: 'Notify parents when their child is marked absent',
        icon: UserX,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'realtime',
        defaultTemplate: '⚠️ {school_name}: {student_name} was marked absent on {attendance_date}. Please contact the school if this is unexpected.',
      },
      {
        id: 'attendance_late',
        label: 'Late Arrival Alert',
        description: 'Notify parents when their child arrives late',
        icon: Clock,
        defaultChannels: ['sms'],
        triggerType: 'realtime',
        defaultTemplate: '⏰ {school_name}: {student_name} arrived late today ({attendance_date}). Status: {attendance_status}.',
      },
      {
        id: 'attendance_summary',
        label: 'Weekly Summary',
        description: 'Send weekly attendance summary to parents',
        icon: Calendar,
        defaultChannels: ['in_app'],
        triggerType: 'weekly',
        defaultTemplate: '📋 Weekly attendance summary for {student_name}: Present {present_days} days, Absent {absent_days} days, Late {late_days} days.',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    items: [
      {
        id: 'payment_confirmation',
        label: 'Payment Confirmation',
        description: 'Confirm when a payment is received',
        icon: Receipt,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'realtime',
        defaultTemplate: '✅ {school_name}: Payment of {amount} received for {student_name}. Receipt: {receipt_number}. Balance: {balance}.',
      },
      {
        id: 'fee_reminder',
        label: 'Fee Reminder',
        description: 'Reminder for upcoming or overdue fees',
        icon: CreditCard,
        defaultChannels: ['sms'],
        triggerType: 'daily',
        defaultTemplate: '📢 {school_name}: Reminder - Fee balance of {balance} for {student_name} is due on {due_date}. Please make payment to avoid penalties.',
      },
      {
        id: 'commitment_reminder',
        label: 'Commitment Reminder',
        description: 'Remind parents of payment commitments',
        icon: Wallet,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'daily',
        defaultTemplate: '📅 {school_name}: Reminder - Your payment commitment of {amount} for {student_name} is due on {due_date}.',
      },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    items: [
      {
        id: 'assignment_due',
        label: 'Assignment Due',
        description: 'Notify about upcoming assignment deadlines',
        icon: FileText,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'daily',
        defaultTemplate: '📝 {school_name}: Assignment "{assignment_title}" for {student_name} is due tomorrow. Please ensure it is submitted on time.',
      },
      {
        id: 'grade_published',
        label: 'Grade Published',
        description: 'Notify when exam grades are published',
        icon: GraduationCap,
        defaultChannels: ['sms', 'email'],
        triggerType: 'realtime',
        defaultTemplate: '📊 {school_name}: Exam results for {student_name} have been published. Log in to the parent portal to view grades.',
      },
      {
        id: 'report_ready',
        label: 'Report Card Ready',
        description: 'Notify when report cards are available',
        icon: ClipboardCheck,
        defaultChannels: ['sms', 'email'],
        triggerType: 'realtime',
        defaultTemplate: '📄 {school_name}: The report card for {student_name} is now ready. Please log in to the parent portal to download.',
      },
    ],
  },
  {
    id: 'activities',
    label: 'Activities & Events',
    icon: Calendar,
    items: [
      {
        id: 'activity_reminder',
        label: 'Activity Reminder',
        description: 'Remind about upcoming activities and events',
        icon: Calendar,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'daily',
        defaultTemplate: '📅 {school_name}: Reminder - {event_name} is scheduled for {event_date}. Please ensure {student_name} is prepared.',
      },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    items: [
      {
        id: 'library_due',
        label: 'Book Due Tomorrow',
        description: 'Reminder for books due the next day',
        icon: BookOpen,
        defaultChannels: ['sms'],
        triggerType: 'daily',
        defaultTemplate: '📖 {school_name}: Reminder - "{book_title}" borrowed by {student_name} is due tomorrow ({return_date}). Please return to avoid fines.',
      },
      {
        id: 'library_overdue',
        label: 'Overdue Alert',
        description: 'Alert for overdue library books',
        icon: BookX,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'daily',
        defaultTemplate: '📕 {school_name}: "{book_title}" borrowed by {student_name} is OVERDUE. Please return immediately to avoid additional fines.',
      },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Bus,
    items: [
      {
        id: 'bus_departure',
        label: 'Bus Departure',
        description: 'Notify when school bus departs',
        icon: Bus,
        defaultChannels: ['sms'],
        triggerType: 'realtime',
        defaultTemplate: '🚌 {school_name}: The school bus on route {route_name} has departed. Expected arrival at {student_name}\'s stop in approximately {eta} minutes.',
      },
      {
        id: 'pickup_dropoff',
        label: 'Pickup/Dropoff',
        description: 'Confirm student pickup or dropoff',
        icon: MapPin,
        defaultChannels: ['sms'],
        triggerType: 'realtime',
        defaultTemplate: '✅ {school_name}: {student_name} has been safely {action} at {location} on {date}.',
      },
      {
        id: 'route_change',
        label: 'Route Changes',
        description: 'Notify about transport route changes',
        icon: Route,
        defaultChannels: ['sms', 'in_app'],
        triggerType: 'realtime',
        defaultTemplate: '🚌 {school_name}: Important - There has been a change to the transport route for {student_name}. {change_details}',
      },
    ],
  },
];

// Flatten categories for easy lookup
export const getAllNotificationItems = (): NotificationCategoryItem[] => {
  return NOTIFICATION_CATEGORIES.flatMap(group => group.items);
};

export const getNotificationItemById = (id: string): NotificationCategoryItem | undefined => {
  return getAllNotificationItems().find(item => item.id === id);
};

export function useInstitutionNotificationSettings() {
  const { institutionId } = useInstitution();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['institution-notification-settings', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('institution_notification_settings')
        .select('*')
        .eq('institution_id', institutionId);

      if (error) throw error;
      return data as InstitutionNotificationSetting[];
    },
    enabled: !!institutionId,
  });

  const upsertSetting = useMutation({
    mutationFn: async (setting: Partial<InstitutionNotificationSetting> & { category: string }) => {
      if (!institutionId) throw new Error('No institution ID');

      const { data, error } = await supabase
        .from('institution_notification_settings')
        .upsert(
          {
            institution_id: institutionId,
            category: setting.category,
            is_enabled: setting.is_enabled ?? true,
            channels: setting.channels ?? ['sms', 'in_app'],
            schedule_time: setting.schedule_time ?? '09:00',
            schedule_days: setting.schedule_days ?? [1, 2, 3, 4, 5],
            custom_template: setting.custom_template ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'institution_id,category' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-notification-settings', institutionId] });
    },
    onError: (error) => {
      toast.error('Failed to update notification setting');
      console.error('Error updating notification setting:', error);
    },
  });

  const toggleCategory = useMutation({
    mutationFn: async ({ category, isEnabled }: { category: string; isEnabled: boolean }) => {
      if (!institutionId) throw new Error('No institution ID');

      const { data, error } = await supabase
        .from('institution_notification_settings')
        .upsert(
          {
            institution_id: institutionId,
            category,
            is_enabled: isEnabled,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'institution_id,category' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institution-notification-settings', institutionId] });
      const item = getNotificationItemById(variables.category);
      toast.success(`${item?.label || 'Notification'} ${variables.isEnabled ? 'enabled' : 'disabled'}`);
    },
    onError: (error) => {
      toast.error('Failed to toggle notification');
      console.error('Error toggling notification:', error);
    },
  });

  const updateChannels = useMutation({
    mutationFn: async ({ category, channels }: { category: string; channels: string[] }) => {
      if (!institutionId) throw new Error('No institution ID');

      const { data, error } = await supabase
        .from('institution_notification_settings')
        .upsert(
          {
            institution_id: institutionId,
            category,
            channels,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'institution_id,category' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-notification-settings', institutionId] });
      toast.success('Channels updated');
    },
    onError: (error) => {
      toast.error('Failed to update channels');
      console.error('Error updating channels:', error);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ category, template }: { category: string; template: string | null }) => {
      if (!institutionId) throw new Error('No institution ID');

      const { data, error } = await supabase
        .from('institution_notification_settings')
        .upsert(
          {
            institution_id: institutionId,
            category,
            custom_template: template,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'institution_id,category' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-notification-settings', institutionId] });
      toast.success('Template updated');
    },
    onError: (error) => {
      toast.error('Failed to update template');
      console.error('Error updating template:', error);
    },
  });

  // Get the effective setting for a category (merged with defaults)
  const getEffectiveSetting = (categoryId: string): {
    isEnabled: boolean;
    channels: string[];
    scheduleTime: string;
    scheduleDays: number[];
    template: string;
    isCustomTemplate: boolean;
  } => {
    const saved = settingsQuery.data?.find(s => s.category === categoryId);
    const defaultItem = getNotificationItemById(categoryId);

    return {
      isEnabled: saved?.is_enabled ?? true,
      channels: saved?.channels ?? defaultItem?.defaultChannels ?? ['sms', 'in_app'],
      scheduleTime: saved?.schedule_time ?? '09:00',
      scheduleDays: saved?.schedule_days ?? [1, 2, 3, 4, 5],
      template: saved?.custom_template ?? defaultItem?.defaultTemplate ?? '',
      isCustomTemplate: !!saved?.custom_template,
    };
  };

  return {
    settings: settingsQuery.data ?? [],
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    upsertSetting,
    toggleCategory,
    updateChannels,
    updateTemplate,
    getEffectiveSetting,
    categories: NOTIFICATION_CATEGORIES,
  };
}
