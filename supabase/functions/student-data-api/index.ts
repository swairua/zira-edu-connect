import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify session token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Hash the token for lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Verify session exists and is valid
    const { data: session, error: sessionError } = await supabase
      .from('student_sessions')
      .select('student_id, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('student_sessions').delete().eq('token_hash', tokenHash);
      return new Response(
        JSON.stringify({ error: 'Session expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const studentId = session.student_id;

    // Get request body
    const { type, params = {} } = await req.json();
    console.log(`Student data API request: type=${type}, studentId=${studentId}`);

    let responseData: any = null;

    switch (type) {
      case 'profile': {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id, first_name, middle_name, last_name, admission_number,
            date_of_birth, gender, status, photo_url, phone,
            class_id, institution_id,
            classes:class_id (id, name, level)
          `)
          .eq('id', studentId)
          .single();

        if (error) throw error;
        
        // classes is returned as object (single row) due to foreign key
        const classData = data.classes as unknown as { id: string; name: string; level: string } | null;
        responseData = {
          ...data,
          class_name: classData?.name,
          class_level: classData?.level,
        };
        break;
      }

      case 'assignments': {
        // Get student's class_id first
        const { data: student } = await supabase
          .from('students')
          .select('class_id')
          .eq('id', studentId)
          .single();

        if (!student?.class_id) {
          responseData = [];
          break;
        }

        const { data: assignments, error } = await supabase
          .from('assignments')
          .select(`
            id, title, description, due_date, status, submission_type,
            allow_late_submission, allow_resubmission, allowed_file_types, max_file_size_mb,
            classes:class_id (id, name, level),
            subjects:subject_id (id, name, code)
          `)
          .eq('class_id', student.class_id)
          .eq('status', 'published')
          .order('due_date', { ascending: true });

        if (error) throw error;

        // Get submissions for this student
        const { data: submissions } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('student_id', studentId);

        responseData = (assignments || []).map(a => {
          const submission = submissions?.find(s => s.assignment_id === a.id);
          return {
            ...a,
            class: a.classes,
            subject: a.subjects,
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
        break;
      }

      case 'results': {
        const { data, error } = await supabase
          .from('student_scores')
          .select(`
            id, marks, grade, remarks,
            exams:exam_id (
              id, name, exam_type, max_marks,
              terms:term_id (id, name),
              academic_years:academic_year_id (id, name)
            ),
            subjects:subject_id (id, name, code)
          `)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        responseData = data || [];
        break;
      }

      case 'fees': {
        // Get invoices
        const { data: invoices } = await supabase
          .from('student_invoices')
          .select(`
            id, invoice_number, total_amount, due_date, status, currency,
            terms:term_id (id, name),
            academic_years:academic_year_id (id, name)
          `)
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        // Get payments
        const { data: payments } = await supabase
          .from('student_payments')
          .select('*')
          .eq('student_id', studentId)
          .order('payment_date', { ascending: false });

        const totalInvoiced = (invoices || [])
          .filter(inv => inv.status !== 'cancelled')
          .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

        const totalPaid = (payments || [])
          .filter(p => p.status === 'confirmed')
          .reduce((sum, p) => sum + p.amount, 0);

        responseData = {
          invoices: invoices || [],
          payments: payments || [],
          totalInvoiced,
          totalPaid,
          balance: totalInvoiced - totalPaid,
        };
        break;
      }

      case 'attendance': {
        let query = supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId)
          .order('date', { ascending: false });

        if (params.startDate) {
          query = query.gte('date', params.startDate);
        }
        if (params.endDate) {
          query = query.lte('date', params.endDate);
        }

        const { data, error } = await query.limit(100);
        if (error) throw error;
        responseData = data || [];
        break;
      }

      case 'submit-assignment': {
        const { assignmentId, textContent, fileName, fileSizeBytes, isLate } = params;
        
        // Get student institution
        const { data: student } = await supabase
          .from('students')
          .select('institution_id')
          .eq('id', studentId)
          .single();

        if (!student) throw new Error('Student not found');

        // Check if submission exists
        const { data: existing } = await supabase
          .from('assignment_submissions')
          .select('id')
          .eq('assignment_id', assignmentId)
          .eq('student_id', studentId)
          .maybeSingle();

        const submissionData = {
          assignment_id: assignmentId,
          student_id: studentId,
          institution_id: student.institution_id,
          submission_type: fileName ? 'file' : 'text',
          text_content: textContent || null,
          file_name: fileName || null,
          file_size_bytes: fileSizeBytes || null,
          is_late: isLate,
          submitted_by_type: 'student',
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        };

        if (existing) {
          const { error } = await supabase
            .from('assignment_submissions')
            .update(submissionData)
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('assignment_submissions')
            .insert(submissionData);
          if (error) throw error;
        }

        responseData = { success: true, submittedAt: submissionData.submitted_at };
        break;
      }

      case 'timetable': {
        // Get student's class_id and institution_id
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, class_id, institution_id')
          .eq('id', studentId)
          .single();

        if (studentError || !studentData) {
          return new Response(
            JSON.stringify({ error: 'Student not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!studentData.class_id) {
          responseData = { timetable: null, timeSlots: [], entries: [] };
          break;
        }

        // Find the published timetable for this institution
        const { data: timetable } = await supabase
          .from('timetables')
          .select('id, name, status, timetable_type')
          .eq('institution_id', studentData.institution_id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!timetable) {
          responseData = { timetable: null, timeSlots: [], entries: [] };
          break;
        }

        // Fetch time slots for the institution
        const { data: fetchedTimeSlots } = await supabase
          .from('time_slots')
          .select('*')
          .eq('institution_id', studentData.institution_id)
          .eq('is_active', true)
          .order('sequence_order', { ascending: true });

        // Fetch timetable entries for the student's class
        const { data: fetchedEntries } = await supabase
          .from('timetable_entries')
          .select(`
            id,
            timetable_id,
            class_id,
            subject_id,
            teacher_id,
            room_id,
            time_slot_id,
            day_of_week,
            is_double_period,
            notes,
            subjects:subject_id(name, code),
            staff:teacher_id(first_name, last_name),
            rooms:room_id(name, capacity),
            time_slots:time_slot_id(id, name, slot_type, start_time, end_time, sequence_order)
          `)
          .eq('timetable_id', timetable.id)
          .eq('class_id', studentData.class_id);

        responseData = {
          timetable,
          timeSlots: fetchedTimeSlots || [],
          entries: fetchedEntries || [],
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid request type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Student data API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
