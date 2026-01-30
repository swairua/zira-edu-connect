export interface Room {
  id: string;
  institution_id: string;
  name: string;
  building?: string;
  floor?: string;
  capacity?: number;
  room_type: string;
  facilities?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  institution_id: string;
  name: string;
  slot_type: string;
  start_time: string;
  end_time: string;
  sequence_order: number;
  applies_to: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Runtime computed field (not in DB)
  usage_count?: number;
}

export interface Timetable {
  id: string;
  institution_id: string;
  academic_year_id: string;
  term_id?: string;
  name: string;
  timetable_type: string;
  status: string;
  effective_from?: string;
  effective_to?: string;
  created_by?: string;
  published_at?: string;
  published_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Joined types for related data
export interface TimetableClass {
  name: string;
  level?: string;
  stream?: string;
}

export interface TimetableSubject {
  name: string;
  code?: string;
}

export interface TimetableTeacher {
  first_name: string;
  last_name: string;
  employee_number?: string;
}

export interface TimetableRoom {
  name: string;
  capacity?: number;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  institution_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  time_slot_id: string;
  day_of_week: number;
  is_double_period: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields with proper types
  class?: TimetableClass;
  subject?: TimetableSubject;
  teacher?: TimetableTeacher;
  room?: TimetableRoom;
  time_slot?: TimeSlot;
}

// Extended entry type for portal views with different join aliases
export interface TimetableEntryWithJoins extends Omit<TimetableEntry, 'class' | 'subject' | 'teacher' | 'room' | 'time_slot'> {
  classes?: TimetableClass;
  subjects?: TimetableSubject;
  staff?: TimetableTeacher;
  rooms?: TimetableRoom;
  time_slots?: TimeSlot;
  timetables?: { status: string };
}

export interface TimetableException {
  id: string;
  institution_id: string;
  timetable_entry_id: string;
  exception_date: string;
  exception_type: string;
  substitute_teacher_id?: string;
  substitute_room_id?: string;
  reason?: string;
  created_by?: string;
  created_at: string;
}

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const dayLabels: Record<DayOfWeek, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const slotTypes = [
  { value: 'lesson', label: 'Lesson' },
  { value: 'break', label: 'Break' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'prep', label: 'Prep/Study' },
];

export const roomTypes = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'computer_lab', label: 'Computer Lab' },
  { value: 'hall', label: 'Hall' },
  { value: 'outdoor', label: 'Outdoor/Field' },
  { value: 'library', label: 'Library' },
  { value: 'art_room', label: 'Art Room' },
  { value: 'music_room', label: 'Music Room' },
];

export const timetableTypes = [
  { value: 'main', label: 'Main Timetable' },
  { value: 'boarding_evening', label: 'Boarding Evening' },
  { value: 'saturday', label: 'Saturday Classes' },
  { value: 'exam', label: 'Exam Timetable' },
];
