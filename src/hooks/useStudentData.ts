import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from '@/contexts/StudentContext';

// Helper to check if using OTP session
function getSessionToken() {
  return localStorage.getItem('student_session_token');
}

// Helper to fetch from student-data-api edge function
async function fetchStudentData(type: string, params: Record<string, any> = {}) {
  const token = getSessionToken();
  if (!token) return null;

  const { data, error } = await supabase.functions.invoke('student-data-api', {
    headers: { Authorization: `Bearer ${token}` },
    body: { type, params },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.data;
}

// Fetch student's assignments with submission status
export function useStudentAssignments() {
  const { studentProfile } = useStudent();
  const token = getSessionToken();

  return useQuery({
    queryKey: ['student-assignments', studentProfile?.id, studentProfile?.class_id, !!token],
    queryFn: async () => {
      // If OTP authenticated, use edge function
      if (token) {
        return await fetchStudentData('assignments');
      }

      // Otherwise use direct query (Supabase Auth user)
      if (!studentProfile?.class_id) return [];

      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          submission_type,
          allow_late_submission,
          allow_resubmission,
          allowed_file_types,
          max_file_size_mb,
          classes:class_id (
            id,
            name,
            level
          ),
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .eq('class_id', studentProfile.class_id)
        .eq('status', 'published')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching student assignments:', error);
        return [];
      }

      // Fetch submissions for this student
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentProfile.id);

      // Merge assignments with submissions
      return (assignments || []).map(assignment => {
        const submission = submissions?.find(s => s.assignment_id === assignment.id);
        return {
          ...assignment,
          class: assignment.classes,
          subject: assignment.subjects,
          submission: submission ? {
            id: submission.id,
            status: submission.status,
            submitted_by_type: submission.submitted_by_type,
            is_late: submission.is_late,
            file_name: submission.file_name,
            submitted_at: submission.submitted_at,
          } : null,
        };
      });
    },
    enabled: !!studentProfile?.class_id || !!token,
  });
}

// Fetch student's exam scores
export function useStudentResults() {
  const { studentProfile } = useStudent();
  const token = getSessionToken();

  return useQuery({
    queryKey: ['student-results', studentProfile?.id, !!token],
    queryFn: async () => {
      if (token) {
        return await fetchStudentData('results');
      }

      if (!studentProfile) return [];

      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          id,
          marks,
          grade,
          remarks,
          exams:exam_id (
            id,
            name,
            exam_type,
            max_marks,
            terms:term_id (
              id,
              name
            ),
            academic_years:academic_year_id (
              id,
              name
            )
          ),
          subjects:subject_id (
            id,
            name,
            code
          )
        `)
        .eq('student_id', studentProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching student results:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!studentProfile?.id || !!token,
  });
}

// Fetch student's fee balance
export function useStudentFees() {
  const { studentProfile } = useStudent();
  const token = getSessionToken();

  return useQuery({
    queryKey: ['student-fees', studentProfile?.id, !!token],
    queryFn: async () => {
      if (token) {
        return await fetchStudentData('fees');
      }

      if (!studentProfile) return { invoices: [], payments: [], totalInvoiced: 0, totalPaid: 0, balance: 0 };

      // Fetch invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('student_invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          due_date,
          status,
          currency,
          terms:term_id (
            id,
            name
          ),
          academic_years:academic_year_id (
            id,
            name
          )
        `)
        .eq('student_id', studentProfile.id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error fetching student invoices:', invoicesError);
      }

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('student_payments')
        .select('*')
        .eq('student_id', studentProfile.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching student payments:', paymentsError);
      }

      const totalInvoiced = (invoices || [])
        .filter(inv => inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const totalPaid = (payments || [])
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        invoices: invoices || [],
        payments: payments || [],
        totalInvoiced,
        totalPaid,
        balance: totalInvoiced - totalPaid,
      };
    },
    enabled: !!studentProfile?.id || !!token,
  });
}

// Fetch student's attendance
export function useStudentAttendance(startDate?: string, endDate?: string) {
  const { studentProfile } = useStudent();
  const token = getSessionToken();

  return useQuery({
    queryKey: ['student-attendance', studentProfile?.id, startDate, endDate, !!token],
    queryFn: async () => {
      if (token) {
        return await fetchStudentData('attendance', { startDate, endDate });
      }

      if (!studentProfile) return [];

      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentProfile.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching student attendance:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!studentProfile?.id || !!token,
  });
}
