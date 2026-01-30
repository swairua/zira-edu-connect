import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface BoardingCharge {
  id: string;
  institution_id: string;
  allocation_id: string | null;
  student_id: string;
  charge_type: 'deposit' | 'penalty' | 'damage' | 'extra_fee' | 'refund';
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'invoiced' | 'paid' | 'waived' | 'refunded';
  invoice_id: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
  allocation?: {
    id: string;
    bed?: {
      bed_number: string;
      room?: {
        room_number: string;
        hostel?: {
          name: string;
        };
      };
    };
  };
}

interface ChargeFilters {
  status?: string;
  chargeType?: string;
  studentId?: string;
  searchQuery?: string;
}

export function useBoardingCharges(filters: ChargeFilters = {}) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['boarding-charges', institution?.id, filters],
    queryFn: async () => {
      if (!institution?.id) return [];

      let query = supabase
        .from('boarding_charges')
        .select(`
          *,
          student:students(id, first_name, last_name, admission_number),
          allocation:bed_allocations(
            id,
            bed:hostel_beds(
              bed_number,
              room:hostel_rooms(
                room_number,
                hostel:hostels(name)
              )
            )
          )
        `)
        .eq('institution_id', institution.id)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.chargeType && filters.chargeType !== 'all') {
        query = query.eq('charge_type', filters.chargeType);
      }

      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      let result = data as BoardingCharge[];

      if (filters.searchQuery) {
        const search = filters.searchQuery.toLowerCase();
        result = result.filter(c => 
          c.student?.first_name?.toLowerCase().includes(search) ||
          c.student?.last_name?.toLowerCase().includes(search) ||
          c.student?.admission_number?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
        );
      }

      return result;
    },
    enabled: !!institution?.id,
  });
}

export function useStudentCharges(studentId: string | undefined) {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['student-charges', studentId],
    queryFn: async () => {
      if (!studentId || !institution?.id) return [];

      const { data, error } = await supabase
        .from('boarding_charges')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BoardingCharge[];
    },
    enabled: !!studentId && !!institution?.id,
  });
}

export function useCreateCharge() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      student_id: string;
      allocation_id?: string;
      charge_type: 'deposit' | 'penalty' | 'damage' | 'extra_fee' | 'refund';
      description: string;
      amount: number;
      notes?: string;
    }) => {
      if (!institution?.id) throw new Error('No institution selected');
      if (!user?.id) throw new Error('User not authenticated');

      const { data: charge, error } = await supabase
        .from('boarding_charges')
        .insert({
          institution_id: institution.id,
          created_by: user.id,
          currency: 'KES',
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return charge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-charges'] });
      queryClient.invalidateQueries({ queryKey: ['student-charges'] });
      queryClient.invalidateQueries({ queryKey: ['boarding-stats'] });
      toast.success('Charge created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create charge');
    },
  });
}

export function useApproveCharge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (chargeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('boarding_charges')
        .update({
          status: 'invoiced',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', chargeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-charges'] });
      queryClient.invalidateQueries({ queryKey: ['student-charges'] });
      toast.success('Charge approved and invoiced');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve charge');
    },
  });
}

export function useWaiveCharge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      chargeId,
      notes,
    }: {
      chargeId: string;
      notes: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('boarding_charges')
        .update({
          status: 'waived',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chargeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-charges'] });
      queryClient.invalidateQueries({ queryKey: ['student-charges'] });
      queryClient.invalidateQueries({ queryKey: ['boarding-stats'] });
      toast.success('Charge waived successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to waive charge');
    },
  });
}

export function useRefundDeposit() {
  const queryClient = useQueryClient();
  const { institution } = useInstitution();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      studentId,
      allocationId,
      amount,
      notes,
    }: {
      studentId: string;
      allocationId?: string;
      amount: number;
      notes: string;
    }) => {
      if (!institution?.id) throw new Error('No institution selected');
      if (!user?.id) throw new Error('User not authenticated');

      // Create refund charge
      const { data: charge, error } = await supabase
        .from('boarding_charges')
        .insert({
          institution_id: institution.id,
          student_id: studentId,
          allocation_id: allocationId,
          charge_type: 'refund',
          description: 'Deposit Refund',
          amount: -amount, // Negative for refunds
          currency: 'KES',
          status: 'refunded',
          created_by: user.id,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      return charge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boarding-charges'] });
      queryClient.invalidateQueries({ queryKey: ['student-charges'] });
      toast.success('Deposit refund processed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund');
    },
  });
}

export function useChargeStats() {
  const { institution } = useInstitution();

  return useQuery({
    queryKey: ['charge-stats', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;

      const { data: charges } = await supabase
        .from('boarding_charges')
        .select('charge_type, status, amount')
        .eq('institution_id', institution.id);

      const stats = {
        pendingTotal: 0,
        pendingCount: 0,
        invoicedTotal: 0,
        paidTotal: 0,
        waivedTotal: 0,
        depositTotal: 0,
        penaltyTotal: 0,
        damageTotal: 0,
      };

      charges?.forEach(charge => {
        const amount = Number(charge.amount);
        
        if (charge.status === 'pending') {
          stats.pendingTotal += amount;
          stats.pendingCount++;
        } else if (charge.status === 'invoiced') {
          stats.invoicedTotal += amount;
        } else if (charge.status === 'paid') {
          stats.paidTotal += amount;
        } else if (charge.status === 'waived') {
          stats.waivedTotal += amount;
        }

        if (charge.charge_type === 'deposit' && charge.status !== 'refunded') {
          stats.depositTotal += amount;
        } else if (charge.charge_type === 'penalty') {
          stats.penaltyTotal += amount;
        } else if (charge.charge_type === 'damage') {
          stats.damageTotal += amount;
        }
      });

      return stats;
    },
    enabled: !!institution?.id,
  });
}
