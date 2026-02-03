import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, stripe-signature",
};

interface PaymentWebhookPayload {
  gateway: "stripe" | "pix" | "manual";
  event_id: string;
  order_id: string;
  amount: number;
  status: "success" | "failed";
  signature?: string;
  raw_payload?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role for webhook processing (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload: PaymentWebhookPayload = await req.json();

    console.log("[process-payment] Received webhook:", {
      gateway: payload.gateway,
      event_id: payload.event_id,
      order_id: payload.order_id,
      amount: payload.amount,
      status: payload.status,
    });

    // Validate required fields
    if (!payload.gateway || !payload.event_id || !payload.order_id || !payload.amount) {
      console.error("[process-payment] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For Stripe, validate signature if provided
    if (payload.gateway === "stripe" && payload.signature) {
      const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      if (stripeWebhookSecret) {
        // In production, implement proper Stripe signature validation
        // For now, we log and continue
        console.log("[process-payment] Stripe signature provided, validation skipped (implement in production)");
      }
    }

    // Check idempotency - if already processed, return success
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("gateway_event_id", payload.event_id)
      .single();

    if (existingPayment) {
      console.log("[process-payment] Already processed:", payload.event_id);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed", payment_id: existingPayment.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only process successful payments
    if (payload.status !== "success") {
      console.log("[process-payment] Payment not successful:", payload.status);
      
      // Log failed payment attempt
      await supabase.from("payments").insert({
        order_id: payload.order_id,
        gateway: payload.gateway,
        gateway_event_id: payload.event_id,
        gateway_payload: payload.raw_payload || {},
        amount: payload.amount,
        status: "failed",
        processed_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true, message: "Failed payment logged" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the finalize RPC function
    const { data, error } = await supabase.rpc("finalize_order_from_webhook", {
      p_order_id: payload.order_id,
      p_gateway: payload.gateway,
      p_gateway_event_id: payload.event_id,
      p_gateway_payload: payload.raw_payload || {},
      p_amount: payload.amount,
    });

    if (error) {
      console.error("[process-payment] RPC error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[process-payment] Order finalized:", data);

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[process-payment] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
