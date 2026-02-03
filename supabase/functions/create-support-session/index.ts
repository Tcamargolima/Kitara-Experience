import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// WhatsApp support number (update this with actual number)
const SUPPORT_PHONE = "5511999999999";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("[create-support-session] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-support-session] Creating session for user:", user.id);

    // Generate unique session ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const sessionId = `KITARA-${timestamp}-${random}`.toUpperCase();

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Use service role to insert session (bypasses RLS)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Insert support session
    const { error: insertError } = await adminClient
      .from("support_sessions")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[create-support-session] Insert error:", insertError);
      throw insertError;
    }

    // Log security event
    await adminClient.from("security_events").insert({
      user_id: user.id,
      event_type: "support_session_created",
      success: true,
      metadata: { session_id: sessionId },
    });

    // Build WhatsApp message
    const message = encodeURIComponent(
      `Olá! Preciso de suporte.\n\nSession ID: ${sessionId}\nEmail: ${user.email}\n\n[Descreva seu problema aqui]`
    );

    const whatsappUrl = `https://wa.me/${SUPPORT_PHONE}?text=${message}`;

    console.log("[create-support-session] Session created:", sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        whatsapp_url: whatsappUrl,
        expires_at: expiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-support-session] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
