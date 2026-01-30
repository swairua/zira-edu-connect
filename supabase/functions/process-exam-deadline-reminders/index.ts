import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DeadlineType = 'draft' | 'correction' | 'final';
type ReminderType = '3_days' | '1_day' | 'due_today' | 'overdue';

function getDaysUntil(deadline: Date): number {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getReminderType(daysUntil: number): ReminderType | null {
  if (daysUntil === 3) return '3_days';
  if (daysUntil === 1) return '1_day';
  if (daysUntil === 0) return 'due_today';
  if (daysUntil === -1) return 'overdue';
  return null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getNotificationMessage(
  deadlineType: DeadlineType,
  reminderType: ReminderType,
  examName: string,
  subjectName: string,
  deadlineDate: string,
  daysRemaining?: number
): { title: string; message: string } {
  const phase = deadlineType === 'draft' ? 'draft scores' : 
                deadlineType === 'correction' ? 'corrections' : 'final submission';

  const templates: Record<ReminderType, { title: string; message: string }> = {
    '3_days': {
      title: `📝 ${phase.charAt(0).toUpperCase() + phase.slice(1)} Deadline Approaching`,
      message: `Reminder: Submit ${phase} for "${examName}" (${subjectName}) by ${formatDate(deadlineDate)}. ${daysRemaining} days remaining.`,
    },
    '1_day': {
      title: `⚠️ Urgent: ${phase.charAt(0).toUpperCase() + phase.slice(1)} Due Tomorrow`,
      message: `Urgent: ${phase.charAt(0).toUpperCase() + phase.slice(1)} for "${examName}" (${subjectName}) is due tomorrow!`,
    },
    'due_today': {
      title: `🚨 ${phase.charAt(0).toUpperCase() + phase.slice(1)} Due Today`,
      message: `Today is the deadline to submit ${phase} for "${examName}" (${subjectName}).`,
    },
    'overdue': {
      title: `❌ ${phase.charAt(0).toUpperCase() + phase.slice(1)} Overdue`,
      message: `Overdue: Your ${phase} for "${examName}" (${subjectName}) was due on ${formatDate(deadlineDate)}.`,
    },
  };

  return templates[reminderType];
}

function getAdminMessage(
  deadlineType: DeadlineType,
  reminderType: ReminderType,
  examName: string,
  pendingCount: number,
  deadlineDate: string
): { title: string; message: string } {
  const phase = deadlineType === 'draft' ? 'draft' : 
                deadlineType === 'correction' ? 'correction' : 'final';

  if (reminderType === 'overdue') {
    return {
      title: `⚠️ Overdue Submissions: ${examName}`,
      message: `${pendingCount} subject(s) have overdue ${phase} submissions for "${examName}". Deadline was ${formatDate(deadlineDate)}.`,
    };
  }

  return {
    title: `📊 Deadline Alert: ${examName}`,
    message: `${pendingCount} subject(s) have pending ${phase} submissions for "${examName}". Deadline: ${formatDate(deadlineDate)}.`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 4);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 2);

    // Find exams with deadlines in range (from yesterday to 3 days from now)
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select(`
        id,
        name,
        institution_id,
        draft_deadline,
        correction_deadline,
        final_deadline
      `)
      .eq('status', 'published')
      .or(`draft_deadline.gte.${oneDayAgo.toISOString()},correction_deadline.gte.${oneDayAgo.toISOString()},final_deadline.gte.${oneDayAgo.toISOString()}`)
      .or(`draft_deadline.lte.${threeDaysFromNow.toISOString()},correction_deadline.lte.${threeDaysFromNow.toISOString()},final_deadline.lte.${threeDaysFromNow.toISOString()}`);

    if (examsError) {
      console.error('Error fetching exams:', examsError);
      throw examsError;
    }

    console.log(`Found ${exams?.length || 0} exams with upcoming deadlines`);

    const stats = {
      examsProcessed: 0,
      teacherNotificationsSent: 0,
      adminNotificationsSent: 0,
      errors: [] as string[],
    };

    for (const exam of (exams || [])) {
      stats.examsProcessed++;

      const deadlines: { type: DeadlineType; date: string | null }[] = [
        { type: 'draft', date: exam.draft_deadline },
        { type: 'correction', date: exam.correction_deadline },
        { type: 'final', date: exam.final_deadline },
      ];

      for (const deadline of deadlines) {
        if (!deadline.date) continue;

        const daysUntil = getDaysUntil(new Date(deadline.date));
        const reminderType = getReminderType(daysUntil);

        if (!reminderType) continue;

        console.log(`Exam ${exam.name}: ${deadline.type} deadline in ${daysUntil} days, reminder type: ${reminderType}`);

        // Get all subjects for this institution
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('institution_id', exam.institution_id)
          .eq('is_active', true);

        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
          stats.errors.push(`Failed to fetch subjects for exam ${exam.id}`);
          continue;
        }

        // Get all teachers (staff with role teacher)
        const { data: teachers, error: teachersError } = await supabase
          .from('staff')
          .select('id, first_name, last_name, email, phone, user_id')
          .eq('institution_id', exam.institution_id)
          .eq('is_active', true)
          .not('user_id', 'is', null);

        if (teachersError) {
          console.error('Error fetching teachers:', teachersError);
          continue;
        }

        const pendingSubjects: { subjectId: string; subjectName: string }[] = [];

        // Check each subject for missing scores
        for (const subject of (subjects || [])) {
          const { count: scoreCount } = await supabase
            .from('student_scores')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id)
            .eq('subject_id', subject.id);

          if (scoreCount === 0) {
            pendingSubjects.push({ subjectId: subject.id, subjectName: subject.name });
          }
        }

        console.log(`Found ${pendingSubjects.length} subjects with pending submissions`);

        // Send notifications to all teachers about pending subjects
        for (const teacher of (teachers || [])) {
          if (!teacher.user_id) continue;

          for (const pendingSubject of pendingSubjects) {
            // Check if reminder already sent
            const { data: existingReminder } = await supabase
              .from('exam_deadline_reminders')
              .select('id')
              .eq('exam_id', exam.id)
              .eq('staff_id', teacher.id)
              .eq('deadline_type', deadline.type)
              .eq('reminder_type', reminderType)
              .maybeSingle();

            if (existingReminder) {
              continue;
            }

            const { title, message } = getNotificationMessage(
              deadline.type,
              reminderType,
              exam.name,
              pendingSubject.subjectName,
              deadline.date,
              daysUntil
            );

            // Create in-app notification
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                institution_id: exam.institution_id,
                user_id: teacher.user_id,
                title,
                message,
                type: 'assignment',
                reference_type: 'exam',
                reference_id: exam.id,
                user_type: 'staff',
              });

            if (!notifError) {
              stats.teacherNotificationsSent++;

              // Log the reminder
              await supabase.from('exam_deadline_reminders').insert({
                institution_id: exam.institution_id,
                exam_id: exam.id,
                staff_id: teacher.id,
                deadline_type: deadline.type,
                reminder_type: reminderType,
                channel: 'in_app',
              });
            }

            // Send SMS if phone available and urgent
            if (teacher.phone && (reminderType === '1_day' || reminderType === 'due_today' || reminderType === 'overdue')) {
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                  },
                  body: JSON.stringify({
                    recipients: [teacher.phone],
                    message: message,
                    institutionId: exam.institution_id,
                    smsType: 'transactional',
                  }),
                });

                await supabase.from('exam_deadline_reminders').insert({
                  institution_id: exam.institution_id,
                  exam_id: exam.id,
                  staff_id: teacher.id,
                  deadline_type: deadline.type,
                  reminder_type: reminderType,
                  channel: 'sms',
                });
              } catch (smsError) {
                console.error('SMS send error:', smsError);
              }
            }

            // Only send one notification per teacher per deadline type
            break;
          }
        }

        // Send admin notification if there are pending submissions
        if (pendingSubjects.length > 0 && (reminderType === '1_day' || reminderType === 'due_today' || reminderType === 'overdue')) {
          // Get admin users for this institution
          const { data: admins } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('institution_id', exam.institution_id)
            .in('role', ['institution_admin', 'institution_owner', 'academic_director']);

          const { title, message } = getAdminMessage(
            deadline.type,
            reminderType,
            exam.name,
            pendingSubjects.length,
            deadline.date
          );

          for (const admin of (admins || [])) {
            // Check if admin reminder already sent
            const { data: existingAdminReminder } = await supabase
              .from('exam_deadline_reminders')
              .select('id')
              .eq('exam_id', exam.id)
              .is('staff_id', null)
              .eq('deadline_type', deadline.type)
              .eq('reminder_type', reminderType)
              .maybeSingle();

            if (!existingAdminReminder) {
              const { error: adminNotifError } = await supabase
                .from('notifications')
                .insert({
                  institution_id: exam.institution_id,
                  user_id: admin.user_id,
                  title,
                  message,
                  type: 'system',
                  reference_type: 'exam',
                  reference_id: exam.id,
                  user_type: 'staff',
                });

              if (!adminNotifError) {
                stats.adminNotificationsSent++;

                await supabase.from('exam_deadline_reminders').insert({
                  institution_id: exam.institution_id,
                  exam_id: exam.id,
                  staff_id: null,
                  deadline_type: deadline.type,
                  reminder_type: reminderType,
                  channel: 'in_app',
                });
              }
            }
          }
        }
      }
    }

    // Log audit entry
    await supabase.from('audit_logs').insert({
      action: 'process_exam_deadline_reminders',
      entity_type: 'system',
      metadata: stats,
    });

    console.log('Processing complete:', stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing exam deadline reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
