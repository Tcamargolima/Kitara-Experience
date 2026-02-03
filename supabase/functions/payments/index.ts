import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const orderId = session.metadata.order_id;

      const res = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/finalize_order_from_webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
          },
          body: JSON.stringify({ p_order: orderId }),
        }
      );

      if (!res.ok) {
        console.error(await res.text());
        return new Response("ledger error", { status: 500 });
      }
    }

    return new Response("ok");
  } catch (err) {
    console.error(err);
    return new Response("invalid", { status: 400 });
  }
});
