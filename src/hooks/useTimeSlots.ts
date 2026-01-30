import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';
import type { TimeSlot } from '@/types/timetable';

export function useTimeSlots() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['time-slots', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      // Fetch time slots
      const { data: slots, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('institution_id', institution.id)
        .order('sequence_order');
      if (error) throw error;
      
      if (!slots || slots.length === 0) return [];
      
      // Fetch usage counts for all slots
      const slotIds = slots.map(s => s.id);
      const { data: entries } = await supabase
        .from('timetable_entries')
        .select('time_slot_id')
        .in('time_slot_id', slotIds);
      
      // Count usage per slot
      const usageCounts = new Map<string, number>();
      entries?.forEach(entry => {
        usageCounts.set(entry.time_slot_id, (usageCounts.get(entry.time_slot_id) || 0) + 1);
      });
      
      // Merge counts into slots
      return slots.map(slot => ({
        ...slot,
        usage_count: usageCounts.get(slot.id) || 0,
      })) as TimeSlot[];
    },
    enabled: !!institution?.id,
  });
}

export function useTimeSlotUsage(timeSlotId: string | null) {
  return useQuery({
    queryKey: ['time-slot-usage', timeSlotId],
    queryFn: async () => {
      if (!timeSlotId) return { count: 0, timetables: [] };
      
      const { count, data, error } = await supabase
        .from('timetable_entries')
        .select('id, timetables(name)', { count: 'exact' })
        .eq('time_slot_id', timeSlotId)
        .limit(5);
        
      if (error) throw error;
      
      // Get unique timetable names
      const timetableNames = [...new Set(data?.map(e => e.timetables?.name).filter(Boolean))] as string[];
      
      return { count: count || 0, timetables: timetableNames };
    },
    enabled: !!timeSlotId,
  });
}

export function useCreateTimeSlot() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (slot: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at' | 'institution_id'>) => {
      if (!institution?.id) throw new Error('No institution selected');
      const { data, error } = await supabase
        .from('time_slots')
        .insert({ ...slot, institution_id: institution.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TimeSlot> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('time_slots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
