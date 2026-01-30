import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClashCheckParams {
  timetableId: string;
  teacherId?: string;
  roomId?: string;
  dayOfWeek: number;
  timeSlotId: string;
  excludeEntryId?: string;
}

interface ClashResult {
  hasTeacherClash: boolean;
  hasRoomClash: boolean;
  teacherClashDetails?: {
    className: string;
    subjectName: string;
  };
  roomClashDetails?: {
    className: string;
    teacherName: string;
  };
}

export function useClashDetection({
  timetableId,
  teacherId,
  roomId,
  dayOfWeek,
  timeSlotId,
  excludeEntryId,
}: ClashCheckParams) {
  return useQuery({
    queryKey: ['clash-check', timetableId, teacherId, roomId, dayOfWeek, timeSlotId, excludeEntryId],
    queryFn: async (): Promise<ClashResult> => {
      const result: ClashResult = {
        hasTeacherClash: false,
        hasRoomClash: false,
      };

      // Check teacher clash
      if (teacherId) {
        const { data: teacherClash } = await supabase.rpc('check_teacher_clash', {
          p_timetable_id: timetableId,
          p_teacher_id: teacherId,
          p_day_of_week: dayOfWeek,
          p_time_slot_id: timeSlotId,
          p_exclude_entry_id: excludeEntryId || null,
        });

        if (teacherClash) {
          result.hasTeacherClash = true;
          
          // Get details of the conflicting entry
          const { data: conflictEntry } = await supabase
            .from('timetable_entries')
            .select('classes(name), subjects(name)')
            .eq('timetable_id', timetableId)
            .eq('teacher_id', teacherId)
            .eq('day_of_week', dayOfWeek)
            .eq('time_slot_id', timeSlotId)
            .neq('id', excludeEntryId || '')
            .single();

          if (conflictEntry) {
            result.teacherClashDetails = {
              className: (conflictEntry as any).classes?.name || 'Unknown',
              subjectName: (conflictEntry as any).subjects?.name || 'Unknown',
            };
          }
        }
      }

      // Check room clash
      if (roomId) {
        const { data: roomClash } = await supabase.rpc('check_room_clash', {
          p_timetable_id: timetableId,
          p_room_id: roomId,
          p_day_of_week: dayOfWeek,
          p_time_slot_id: timeSlotId,
          p_exclude_entry_id: excludeEntryId || null,
        });

        if (roomClash) {
          result.hasRoomClash = true;
          
          // Get details of the conflicting entry
          const { data: conflictEntry } = await supabase
            .from('timetable_entries')
            .select('classes(name), staff(first_name, last_name)')
            .eq('timetable_id', timetableId)
            .eq('room_id', roomId)
            .eq('day_of_week', dayOfWeek)
            .eq('time_slot_id', timeSlotId)
            .neq('id', excludeEntryId || '')
            .single();

          if (conflictEntry) {
            const staff = (conflictEntry as any).staff;
            result.roomClashDetails = {
              className: (conflictEntry as any).classes?.name || 'Unknown',
              teacherName: staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown',
            };
          }
        }
      }

      return result;
    },
    enabled: !!(timetableId && dayOfWeek && timeSlotId && (teacherId || roomId)),
    staleTime: 0, // Always refetch for real-time clash detection
  });
}
