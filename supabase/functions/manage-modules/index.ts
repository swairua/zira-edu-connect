import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManageModuleRequest {
  institution_id: string;
  module_id: string;
  action: "activate" | "deactivate";
  reason?: string;
  activation_type?: "plan_included" | "manual" | "addon" | "trial";
  expires_at?: string;
}

// Module dependencies map
const MODULE_DEPENDENCIES: Record<string, string[]> = {
  library: ["academics"],
  transport: ["finance"],
  hostel: ["finance"],
  activities: ["academics"],
  uniforms: ["finance"],
  timetable: ["academics"],
};

// Reverse dependencies - modules that depend on a given module
const DEPENDENT_MODULES: Record<string, string[]> = {
  academics: ["library", "activities", "timetable"],
  finance: ["transport", "hostel", "uniforms"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is a super admin
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "support_admin"]);

    if (rolesError || !roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions. Only Super Admins can manage modules." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ManageModuleRequest = await req.json();
    const { institution_id, module_id, action, reason, activation_type = "manual", expires_at } = body;

    // Validate required fields
    if (!institution_id || !module_id || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: institution_id, module_id, action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify institution exists
    const { data: institution, error: instError } = await supabase
      .from("institutions")
      .select("id, name, enabled_modules")
      .eq("id", institution_id)
      .single();

    if (instError || !institution) {
      return new Response(
        JSON.stringify({ error: "Institution not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get module pricing info
    const { data: moduleInfo } = await supabase
      .from("module_pricing")
      .select("*")
      .eq("module_id", module_id)
      .single();

    // Get current module config
    const { data: currentConfig } = await supabase
      .from("institution_module_config")
      .select("*")
      .eq("institution_id", institution_id)
      .eq("module_id", module_id)
      .single();

    const previousStatus = currentConfig?.is_enabled ?? false;

    if (action === "activate") {
      // Check dependencies
      const dependencies = MODULE_DEPENDENCIES[module_id] || [];
      if (dependencies.length > 0) {
        const { data: enabledModules } = await supabase
          .from("institution_module_config")
          .select("module_id")
          .eq("institution_id", institution_id)
          .eq("is_enabled", true);

        const enabledModuleIds = enabledModules?.map(m => m.module_id) || [];
        const missingDeps = dependencies.filter(dep => !enabledModuleIds.includes(dep));

        if (missingDeps.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: `Cannot activate ${module_id}. Missing required modules: ${missingDeps.join(", ")}`,
              missing_dependencies: missingDeps
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Upsert module config
      const { error: upsertError } = await supabase
        .from("institution_module_config")
        .upsert({
          institution_id,
          module_id,
          is_enabled: true,
          activation_type,
          activated_at: new Date().toISOString(),
          activated_by: user.id,
          expires_at: expires_at || null,
        }, {
          onConflict: "institution_id,module_id"
        });

      if (upsertError) {
        throw upsertError;
      }

    } else if (action === "deactivate") {
      // Check if other modules depend on this one
      const dependents = DEPENDENT_MODULES[module_id] || [];
      if (dependents.length > 0) {
        const { data: enabledModules } = await supabase
          .from("institution_module_config")
          .select("module_id")
          .eq("institution_id", institution_id)
          .eq("is_enabled", true)
          .in("module_id", dependents);

        if (enabledModules && enabledModules.length > 0) {
          const activeDependent = enabledModules.map(m => m.module_id);
          return new Response(
            JSON.stringify({ 
              error: `Cannot deactivate ${module_id}. These modules depend on it: ${activeDependent.join(", ")}`,
              dependent_modules: activeDependent
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Update module config
      const { error: updateError } = await supabase
        .from("institution_module_config")
        .update({
          is_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("institution_id", institution_id)
        .eq("module_id", module_id);

      if (updateError) {
        throw updateError;
      }
    }

    // Log to activation history
    await supabase.from("module_activation_history").insert({
      institution_id,
      module_id,
      action: action === "activate" ? "activated" : "deactivated",
      previous_status: previousStatus,
      new_status: action === "activate",
      reason,
      activated_by: user.id,
      billing_tier: moduleInfo?.tier || "addon",
      monthly_price: moduleInfo?.base_monthly_price || 0,
    });

    // Log to audit_logs
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: action === "activate" ? "module_activated" : "module_deactivated",
      entity_type: "module",
      entity_id: module_id,
      institution_id,
      metadata: {
        module_id,
        previous_status: previousStatus,
        new_status: action === "activate",
        reason,
        activation_type,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Module ${module_id} ${action}d successfully`,
        module_id,
        is_enabled: action === "activate",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error managing module:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
