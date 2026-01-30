import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentParent {
  id: string;
  parent_id: string;
  student_id: string;
  relationship: string;
  is_primary: boolean | null;
  emergency_contact: boolean | null;
  can_pickup: boolean | null;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
    user_id: string | null;
    relationship_type: string | null;
  };
}

export interface CreateParentInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  relationshipType: string;
  studentId: string;
  institutionId: string;
  sendInvite: boolean;
}

export function useStudentParents(studentId: string | null) {
  return useQuery({
    queryKey: ['student-parents', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_parents')
        .select(`
          id,
          parent_id,
          student_id,
          relationship,
          is_primary,
          emergency_contact,
          can_pickup,
          parent:parents(
            id,
            first_name,
            last_name,
            phone,
            email,
            user_id,
            relationship_type
          )
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      return data as unknown as StudentParent[];
    },
    enabled: !!studentId,
  });
}

export function useInstitutionParents(institutionId: string | null) {
  return useQuery({
    queryKey: ['institution-parents', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      const { data, error } = await supabase
        .from('parents')
        .select('id, first_name, last_name, phone, email, user_id')
        .eq('institution_id', institutionId)
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateParentInput) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('invite-parent', {
        body: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          email: input.email,
          relationshipType: input.relationshipType,
          studentId: input.studentId,
          institutionId: input.institutionId,
          sendInvite: input.sendInvite,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-parents', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['institution-parents', variables.institutionId] });
      toast.success(data.message || 'Parent added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add parent');
    },
  });
}

export function useUnlinkParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId, studentId }: { linkId: string; studentId: string }) => {
      const { error } = await supabase
        .from('student_parents')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      return { studentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-parents', data.studentId] });
      toast.success('Parent unlinked from student');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlink parent');
    },
  });
}

export function useSendParentInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, studentId, institutionId }: { 
      parentId: string; 
      studentId: string; 
      institutionId: string;
    }) => {
      // Get parent details
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('first_name, last_name, phone, email')
        .eq('id', parentId)
        .single();

      if (parentError || !parent) throw new Error('Parent not found');
      if (!parent.email) throw new Error('Parent email required to send invite');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('invite-parent', {
        body: {
          parentId,
          firstName: parent.first_name,
          lastName: parent.last_name,
          phone: parent.phone,
          email: parent.email,
          relationshipType: 'guardian',
          studentId,
          institutionId,
          sendInvite: true,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      return { studentId, ...response.data };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-parents', data.studentId] });
      toast.success('Portal invite sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invite');
    },
  });
}
