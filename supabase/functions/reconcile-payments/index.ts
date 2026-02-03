import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    console.log("[reconcile-payments] Starting reconciliation job");

    // Find pending orders older than 30 minutes without payment
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: pendingOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, user_id, ticket_id, quantity, created_at")
      .eq("status", "pending")
      .lt("created_at", thirtyMinutesAgo);

    if (ordersError) {
      console.error("[reconcile-payments] Error fetching pending orders:", ordersError);
      throw ordersError;
    }

    console.log(`[reconcile-payments] Found ${pendingOrders?.length || 0} stale pending orders`);

    let cancelledCount = 0;
    let restoredStock = 0;

    for (const order of pendingOrders || []) {
      // Check if there's any payment attempt for this order
      const { data: payments } = await supabase
        .from("payments")
        .select("id, status")
        .eq("order_id", order.id);

      const hasPendingPayment = payments?.some((p) => p.status === "pending");

      if (!hasPendingPayment) {
        // Cancel the order and restore stock
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", order.id);

        // Restore ticket stock
        await supabase.rpc("admin_restore_ticket_stock", {
          p_ticket_id: order.ticket_id,
          p_quantity: order.quantity,
        });

        // Log audit event
        await supabase.from("audit_logs").insert({
          user_id: order.user_id,
          action: "order_auto_cancelled",
          entity_type: "orders",
          entity_id: order.id,
          new_data: { reason: "timeout", cancelled_at: new Date().toISOString() },
        });

        cancelledCount++;
        restoredStock += order.quantity;

        console.log(`[reconcile-payments] Cancelled order ${order.id}`);
      }
    }

    // Find orphaned payments (success payments without matching order update)
    const { data: orphanedPayments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, order_id, amount, gateway_event_id")
      .eq("status", "success");

    if (paymentsError) {
      console.error("[reconcile-payments] Error fetching payments:", paymentsError);
    }

    let reconciledCount = 0;

    for (const payment of orphanedPayments || []) {
      // Check if the order is still pending despite successful payment
      const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", payment.order_id)
        .single();

      if (order && order.status === "pending") {
        // Update order to paid
        await supabase
          .from("orders")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", payment.order_id);

        console.log(`[reconcile-payments] Reconciled order ${payment.order_id}`);
        reconciledCount++;
      }
    }

    const result = {
      success: true,
      cancelled_orders: cancelledCount,
      restored_stock: restoredStock,
      reconciled_payments: reconciledCount,
      timestamp: new Date().toISOString(),
    };

    console.log("[reconcile-payments] Completed:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[reconcile-payments] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
