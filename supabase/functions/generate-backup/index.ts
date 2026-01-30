import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupRequest {
  institution_id: string;
  include_modules: string[];
  backup_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { institution_id, include_modules, backup_id }: BackupRequest = await req.json();

    // Verify user has access to this institution
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("institution_id", institution_id)
      .single();

    if (roleError || !userRole) {
      return new Response(JSON.stringify({ error: "No access to this institution" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedRoles = ["institution_owner", "institution_admin", "ict_admin", "super_admin"];
    if (!allowedRoles.includes(userRole.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or update backup record
    let backupRecord;
    if (backup_id) {
      const { data, error } = await supabase
        .from("backup_history")
        .update({ status: "processing", started_at: new Date().toISOString() })
        .eq("id", backup_id)
        .select()
        .single();
      if (error) throw error;
      backupRecord = data;
    } else {
      const { data, error } = await supabase
        .from("backup_history")
        .insert({
          institution_id,
          include_modules,
          status: "processing",
          created_by: user.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      backupRecord = data;
    }

    // Collect data based on modules
    const backupData: Record<string, unknown[]> = {};
    const modulesToInclude = include_modules.includes("all") 
      ? ["students", "staff", "classes", "subjects", "attendance", "finance", "grades", "parents"]
      : include_modules;

    for (const module of modulesToInclude) {
      try {
        switch (module) {
          case "students": {
            const { data } = await supabase
              .from("students")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.students = data || [];
            break;
          }
          case "staff": {
            const { data } = await supabase
              .from("staff")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.staff = data || [];
            break;
          }
          case "classes": {
            const { data } = await supabase
              .from("classes")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.classes = data || [];
            break;
          }
          case "subjects": {
            const { data } = await supabase
              .from("subjects")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.subjects = data || [];
            break;
          }
          case "attendance": {
            const { data } = await supabase
              .from("attendance")
              .select("*")
              .eq("institution_id", institution_id)
              .order("date", { ascending: false })
              .limit(10000);
            backupData.attendance = data || [];
            break;
          }
          case "finance": {
            const { data: invoices } = await supabase
              .from("student_invoices")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.invoices = invoices || [];

            const { data: payments } = await supabase
              .from("student_payments")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.payments = payments || [];

            const { data: feeItems } = await supabase
              .from("fee_items")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.fee_items = feeItems || [];
            break;
          }
          case "grades": {
            const { data } = await supabase
              .from("exam_results")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.exam_results = data || [];
            break;
          }
          case "parents": {
            const { data } = await supabase
              .from("parents")
              .select("*")
              .eq("institution_id", institution_id);
            backupData.parents = data || [];
            break;
          }
        }
      } catch (moduleError) {
        console.error(`Error fetching ${module}:`, moduleError);
      }
    }

    // Create JSON backup content
    const backupContent = JSON.stringify({
      metadata: {
        institution_id,
        created_at: new Date().toISOString(),
        modules: modulesToInclude,
        version: "1.0",
      },
      data: backupData,
    }, null, 2);

    const fileName = `backup-${new Date().toISOString().split("T")[0]}-${Date.now()}.json`;
    const filePath = `${institution_id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("institution-backups")
      .upload(filePath, backupContent, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      await supabase
        .from("backup_history")
        .update({ 
          status: "failed", 
          error_message: uploadError.message,
          completed_at: new Date().toISOString() 
        })
        .eq("id", backupRecord.id);
      throw uploadError;
    }

    // Generate signed URL (valid for 24 hours)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("institution-backups")
      .createSignedUrl(filePath, 86400); // 24 hours

    if (signedUrlError) throw signedUrlError;

    // Calculate file size
    const fileSizeBytes = new TextEncoder().encode(backupContent).length;

    // Update backup record with success
    const { data: updatedBackup, error: updateError } = await supabase
      .from("backup_history")
      .update({
        status: "completed",
        file_name: fileName,
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        download_url: signedUrlData.signedUrl,
        download_expires_at: new Date(Date.now() + 86400000).toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupRecord.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log to audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: "create",
      entity_type: "backup",
      entity_id: backupRecord.id,
      institution_id,
      metadata: {
        modules: modulesToInclude,
        file_size_bytes: fileSizeBytes,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        backup: updatedBackup,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Backup generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate backup";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});