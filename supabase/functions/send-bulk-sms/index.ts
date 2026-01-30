import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkSmsRequest {
  institutionId: string;
  message: string;
  messageType: string;
  audienceType: 'all_parents' | 'all_staff' | 'class_parents' | 'defaulters' | 'selected';
  classId?: string;
  phoneNumbers?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BulkSmsRequest = await req.json();
    const { institutionId, message, messageType, audienceType, classId, phoneNumbers } = body;

    if (!institutionId || !message || !audienceType) {
      return new Response(
        JSON.stringify({ success: false, error: "institutionId, message, and audienceType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let phones: string[] = [];

    if (audienceType === 'selected' && phoneNumbers) {
      phones = phoneNumbers;
    } else if (audienceType === 'all_parents') {
      // Get all parents' phone numbers for the institution
      const { data: parents } = await supabase
        .from("parents")
        .select("phone")
        .eq("institution_id", institutionId);

      phones = parents?.map(p => p.phone).filter(Boolean) || [];
    } else if (audienceType === 'all_staff') {
      // Get all active staff phone numbers for the institution
      const { data: staffMembers } = await supabase
        .from("staff")
        .select("phone")
        .eq("institution_id", institutionId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .not("phone", "is", null);

      phones = staffMembers?.map(s => s.phone).filter(Boolean) || [];
    } else if (audienceType === 'class_parents' && classId) {
      // Get parents of students in a specific class
      const { data: studentParents } = await supabase
        .from("student_parents")
        .select(`
          parent:parents(phone),
          student:students!inner(class_id)
        `)
        .eq("institution_id", institutionId)
        .eq("student.class_id", classId);

      phones = studentParents?.map(sp => {
        const parent = sp.parent as unknown as { phone: string } | null;
        return parent?.phone;
      }).filter(Boolean) as string[] || [];
    } else if (audienceType === 'defaulters') {
      // Get parents of students with outstanding balances
      const { data: feeAccounts } = await supabase
        .from("student_fee_accounts")
        .select("student_id")
        .eq("institution_id", institutionId)
        .gt("balance", 0);

      if (feeAccounts && feeAccounts.length > 0) {
        const studentIds = feeAccounts.map(fa => fa.student_id);
        
        const { data: studentParents } = await supabase
          .from("student_parents")
          .select("parent:parents(phone)")
          .eq("institution_id", institutionId)
          .in("student_id", studentIds);

        phones = studentParents?.map(sp => {
          const parent = sp.parent as unknown as { phone: string } | null;
          return parent?.phone;
        }).filter(Boolean) as string[] || [];
      }
    }

    if (phones.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipients found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Remove duplicates
    const uniquePhones = [...new Set(phones)];

    console.log(`Sending bulk SMS to ${uniquePhones.length} recipients`);

    // Call the send-sms function with promotional type for bulk messages
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: {
        phones: uniquePhones,
        message,
        messageType,
        smsType: 'promotional', // Bulk messages use promotional sender
        institutionId,
        recipientType: "parent"
      }
    });

    if (error) {
      console.error("Error calling send-sms:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send SMS" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_recipients: uniquePhones.length,
        ...data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-bulk-sms:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
