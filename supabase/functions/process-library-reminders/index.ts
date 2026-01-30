import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LibraryLoan {
  id: string;
  book_id: string;
  borrower_id: string;
  borrower_type: string;
  loan_date: string;
  due_date: string;
  status: string;
  institution_id: string;
  book: {
    id: string;
    title: string;
    author: string;
  };
  institution: {
    id: string;
    name: string;
    is_demo: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-library-reminders invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    
    let totalSent = 0;
    let totalFailed = 0;

    // Books due tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: dueTomorrow, error: dueError } = await supabase
      .from("library_loans")
      .select(`
        id, book_id, borrower_id, borrower_type, loan_date, due_date, status, institution_id,
        book:library_books!inner(id, title, author),
        institution:institutions!inner(id, name, is_demo)
      `)
      .eq("due_date", tomorrowStr)
      .eq("status", "borrowed");

    if (dueError) {
      console.error("Error fetching loans:", dueError);
    }

    console.log(`Found ${dueTomorrow?.length || 0} books due tomorrow`);

    for (const loan of (dueTomorrow || []) as unknown as LibraryLoan[]) {
      // Check institution notification settings
      const { data: notifSettings } = await supabase
        .from("institution_notification_settings")
        .select("is_enabled, channels, custom_template")
        .eq("institution_id", loan.institution_id)
        .eq("category", "library_due")
        .maybeSingle();

      // Skip if notifications are explicitly disabled
      if (notifSettings?.is_enabled === false) {
        console.log(`Library due notifications disabled for ${loan.institution.name}`);
        continue;
      }

      const enabledChannels = notifSettings?.channels || ["sms", "in_app"];

      // Get borrower info based on type
      let borrowerName = "";
      let parentLinks: any[] = [];

      if (loan.borrower_type === "student") {
        const { data: student } = await supabase
          .from("students")
          .select("id, first_name, last_name")
          .eq("id", loan.borrower_id)
          .single();

        if (student) {
          borrowerName = `${student.first_name} ${student.last_name}`;
          
          const { data: links } = await supabase
            .from("student_parents")
            .select("parent:parents!inner(id, first_name, phone, email)")
            .eq("student_id", student.id);
          
          parentLinks = links || [];
        }
      }

      if (parentLinks.length === 0) continue;

      const message = `📚 ${loan.institution.name}: Library book "${loan.book.title}" by ${loan.book.author} borrowed by ${borrowerName} is due TOMORROW. Please return to avoid late fees.`;

      for (const link of parentLinks) {
        const parent = link.parent as any;
        if (!parent) continue;

        // Check preference
        const { data: pref } = await supabase
          .from("notification_preferences")
          .select("is_opted_in")
          .eq("parent_id", parent.id)
          .eq("institution_id", loan.institution_id)
          .eq("channel", "sms")
          .maybeSingle();

        if (pref && !pref.is_opted_in) continue;

        // Send SMS (respect channel settings)
        if (parent.phone && !loan.institution.is_demo && enabledChannels.includes("sms")) {
          try {
            const smsResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                phones: [parent.phone],
                message,
                messageType: "library_due",
                smsType: "transactional",
                institutionId: loan.institution_id,
                recipientType: "parent",
              }),
            });

            if (smsResponse.ok) totalSent++;
            else totalFailed++;
          } catch (err) {
            console.error("SMS error:", err);
            totalFailed++;
          }
        }

        // In-app notification (respect channel settings)
        if (enabledChannels.includes("in_app")) {
          await supabase.from("in_app_notifications").insert({
            institution_id: loan.institution_id,
            parent_id: parent.id,
            user_type: "parent",
            title: `📚 Library Book Due Tomorrow`,
            message,
            type: "alert",
            reference_type: "library_loan",
            reference_id: loan.id,
          });
        }
      }
    }

    // Overdue books
    const { data: overdue } = await supabase
      .from("library_loans")
      .select(`
        id, book_id, borrower_id, borrower_type, due_date, institution_id,
        book:library_books!inner(id, title, author),
        institution:institutions!inner(id, name, is_demo)
      `)
      .lt("due_date", todayStr)
      .eq("status", "borrowed");

    console.log(`Found ${overdue?.length || 0} overdue books`);

    // Send overdue reminders every 3 days
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const sendOverdueToday = dayOfYear % 3 === 0;

    if (sendOverdueToday && overdue) {
      for (const loan of overdue as unknown as LibraryLoan[]) {
        const daysOverdue = Math.floor((today.getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24));
        
        // Only remind if 1-30 days overdue
        if (daysOverdue < 1 || daysOverdue > 30) continue;

        let borrowerName = "";
        let parentLinks: any[] = [];

        if (loan.borrower_type === "student") {
          const { data: student } = await supabase
            .from("students")
            .select("id, first_name, last_name")
            .eq("id", loan.borrower_id)
            .single();

          if (student) {
            borrowerName = `${student.first_name}`;
            
            const { data: links } = await supabase
              .from("student_parents")
              .select("parent:parents!inner(id, phone)")
              .eq("student_id", student.id);
            
            parentLinks = links || [];
          }
        }

        // Get library settings for penalty info
        const { data: libSettings } = await supabase
          .from("library_settings")
          .select("overdue_penalty_per_day, currency")
          .eq("institution_id", loan.institution_id)
          .maybeSingle();

        const penaltyPerDay = libSettings?.overdue_penalty_per_day || 0;
        const currency = libSettings?.currency || "KES";
        const totalPenalty = penaltyPerDay * daysOverdue;

        const message = `⚠️ ${loan.institution.name}: "${loan.book.title}" borrowed by ${borrowerName} is ${daysOverdue} days OVERDUE.${totalPenalty > 0 ? ` Accumulated fine: ${currency} ${totalPenalty}.` : ""} Please return immediately.`;

        for (const link of parentLinks) {
          const parent = link.parent as any;
          if (!parent?.phone || loan.institution.is_demo) continue;

          try {
            await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                phones: [parent.phone],
                message,
                messageType: "library_overdue",
                smsType: "transactional",
                institutionId: loan.institution_id,
                recipientType: "parent",
              }),
            });
            totalSent++;
          } catch {
            totalFailed++;
          }
        }

        // Log event
        await supabase.from("communication_events").insert({
          institution_id: loan.institution_id,
          event_type: "library_overdue",
          trigger_source: "scheduled",
          reference_type: "library_loan",
          reference_id: loan.id,
          channels_used: ["sms"],
          message_content: message,
          status: "sent",
          metadata: { days_overdue: daysOverdue, penalty: totalPenalty },
          processed_at: new Date().toISOString(),
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, failed: totalFailed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
