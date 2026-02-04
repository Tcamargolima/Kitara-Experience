import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    // 🔐 idempotência (Stripe pode reenviar)
    const { data: already } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (already) {
      return new Response("already processed");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.order_id;
      const userId = session.metadata?.user_id;
      const amount = (session.amount_total ?? 0) / 100;

      if (!orderId || !userId) {
        console.error("metadata missing");
        return new Response("bad metadata", { status: 400 });
      }

      // ✅ Finaliza pedido (ledger + acesso tudo dentro do RPC)
      const { error } = await supabase.rpc(
        "finalize_order_from_webhook",
        {
          p_order: orderId,
          p_amount: amount,
          p_stripe_payment: session.payment_intent,
          p_event_id: event.id,
        }
      );

      if (error) {
        console.error(error);
        return new Response("rpc error", { status: 500 });
      }
    }

    return new Response("ok");
  } catch (err) {
    console.error(err);
    return new Response("invalid signature", { status: 400 });
  }
});
