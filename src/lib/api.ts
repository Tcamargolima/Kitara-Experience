/**
 * KITARA API Layer
 * All database access goes through RPCs - no direct table access
 */

import { supabase } from "@/integrations/supabase/client";

// ==========================================
// Types
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  mfa_enabled: boolean;
  invite_code_used: string | null;
  role: "admin" | "client";
  created_at: string;
}

export interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  event_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  order_id: string;
  ticket_name: string;
  ticket_description: string | null;
  event_date: string | null;
  quantity: number;
  final_price: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  paid_at: string | null;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_orders: number;
  total_paid_orders: number;
  total_revenue: number;
  total_tickets: number;
  active_coupons: number;
  active_invites: number;
}

export interface InviteValidation {
  valid: boolean;
  code?: string;
  message: string;
}

export interface ElixirValidation {
  valid: boolean;
  code?: string;
  discount_percent?: number;
  discount_fixed?: number;
  message: string;
}

export interface OrderResult {
  success: boolean;
  order_id?: string;
  original_price?: number;
  discount?: number;
  final_price?: number;
  message?: string;
}

export interface SupportSession {
  success: boolean;
  session_id?: string;
  whatsapp_url?: string;
  expires_at?: string;
  error?: string;
}

// ==========================================
// Auth & Profile RPCs
// ==========================================

export async function getMyProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase.rpc("get_my_profile");
  
  if (error) {
    console.error("[API] get_my_profile error:", error);
    return null;
  }
  
  return data as unknown as UserProfile;
}

export async function getMfaSecret(): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_mfa_secret");
  
  if (error) {
    console.error("[API] get_mfa_secret error:", error);
    return null;
  }
  
  return data as string;
}

export async function setupMfa(secretEncrypted: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("setup_mfa", {
    p_secret_encrypted: secretEncrypted,
  });
  
  if (error) {
    console.error("[API] setup_mfa error:", error);
    return false;
  }
  
  return (data as { success: boolean })?.success ?? false;
}

export async function logSecurityEvent(
  eventType: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.rpc("log_security_event", {
    p_event_type: eventType,
    p_success: success,
    p_metadata: metadata as unknown as null,
  });
}

// ==========================================
// Invite RPCs
// ==========================================

export async function validateInvite(code: string): Promise<InviteValidation> {
  const { data, error } = await supabase.rpc("validate_invite", {
    p_code: code,
  });
  
  if (error) {
    console.error("[API] validate_invite error:", error);
    return { valid: false, message: "Erro ao validar código" };
  }
  
  return data as unknown as InviteValidation;
}

export async function consumeInvite(code: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_invite", {
    p_code: code,
    p_user_id: userId,
  });
  
  if (error) {
    console.error("[API] consume_invite error:", error);
    return false;
  }
  
  return (data as { success: boolean })?.success ?? false;
}

// ==========================================
// Elixir (Coupon) RPCs
// ==========================================

export async function applyElixir(code: string): Promise<ElixirValidation> {
  const { data, error } = await supabase.rpc("apply_elixir", {
    p_code: code,
  });
  
  if (error) {
    console.error("[API] apply_elixir error:", error);
    return { valid: false, message: "Erro ao aplicar código" };
  }
  
  return data as unknown as ElixirValidation;
}

// ==========================================
// Order RPCs
// ==========================================

export async function createOrder(
  ticketId: string,
  quantity: number = 1,
  elixirCode?: string
): Promise<OrderResult> {
  const { data, error } = await supabase.rpc("create_order", {
    p_ticket_id: ticketId,
    p_quantity: quantity,
    p_elixir_code: elixirCode ?? null,
  });
  
  if (error) {
    console.error("[API] create_order error:", error);
    return { success: false, message: "Erro ao criar pedido" };
  }
  
  return data as unknown as OrderResult;
}

export async function getMyTickets(): Promise<Order[]> {
  const { data, error } = await supabase.rpc("get_my_tickets");
  
  if (error) {
    console.error("[API] get_my_tickets error:", error);
    return [];
  }
  
  return (data as unknown as Order[]) ?? [];
}

// ==========================================
// Tickets (Public Read)
// ==========================================

export async function getActiveTickets(): Promise<Ticket[]> {
  // Use RPC to fetch active tickets to avoid direct table access from frontend
  const { data, error } = await supabase.rpc("get_active_tickets");

  if (error) {
    console.error("[API] get_active_tickets error:", error);
    return [];
  }

  return (data as Ticket[]) ?? [];
}

export async function adminCreateUser(
  userId: string,
  email: string,
  role: string
): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc("admin_create_user", {
    p_user_id: userId,
    p_email: email,
    p_role: role,
  });

  if (error) {
    console.error("[API] admin_create_user error:", error);
    return { success: false, message: error.message };
  }

  return (data as { success: boolean; message?: string }) ?? { success: false };
}

export async function getMyAccesses(userId: string): Promise<any[]> {
  const { data, error } = await supabase.rpc("get_my_accesses", { p_user_id: userId });

  if (error) {
    console.error("[API] get_my_accesses error:", error);
    return [];
  }

  return (data as any[]) ?? [];
}

// ==========================================
// Admin RPCs
// ==========================================

export async function adminGetStats(): Promise<AdminStats | null> {
  const { data, error } = await supabase.rpc("admin_get_stats");
  
  if (error) {
    console.error("[API] admin_get_stats error:", error);
    return null;
  }
  
  if ((data as unknown as { error?: string })?.error) {
    console.error("[API] admin_get_stats unauthorized");
    return null;
  }
  
  return data as unknown as AdminStats;
}

export async function adminGetUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase.rpc("admin_get_users");
  
  if (error) {
    console.error("[API] admin_get_users error:", error);
    return [];
  }
  
  if ((data as unknown as { error?: string })?.error) {
    return [];
  }
  
  return (data as unknown as UserProfile[]) ?? [];
}

export async function adminGetTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase.rpc("admin_get_tickets");
  
  if (error) {
    console.error("[API] admin_get_tickets error:", error);
    return [];
  }
  
  return (data as unknown as Ticket[]) ?? [];
}

export async function adminCreateTicket(
  name: string,
  description: string,
  price: number,
  stock: number,
  eventDate?: string
): Promise<{ success: boolean; ticket_id?: string; message?: string }> {
  const { data, error } = await supabase.rpc("admin_create_ticket", {
    p_name: name,
    p_description: description,
    p_price: price,
    p_stock: stock,
    p_event_date: eventDate ?? null,
  });
  
  if (error) {
    console.error("[API] admin_create_ticket error:", error);
    return { success: false, message: error.message };
  }
  
  return data as { success: boolean; ticket_id?: string; message?: string };
}

export async function adminCreateCoupon(
  code: string,
  discountPercent?: number,
  discountFixed?: number,
  maxUses?: number,
  validUntil?: string
): Promise<{ success: boolean; coupon_id?: string; message?: string }> {
  const { data, error } = await supabase.rpc("admin_create_coupon", {
    p_code: code,
    p_discount_percent: discountPercent ?? null,
    p_discount_fixed: discountFixed ?? null,
    p_max_uses: maxUses ?? null,
    p_valid_until: validUntil ?? null,
  });
  
  if (error) {
    console.error("[API] admin_create_coupon error:", error);
    return { success: false, message: error.message };
  }
  
  return data as { success: boolean; coupon_id?: string; message?: string };
}

export async function adminCreateInvite(
  maxUses: number = 1,
  expiresAt?: string
): Promise<{ success: boolean; invite_id?: string; code?: string; message?: string }> {
  const { data, error } = await supabase.rpc("admin_create_invite", {
    p_max_uses: maxUses,
    p_expires_at: expiresAt ?? null,
  });
  
  if (error) {
    console.error("[API] admin_create_invite error:", error);
    return { success: false, message: error.message };
  }
  
  return data as { success: boolean; invite_id?: string; code?: string; message?: string };
}

// ==========================================
// Support Session (Edge Function)
// ==========================================

export async function createSupportSession(): Promise<SupportSession> {
  const { data, error } = await supabase.functions.invoke("create-support-session");
  
  if (error) {
    console.error("[API] create-support-session error:", error);
    return { success: false, error: error.message };
  }
  
  return data as SupportSession;
}
