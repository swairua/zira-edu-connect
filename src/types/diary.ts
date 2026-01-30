// Digital Diary Types

export type EntryType = 'daily_report' | 'behavior' | 'achievement' | 'concern' | 'health';
export type Mood = 'happy' | 'okay' | 'tired' | 'upset' | 'excited';
export type BehaviorType = 'positive' | 'negative' | 'neutral';

export interface DiaryEntry {
  id: string;
  student_id: string;
  institution_id: string;
  entry_date: string;
  entry_type: EntryType;
  mood?: Mood;
  meals?: {
    breakfast?: boolean;
    snack?: boolean;
    lunch?: boolean;
  };
  nap_duration_minutes?: number;
  activities?: string[];
  learning_highlights?: string;
  teacher_comment?: string;
  parent_comment?: string;
  parent_acknowledged_at?: string;
  is_flagged: boolean;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  student?: {
    first_name: string;
    last_name: string;
    admission_number: string;
    class?: { name: string };
  };
  creator?: {
    first_name: string;
    last_name: string;
  };
}

export interface BehaviorRecord {
  id: string;
  student_id: string;
  institution_id: string;
  recorded_at: string;
  behavior_type: BehaviorType;
  category: string;
  description: string;
  action_taken?: string;
  parent_notified: boolean;
  created_by?: string;
  created_at: string;
  student?: {
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  creator?: {
    first_name: string;
    last_name: string;
  };
}

export interface TimetableConstraint {
  id: string;
  institution_id: string;
  constraint_type: 'teacher' | 'subject' | 'room' | 'general';
  name: string;
  config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Common activities for quick selection
export const COMMON_ACTIVITIES = [
  'Reading',
  'Writing',
  'Drawing',
  'Music',
  'Dance',
  'Outdoor Play',
  'Indoor Games',
  'Story Time',
  'Group Work',
  'Art & Craft',
  'Physical Education',
  'Science Experiment',
  'Library Visit',
  'Assembly',
];

// Behavior categories aligned with CBC values
export const BEHAVIOR_CATEGORIES = [
  'Respect',
  'Responsibility',
  'Integrity',
  'Patriotism',
  'Peace',
  'Unity',
  'Love',
  'Cooperation',
  'Self-discipline',
  'Punctuality',
  'Cleanliness',
  'Kindness',
];

// Quick diary templates for efficient bulk entry
export interface DiaryTemplate {
  id: string;
  label: string;
  activities: string[];
  meals: { breakfast: boolean; snack: boolean; lunch: boolean };
  defaultMood: Mood;
  defaultComment: string;
}

export const DIARY_TEMPLATES: DiaryTemplate[] = [
  {
    id: 'good_day',
    label: 'Good Day ☀️',
    activities: ['Reading', 'Outdoor Play', 'Group Work', 'Art & Craft'],
    meals: { breakfast: true, snack: true, lunch: true },
    defaultMood: 'happy',
    defaultComment: 'Had a wonderful day at school! ',
  },
  {
    id: 'active_day',
    label: 'Active Day 🏃',
    activities: ['Physical Education', 'Outdoor Play', 'Dance', 'Indoor Games'],
    meals: { breakfast: true, snack: true, lunch: true },
    defaultMood: 'excited',
    defaultComment: 'Very active and engaged today! ',
  },
  {
    id: 'quiet_day',
    label: 'Quiet Day 📚',
    activities: ['Reading', 'Writing', 'Story Time', 'Art & Craft'],
    meals: { breakfast: true, snack: true, lunch: true },
    defaultMood: 'okay',
    defaultComment: 'A calm and focused day. ',
  },
  {
    id: 'learning_day',
    label: 'Learning Day 🎓',
    activities: ['Reading', 'Writing', 'Science Experiment', 'Library Visit'],
    meals: { breakfast: true, snack: true, lunch: true },
    defaultMood: 'happy',
    defaultComment: 'Great learning progress today! ',
  },
  {
    id: 'creative_day',
    label: 'Creative Day 🎨',
    activities: ['Art & Craft', 'Music', 'Dance', 'Story Time'],
    meals: { breakfast: true, snack: true, lunch: true },
    defaultMood: 'excited',
    defaultComment: 'Expressed creativity wonderfully! ',
  },
];
