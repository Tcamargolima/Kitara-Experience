import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, stripe-signature",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read raw body BEFORE parsing (needed for signature verification)
    const rawBody = await req.text();

    // Determine gateway from stripe-signature header presence
    const stripeSignature = req.headers.get("stripe-signature");

    if (stripeSignature) {
      // ─── STRIPE WEBHOOK PATH ───
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

      if (!stripeSecretKey || !stripeWebhookSecret) {
        console.error("[process-payment] Missing Stripe secrets");
        return new Response(
          JSON.stringify({ error: "Server misconfiguration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, stripeSignature, stripeWebhookSecret);
      } catch (err) {
        console.error("[process-payment] Stripe signature verification failed:", err);

        // Log invalid attempt
        await supabase.rpc("log_security_event", {
          p_type: "webhook_signature_invalid",
          p_success: false,
          p_metadata: { gateway: "stripe", error: String(err) },
        }).catch(() => {});

        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[process-payment] Stripe event verified:", event.type, event.id);

      // Idempotency check
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("gateway_event_id", event.id)
        .single();

      if (existingPayment) {
        console.log("[process-payment] Already processed:", event.id);
        return new Response(
          JSON.stringify({ success: true, message: "Already processed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const amount = (session.amount_total ?? 0) / 100;

        if (!orderId) {
          console.error("[process-payment] Missing order_id in metadata");
          return new Response(
            JSON.stringify({ error: "Missing order metadata" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase.rpc("finalize_order_from_webhook", {
          p_order_id: orderId,
          p_gateway: "stripe",
          p_gateway_event_id: event.id,
          p_gateway_payload: session as unknown as Record<string, unknown>,
          p_amount: amount,
        });

        if (error) {
          console.error("[process-payment] RPC error:", error);
          return new Response(
            JSON.stringify({ error: "Processing error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("[process-payment] Order finalized:", data);
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Unhandled event type
      return new Response(
        JSON.stringify({ success: true, message: "Event type not handled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // ─── NON-STRIPE PATH: Reject unauthenticated requests ───
      // Only Stripe webhooks (with valid signatures) are accepted.
      // PIX/manual gateways should be added here with their own signature validation.
      console.error("[process-payment] No stripe-signature header — rejecting request");

      return new Response(
        JSON.stringify({ error: "Unsupported gateway or missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[process-payment] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
