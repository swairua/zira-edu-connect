import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PenaltyRule {
  id: string;
  institution_id: string;
  name: string;
  penalty_type: string; // 'fixed' or 'percentage'
  penalty_amount: number;
  grace_period_days: number | null;
  apply_per: string | null; // 'day', 'week', 'month', 'once'
  is_compounding: boolean | null;
  max_penalty: number | null;
  fee_item_id: string | null;
  is_active: boolean | null;
  auto_apply: boolean | null;
}

interface OverdueInvoice {
  id: string;
  invoice_number: string;
  student_id: string;
  institution_id: string;
  total_amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  students: {
    first_name: string;
    last_name: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("apply-penalties function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Get all active penalty rules with auto_apply enabled
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from("late_payment_penalties")
      .select("*")
      .eq("is_active", true)
      .eq("auto_apply", true);

    if (rulesError || !rules) {
      console.error("Failed to fetch penalty rules:", rulesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch penalty rules" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${rules.length} active penalty rules`);

    let totalApplied = 0;
    let totalSkipped = 0;

    for (const rule of rules as PenaltyRule[]) {
      // Calculate grace period cutoff date
      const graceDays = rule.grace_period_days || 0;
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - graceDays);
      const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

      // Find overdue invoices for this institution
      const { data: invoices, error: invError } = await supabaseAdmin
        .from("student_invoices")
        .select(`
          id, invoice_number, student_id, institution_id, total_amount, amount_paid, due_date, status,
          students!inner(first_name, last_name)
        `)
        .eq("institution_id", rule.institution_id)
        .lt("due_date", cutoffDateStr)
        .not("status", "in", '("paid","cancelled","draft")');

      if (invError || !invoices) {
        console.error(`Failed to fetch invoices for rule ${rule.id}:`, invError);
        continue;
      }

      console.log(`Rule "${rule.name}": Found ${invoices.length} overdue invoices`);

      for (const invoice of invoices as unknown as OverdueInvoice[]) {
        const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
        if (balance <= 0) continue;

        // Calculate days overdue (after grace period)
        const dueDate = new Date(invoice.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) - graceDays;
        
        if (daysOverdue <= 0) continue;

        // Check if penalty already applied today
        const { data: existingPenalty } = await supabaseAdmin
          .from("applied_penalties")
          .select("id")
          .eq("invoice_id", invoice.id)
          .eq("applied_date", todayStr)
          .eq("waived", false)
          .single();

        if (existingPenalty) {
          totalSkipped++;
          continue;
        }

        // For 'once' apply_per, check if any penalty was already applied
        if (rule.apply_per === "once") {
          const { data: anyPenalty } = await supabaseAdmin
            .from("applied_penalties")
            .select("id")
            .eq("invoice_id", invoice.id)
            .eq("penalty_rule_id", rule.id)
            .eq("waived", false)
            .single();

          if (anyPenalty) {
            totalSkipped++;
            continue;
          }
        }

        // Calculate penalty amount
        let penaltyAmount: number;
        if (rule.penalty_type === "percentage") {
          penaltyAmount = Math.round(balance * (rule.penalty_amount / 100));
        } else {
          penaltyAmount = rule.penalty_amount;
        }

        // Apply max penalty cap if configured
        if (rule.max_penalty && penaltyAmount > rule.max_penalty) {
          // Check total penalties already applied
          const { data: totalPenalties } = await supabaseAdmin
            .from("applied_penalties")
            .select("amount")
            .eq("invoice_id", invoice.id)
            .eq("penalty_rule_id", rule.id)
            .eq("waived", false);

          const currentTotal = totalPenalties?.reduce((sum, p) => sum + p.amount, 0) || 0;
          const remainingCap = rule.max_penalty - currentTotal;
          
          if (remainingCap <= 0) {
            totalSkipped++;
            continue;
          }
          
          penaltyAmount = Math.min(penaltyAmount, remainingCap);
        }

        // Create applied penalty record
        const { error: applyError } = await supabaseAdmin
          .from("applied_penalties")
          .insert({
            institution_id: rule.institution_id,
            invoice_id: invoice.id,
            student_id: invoice.student_id,
            penalty_rule_id: rule.id,
            amount: penaltyAmount,
            days_overdue: daysOverdue,
            applied_date: todayStr,
            applied_by: "system",
          });

        if (applyError) {
          console.error(`Failed to apply penalty for invoice ${invoice.id}:`, applyError);
          continue;
        }

        totalApplied++;

        // Update invoice total (add penalty as additional charge)
        await supabaseAdmin
          .from("student_invoices")
          .update({
            total_amount: invoice.total_amount + penaltyAmount,
          })
          .eq("id", invoice.id);

        // Create notification for parent
        const studentName = `${invoice.students.first_name} ${invoice.students.last_name}`;
        const { data: parents } = await supabaseAdmin
          .from("student_parents")
          .select("parent_id")
          .eq("student_id", invoice.student_id);

        if (parents) {
          for (const { parent_id } of parents) {
            await supabaseAdmin.from("in_app_notifications").insert({
              institution_id: rule.institution_id,
              parent_id,
              user_type: "parent",
              title: "Late Payment Penalty Applied",
              message: `A late payment penalty of KES ${penaltyAmount.toLocaleString()} has been applied to ${studentName}'s account for invoice ${invoice.invoice_number}. The account is ${daysOverdue} days overdue.`,
              type: "penalty",
              reference_type: "student_invoice",
              reference_id: invoice.id,
            });
          }
        }

        // Log to audit
        await supabaseAdmin.from("audit_logs").insert({
          action: "PENALTY_AUTO_APPLIED",
          entity_type: "applied_penalty",
          institution_id: rule.institution_id,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            student_id: invoice.student_id,
            student_name: studentName,
            penalty_rule: rule.name,
            penalty_amount: penaltyAmount,
            days_overdue: daysOverdue,
          },
        });
      }

      // Update last_applied_at on the rule
      await supabaseAdmin
        .from("late_payment_penalties")
        .update({ last_applied_at: new Date().toISOString() })
        .eq("id", rule.id);
    }

    // Log summary
    await supabaseAdmin.from("audit_logs").insert({
      action: "APPLY_PENALTIES_COMPLETED",
      entity_type: "late_payment_penalty",
      metadata: {
        date: todayStr,
        rules_processed: rules.length,
        penalties_applied: totalApplied,
        penalties_skipped: totalSkipped,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        rules_processed: rules.length,
        penalties_applied: totalApplied,
        penalties_skipped: totalSkipped,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error applying penalties:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
