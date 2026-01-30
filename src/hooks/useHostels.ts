import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { toast } from 'sonner';

export interface Hostel {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  gender: 'male' | 'female' | 'mixed';
  description: string | null;
  location: string | null;
  warden_staff_id: string | null;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  warden?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  _count?: {
    rooms: number;
    occupied_beds: number;
  };
}

export interface HostelRoom {
  id: string;
  hostel_id: string;
  institution_id: string;
  room_number: string;
  floor: string | null;
  room_type: 'standard' | 'prefect' | 'sick_bay' | 'special';
  bed_capacity: number;
  amenities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hostel?: Hostel;
  beds?: HostelBed[];
  _count?: {
    occupied_beds: number;
  };
}

export interface HostelBed {
  id: string;
  room_id: string;
  institution_id: string;
  bed_number: string;
  bed_type: 'standard' | 'upper_bunk' | 'lower_bunk';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  notes: string | null;
  created_at: string;
  updated_at: string;
  room?: HostelRoom;
  current_allocation?: {
    id: string;
    student: {
      id: string;
      first_name: string;
      last_name: string;
      admission_number: string;
    };
  };
}

export function useHostels() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['hostels', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];

      const { data: hostels, error } = await supabase
        .from('hostels')
        .select(`
          *,
          warden:staff!hostels_warden_staff_id_fkey(id, first_name, last_name)
        `)
        .eq('institution_id', institution.id)
        .order('name');

      if (error) throw error;

      // Get room and occupancy counts for each hostel
      const hostelsWithCounts = await Promise.all(
        (hostels || []).map(async (hostel) => {
          const { count: roomCount } = await supabase
            .from('hostel_rooms')
            .select('*', { count: 'exact', head: true })
            .eq('hostel_id', hostel.id)
            .eq('is_active', true);

          const { count: occupiedCount } = await supabase
            .from('hostel_beds')
            .select('*', { count: 'exact', head: true })
            .eq('institution_id', institution.id)
            .eq('status', 'occupied')
            .in('room_id', (
              await supabase
                .from('hostel_rooms')
                .select('id')
                .eq('hostel_id', hostel.id)
            ).data?.map(r => r.id) || []);

          return {
            ...hostel,
            _count: {
              rooms: roomCount || 0,
              occupied_beds: occupiedCount || 0,
            },
          };
        })
      );

      return hostelsWithCounts as Hostel[];
    },
    enabled: !!institution?.id,
  });
}

export function useHostel(hostelId: string | undefined) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['hostel', hostelId],
    queryFn: async () => {
      if (!hostelId) return null;

      const { data, error } = await supabase
        .from('hostels')
        .select(`
          *,
          warden:staff!hostels_warden_staff_id_fkey(id, first_name, last_name)
        `)
        .eq('id', hostelId)
        .single();

      if (error) throw error;
      return data as Hostel;
    },
    enabled: !!hostelId && !!institution?.id,
  });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      gender: 'male' | 'female' | 'mixed';
      description?: string;
      location?: string;
      warden_staff_id?: string;
    }) => {
      if (!institution?.id) throw new Error('No institution selected');

      const { data: hostel, error } = await supabase
        .from('hostels')
        .insert({
          institution_id: institution.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return hostel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Hostel created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create hostel');
    },
  });
}

export function useUpdateHostel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      code?: string;
      gender?: 'male' | 'female' | 'mixed';
      description?: string;
      location?: string;
      warden_staff_id?: string | null;
      is_active?: boolean;
    }) => {
      const { data: hostel, error } = await supabase
        .from('hostels')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return hostel;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      queryClient.invalidateQueries({ queryKey: ['hostel', variables.id] });
      toast.success('Hostel updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update hostel');
    },
  });
}

export function useDeleteHostel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Hostel deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete hostel');
    },
  });
}

// Room hooks
export function useRooms(hostelId: string | undefined) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['hostel-rooms', hostelId],
    queryFn: async () => {
      if (!hostelId || !institution?.id) return [];

      const { data: rooms, error } = await supabase
        .from('hostel_rooms')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('room_number');

      if (error) throw error;

      // Get occupancy for each room
      const roomsWithOccupancy = await Promise.all(
        (rooms || []).map(async (room) => {
          const { count } = await supabase
            .from('hostel_beds')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('status', 'occupied');

          return {
            ...room,
            _count: { occupied_beds: count || 0 },
          };
        })
      );

      return roomsWithOccupancy as HostelRoom[];
    },
    enabled: !!hostelId && !!institution?.id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();

  return useMutation({
    mutationFn: async (data: {
      hostel_id: string;
      room_number: string;
      floor?: string;
      room_type?: 'standard' | 'prefect' | 'sick_bay' | 'special';
      bed_capacity: number;
      amenities?: string[];
    }) => {
      if (!institution?.id) throw new Error('No institution selected');

      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('hostel_rooms')
        .insert({
          institution_id: institution.id,
          ...data,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Auto-create beds based on capacity
      const beds = Array.from({ length: data.bed_capacity }, (_, i) => ({
        room_id: room.id,
        institution_id: institution.id,
        bed_number: String.fromCharCode(65 + i), // A, B, C, D...
        bed_type: 'standard' as const,
        status: 'available' as const,
      }));

      const { error: bedsError } = await supabase
        .from('hostel_beds')
        .insert(beds);

      if (bedsError) throw bedsError;

      return room;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms', variables.hostel_id] });
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Room created with beds');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create room');
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      room_number?: string;
      floor?: string;
      room_type?: 'standard' | 'prefect' | 'sick_bay' | 'special';
      amenities?: string[];
      is_active?: boolean;
    }) => {
      const { data: room, error } = await supabase
        .from('hostel_rooms')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return room;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms', data.hostel_id] });
      toast.success('Room updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update room');
    },
  });
}

// Bed hooks
export function useBeds(roomId: string | undefined) {
  return useQuery({
    queryKey: ['hostel-beds', roomId],
    queryFn: async () => {
      if (!roomId) return [];

      const { data, error } = await supabase
        .from('hostel_beds')
        .select('*')
        .eq('room_id', roomId)
        .order('bed_number');

      if (error) throw error;
      return data as HostelBed[];
    },
    enabled: !!roomId,
  });
}

export function useAvailableBeds(hostelId?: string) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['available-beds', institution?.id, hostelId],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('hostel_beds')
        .select(`
          *,
          room:hostel_rooms!inner(
            id,
            room_number,
            floor,
            room_type,
            hostel:hostels!inner(id, name, code, gender)
          )
        `)
        .eq('institution_id', institution.id)
        .eq('status', 'available');

      if (hostelId) {
        query = query.eq('room.hostel_id', hostelId);
      }

      const { data, error } = await query.order('bed_number');

      if (error) throw error;
      return data as (HostelBed & { room: HostelRoom & { hostel: Hostel } })[];
    },
    enabled: !!institution?.id,
  });
}

export function useUpdateBedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: 'available' | 'occupied' | 'maintenance' | 'reserved';
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('hostel_beds')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hostel-beds', data.room_id] });
      queryClient.invalidateQueries({ queryKey: ['available-beds'] });
      toast.success('Bed status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update bed status');
    },
  });
}

export function useBoardingStats() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['boarding-stats', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;

      // Get total capacity
      const { data: hostels } = await supabase
        .from('hostels')
        .select('capacity')
        .eq('institution_id', institution.id)
        .eq('is_active', true);

      const totalCapacity = hostels?.reduce((sum, h) => sum + h.capacity, 0) || 0;

      // Get occupied beds
      const { count: occupiedBeds } = await supabase
        .from('hostel_beds')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('status', 'occupied');

      // Get active allocations
      const { count: activeAllocations } = await supabase
        .from('bed_allocations')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('status', 'active');

      // Get hostel count
      const { count: hostelCount } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('is_active', true);

      // Get pending charges
      const { data: pendingCharges } = await supabase
        .from('boarding_charges')
        .select('amount')
        .eq('institution_id', institution.id)
        .eq('status', 'pending');

      const pendingChargesTotal = pendingCharges?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      return {
        totalCapacity,
        occupiedBeds: occupiedBeds || 0,
        availableBeds: totalCapacity - (occupiedBeds || 0),
        occupancyRate: totalCapacity > 0 ? Math.round(((occupiedBeds || 0) / totalCapacity) * 100) : 0,
        activeAllocations: activeAllocations || 0,
        hostelCount: hostelCount || 0,
        pendingChargesTotal,
      };
    },
    enabled: !!institution?.id,
  });
}
