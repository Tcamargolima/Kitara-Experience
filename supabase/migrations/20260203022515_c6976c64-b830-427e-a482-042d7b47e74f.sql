-- =====================================================
-- KITARA SECURE SCHEMA - PHASE 1
-- Zero Direct Access Architecture
-- =====================================================

-- 1. Create new tables
-- =====================================================

-- User Profiles (extended, replaces old profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  invite_code_used text,
  mfa_enabled boolean DEFAULT false,
  mfa_secret_encrypted text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  max_uses integer DEFAULT 1,
  uses_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Elixir Coupons (discount codes)
CREATE TABLE IF NOT EXISTS public.elixir_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_fixed numeric DEFAULT 0,
  max_uses integer,
  uses_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tickets (event tickets)
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  event_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  ticket_id uuid REFERENCES public.tickets(id) NOT NULL,
  quantity integer DEFAULT 1,
  original_price numeric NOT NULL,
  discount_applied numeric DEFAULT 0,
  final_price numeric NOT NULL,
  elixir_code_used text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  gateway text NOT NULL CHECK (gateway IN ('stripe', 'pix', 'manual')),
  gateway_event_id text UNIQUE,
  gateway_payload jsonb,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Transactions Ledger (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.transactions_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  payment_id uuid REFERENCES public.payments(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Audit Logs (IMMUTABLE)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Security Events
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  success boolean DEFAULT false,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Support Sessions (temporary)
CREATE TABLE IF NOT EXISTS public.support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  session_id text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on all tables
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elixir_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies - MINIMAL DIRECT ACCESS
-- =====================================================

-- user_profiles: Users can only read their own profile
CREATE POLICY "Users can read own user_profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all user_profiles"
  ON public.user_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- NO direct INSERT/UPDATE/DELETE - only via RPC

-- tickets: Public read only
CREATE POLICY "Anyone can read active tickets"
  ON public.tickets FOR SELECT
  USING (is_active = true);

-- orders: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- NO direct INSERT/UPDATE/DELETE on orders - only via RPC

-- payments: Users can read their own payments
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = public.payments.order_id
      AND o.user_id = auth.uid()
    )
  );

-- NO direct write on payments - only via Edge Function

-- transactions_ledger: Users can read their own
CREATE POLICY "Users can read own ledger"
  ON public.transactions_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all
CREATE POLICY "Admins can read all ledger"
  ON public.transactions_ledger FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- NO direct write on ledger - only via RPC

-- audit_logs: Only admins can read
CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- NO direct write on audit_logs - only via internal functions

-- security_events: Only admins can read all
CREATE POLICY "Admins can read security_events"
  ON public.security_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own security events
CREATE POLICY "Users can read own security_events"
  ON public.security_events FOR SELECT
  USING (auth.uid() = user_id);

-- invites: No direct access - only via RPC
-- elixir_coupons: No direct access - only via RPC
-- support_sessions: Users can read their own
CREATE POLICY "Users can read own support_sessions"
  ON public.support_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. SECURITY DEFINER Functions (RPCs)
-- =====================================================

-- validate_invite: Check if invite code is valid
CREATE OR REPLACE FUNCTION public.validate_invite(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM public.invites
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Código de convite inválido ou expirado'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'code', invite_record.code,
    'message', 'Código válido'
  );
END;
$$;

-- consume_invite: Mark invite as used
CREATE OR REPLACE FUNCTION public.consume_invite(p_code text, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Validate first
  SELECT * INTO invite_record
  FROM public.invites
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses_count < max_uses)
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código inválido');
  END IF;
  
  -- Increment uses
  UPDATE public.invites
  SET uses_count = uses_count + 1
  WHERE id = invite_record.id;
  
  -- Update user profile with invite code
  UPDATE public.user_profiles
  SET invite_code_used = UPPER(p_code)
  WHERE id = p_user_id;
  
  -- Log audit
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (p_user_id, 'consume_invite', 'invites', invite_record.id, 
          jsonb_build_object('code', UPPER(p_code)));
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- apply_elixir: Validate and return discount info
CREATE OR REPLACE FUNCTION public.apply_elixir(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  coupon RECORD;
BEGIN
  SELECT * INTO coupon
  FROM public.elixir_coupons
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until > now())
    AND (max_uses IS NULL OR uses_count < max_uses);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Código Elixir inválido ou expirado'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'code', coupon.code,
    'discount_percent', COALESCE(coupon.discount_percent, 0),
    'discount_fixed', COALESCE(coupon.discount_fixed, 0),
    'message', 'Desconto aplicado!'
  );
END;
$$;

-- create_order: Create order with discount calculation
CREATE OR REPLACE FUNCTION public.create_order(
  p_ticket_id uuid,
  p_quantity integer DEFAULT 1,
  p_elixir_code text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_ticket RECORD;
  v_coupon RECORD;
  v_original_price numeric;
  v_discount numeric := 0;
  v_final_price numeric;
  v_order_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Não autenticado');
  END IF;
  
  -- Get ticket
  SELECT * INTO v_ticket
  FROM public.tickets
  WHERE id = p_ticket_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ingresso não encontrado');
  END IF;
  
  -- Check stock
  IF v_ticket.stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'message', 'Estoque insuficiente');
  END IF;
  
  v_original_price := v_ticket.price * p_quantity;
  
  -- Apply elixir code if provided
  IF p_elixir_code IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM public.elixir_coupons
    WHERE code = UPPER(p_elixir_code)
      AND is_active = true
      AND (valid_from IS NULL OR valid_from <= now())
      AND (valid_until IS NULL OR valid_until > now())
      AND (max_uses IS NULL OR uses_count < max_uses);
    
    IF FOUND THEN
      v_discount := COALESCE(v_original_price * v_coupon.discount_percent / 100, 0)
                  + COALESCE(v_coupon.discount_fixed, 0);
      
      -- Increment coupon usage
      UPDATE public.elixir_coupons
      SET uses_count = uses_count + 1
      WHERE id = v_coupon.id;
    END IF;
  END IF;
  
  v_final_price := GREATEST(v_original_price - v_discount, 0);
  
  -- Create order
  INSERT INTO public.orders (
    user_id, ticket_id, quantity, original_price, 
    discount_applied, final_price, elixir_code_used, status
  )
  VALUES (
    v_user_id, p_ticket_id, p_quantity, v_original_price,
    v_discount, v_final_price, UPPER(p_elixir_code), 'pending'
  )
  RETURNING id INTO v_order_id;
  
  -- Reserve stock
  UPDATE public.tickets
  SET stock = stock - p_quantity
  WHERE id = p_ticket_id;
  
  -- Log audit
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (v_user_id, 'create_order', 'orders', v_order_id,
          jsonb_build_object('ticket_id', p_ticket_id, 'quantity', p_quantity, 'final_price', v_final_price));
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'original_price', v_original_price,
    'discount', v_discount,
    'final_price', v_final_price
  );
END;
$$;

-- finalize_order_from_webhook: Called by Edge Function only
CREATE OR REPLACE FUNCTION public.finalize_order_from_webhook(
  p_order_id uuid,
  p_gateway text,
  p_gateway_event_id text,
  p_gateway_payload jsonb,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_payment_id uuid;
BEGIN
  -- Check idempotency
  IF EXISTS (SELECT 1 FROM public.payments WHERE gateway_event_id = p_gateway_event_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already processed');
  END IF;
  
  -- Get order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;
  
  -- Create payment record
  INSERT INTO public.payments (order_id, gateway, gateway_event_id, gateway_payload, amount, status, processed_at)
  VALUES (p_order_id, p_gateway, p_gateway_event_id, p_gateway_payload, p_amount, 'success', now())
  RETURNING id INTO v_payment_id;
  
  -- Update order status
  UPDATE public.orders
  SET status = 'paid', paid_at = now()
  WHERE id = p_order_id;
  
  -- Add to ledger
  INSERT INTO public.transactions_ledger (order_id, payment_id, user_id, type, amount, balance_after, description)
  VALUES (p_order_id, v_payment_id, v_order.user_id, 'credit', p_amount, p_amount, 'Pagamento confirmado');
  
  -- Audit log
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (v_order.user_id, 'payment_confirmed', 'payments', v_payment_id,
          jsonb_build_object('order_id', p_order_id, 'amount', p_amount));
  
  RETURN jsonb_build_object('success', true, 'payment_id', v_payment_id);
END;
$$;

-- get_my_profile: Get current user's profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT jsonb_build_object(
    'id', up.id,
    'email', up.email,
    'display_name', up.display_name,
    'mfa_enabled', up.mfa_enabled,
    'invite_code_used', up.invite_code_used,
    'role', COALESCE(ur.role::text, 'client'),
    'created_at', up.created_at
  )
  INTO result
  FROM public.user_profiles up
  LEFT JOIN public.user_roles ur ON ur.user_id = up.id
  WHERE up.id = v_user_id;
  
  RETURN result;
END;
$$;

-- get_my_tickets: Get user's purchased tickets
CREATE OR REPLACE FUNCTION public.get_my_tickets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'order_id', o.id,
      'ticket_name', t.name,
      'ticket_description', t.description,
      'event_date', t.event_date,
      'quantity', o.quantity,
      'final_price', o.final_price,
      'status', o.status,
      'paid_at', o.paid_at,
      'created_at', o.created_at
    )
  )
  INTO result
  FROM public.orders o
  JOIN public.tickets t ON t.id = o.ticket_id
  WHERE o.user_id = v_user_id
  ORDER BY o.created_at DESC;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- admin_get_stats: Get dashboard statistics
CREATE OR REPLACE FUNCTION public.admin_get_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  -- Check admin role
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.user_profiles),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'total_paid_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'paid'),
    'total_revenue', (SELECT COALESCE(SUM(final_price), 0) FROM public.orders WHERE status = 'paid'),
    'total_tickets', (SELECT COUNT(*) FROM public.tickets WHERE is_active = true),
    'active_coupons', (SELECT COUNT(*) FROM public.elixir_coupons WHERE is_active = true),
    'active_invites', (SELECT COUNT(*) FROM public.invites WHERE is_active = true AND (expires_at IS NULL OR expires_at > now()))
  ) INTO result;
  
  RETURN result;
END;
$$;

-- admin_get_users: Get all users for admin
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', up.id,
      'email', up.email,
      'display_name', up.display_name,
      'mfa_enabled', up.mfa_enabled,
      'role', COALESCE(ur.role::text, 'client'),
      'created_at', up.created_at
    )
  )
  INTO result
  FROM public.user_profiles up
  LEFT JOIN public.user_roles ur ON ur.user_id = up.id
  ORDER BY up.created_at DESC;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- admin_get_tickets: Get all tickets
CREATE OR REPLACE FUNCTION public.admin_get_tickets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'description', description,
        'price', price,
        'stock', stock,
        'event_date', event_date,
        'is_active', is_active,
        'created_at', created_at
      )
    )
    FROM public.tickets
    ORDER BY created_at DESC
  );
END;
$$;

-- admin_create_ticket: Create a new ticket
CREATE OR REPLACE FUNCTION public.admin_create_ticket(
  p_name text,
  p_description text,
  p_price numeric,
  p_stock integer,
  p_event_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_ticket_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  INSERT INTO public.tickets (name, description, price, stock, event_date)
  VALUES (p_name, p_description, p_price, p_stock, p_event_date)
  RETURNING id INTO v_ticket_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (v_user_id, 'create_ticket', 'tickets', v_ticket_id,
          jsonb_build_object('name', p_name, 'price', p_price));
  
  RETURN jsonb_build_object('success', true, 'ticket_id', v_ticket_id);
END;
$$;

-- admin_create_coupon: Create elixir coupon
CREATE OR REPLACE FUNCTION public.admin_create_coupon(
  p_code text,
  p_discount_percent integer DEFAULT NULL,
  p_discount_fixed numeric DEFAULT NULL,
  p_max_uses integer DEFAULT NULL,
  p_valid_until timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_coupon_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  INSERT INTO public.elixir_coupons (code, discount_percent, discount_fixed, max_uses, valid_until)
  VALUES (UPPER(p_code), p_discount_percent, p_discount_fixed, p_max_uses, p_valid_until)
  RETURNING id INTO v_coupon_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (v_user_id, 'create_coupon', 'elixir_coupons', v_coupon_id,
          jsonb_build_object('code', UPPER(p_code)));
  
  RETURN jsonb_build_object('success', true, 'coupon_id', v_coupon_id);
END;
$$;

-- admin_create_invite: Generate invite code
CREATE OR REPLACE FUNCTION public.admin_create_invite(
  p_max_uses integer DEFAULT 1,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_invite_id uuid;
  v_code text;
BEGIN
  v_user_id := auth.uid();
  
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  -- Generate unique code
  v_code := UPPER(substr(md5(random()::text), 1, 8));
  
  INSERT INTO public.invites (code, created_by, max_uses, expires_at)
  VALUES (v_code, v_user_id, p_max_uses, p_expires_at)
  RETURNING id INTO v_invite_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
  VALUES (v_user_id, 'create_invite', 'invites', v_invite_id,
          jsonb_build_object('code', v_code));
  
  RETURN jsonb_build_object('success', true, 'invite_id', v_invite_id, 'code', v_code);
END;
$$;

-- log_security_event: Record security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_success boolean,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO public.security_events (user_id, event_type, success, metadata)
  VALUES (auth.uid(), p_event_type, p_success, p_metadata)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- setup_mfa: Enable MFA for user
CREATE OR REPLACE FUNCTION public.setup_mfa(p_secret_encrypted text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  UPDATE public.user_profiles
  SET mfa_secret_encrypted = p_secret_encrypted,
      mfa_enabled = true,
      updated_at = now()
  WHERE id = v_user_id;
  
  PERFORM public.log_security_event('mfa_setup', true, jsonb_build_object('user_id', v_user_id));
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- get_mfa_secret: Get user's MFA secret for verification
CREATE OR REPLACE FUNCTION public.get_mfa_secret()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT mfa_secret_encrypted INTO v_secret
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  RETURN v_secret;
END;
$$;

-- 5. Update handle_new_user trigger to create user_profiles
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create user_profile
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (new.id, new.email, split_part(new.email, '@', 1));
  
  -- Create user_role (default client)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  -- Log security event
  INSERT INTO public.security_events (user_id, event_type, success, metadata)
  VALUES (new.id, 'signup', true, jsonb_build_object('email', new.email));
  
  RETURN new;
END;
$$;

-- 6. Create indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_elixir_coupons_code ON public.elixir_coupons(code);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_event_id ON public.payments(gateway_event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);