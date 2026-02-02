-- MOSKINO Complete Database Schema Migration
-- Idempotent SQL for fresh Supabase project
-- Security: RLS-enforced roles, SECURITY DEFINER functions, no roles in profiles

-- ============================================================================
-- 1. CREATE APP_ROLE ENUM
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'cliente', 'pendente');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- profiles: User profile information (NOT role storage)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_roles: SOURCE OF TRUTH for user permissions
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_approval_history: Audit trail for role changes
CREATE TABLE IF NOT EXISTS public.user_approval_history (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  old_role public.app_role,
  new_role public.app_role NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tickets: Event tickets purchased by users
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- subscriptions: Recurring subscription plans
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role);
CREATE INDEX IF NOT EXISTS user_approval_history_user_id_idx ON public.user_approval_history (user_id);
CREATE INDEX IF NOT EXISTS user_approval_history_approved_by_idx ON public.user_approval_history (approved_by);
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON public.tickets (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);

-- ============================================================================
-- 4. CREATE SECURITY FUNCTIONS
-- ============================================================================

-- has_role: Check if user has a specific role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- get_user_role: Get current user's role (callable from client)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(role, 'pendente')
  FROM public.user_roles
  WHERE user_id = auth.uid()
$$;

-- ============================================================================
-- 5. CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- handle_new_user: Create profile and assign 'pendente' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.user_metadata->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;

  -- Assign 'pendente' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pendente')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger: Call handle_new_user on new auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Admins: Full access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Users: View and update own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- New users (any role): Insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- USER_ROLES POLICIES
-- ============================================================================

-- Admins: View all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins: Update roles (approve users)
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Users: View own role
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger function inserts: Allow system to insert
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;
CREATE POLICY "System can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- USER_APPROVAL_HISTORY POLICIES
-- ============================================================================

-- Admins: Full access
DROP POLICY IF EXISTS "Admins can view approval history" ON public.user_approval_history;
CREATE POLICY "Admins can view approval history"
  ON public.user_approval_history FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert approval history" ON public.user_approval_history;
CREATE POLICY "Admins can insert approval history"
  ON public.user_approval_history FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users: View own approval history
DROP POLICY IF EXISTS "Users can view own approval history" ON public.user_approval_history;
CREATE POLICY "Users can view own approval history"
  ON public.user_approval_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- TICKETS POLICIES
-- ============================================================================

-- Admins: Full access
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
CREATE POLICY "Admins can view all tickets"
  ON public.tickets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete tickets" ON public.tickets;
CREATE POLICY "Admins can delete tickets"
  ON public.tickets FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Clientes: View and insert own tickets
DROP POLICY IF EXISTS "Clientes can view own tickets" ON public.tickets;
CREATE POLICY "Clientes can view own tickets"
  ON public.tickets FOR SELECT
  USING (
    (public.has_role(auth.uid(), 'cliente') OR public.has_role(auth.uid(), 'admin'))
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Clientes can create tickets" ON public.tickets;
CREATE POLICY "Clientes can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'cliente')
    AND auth.uid() = user_id
  );

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Admins: Full access
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Clientes: View and manage own subscriptions
DROP POLICY IF EXISTS "Clientes can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Clientes can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    (public.has_role(auth.uid(), 'cliente') OR public.has_role(auth.uid(), 'admin'))
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Clientes can create subscriptions" ON public.subscriptions;
CREATE POLICY "Clientes can create subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'cliente')
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Clientes can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Clientes can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'cliente')
    AND auth.uid() = user_id
  );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO anon, authenticated;
GRANT SELECT, INSERT ON public.user_approval_history TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tickets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO anon, authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.has_role TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO anon, authenticated;

-- ============================================================================
-- END MIGRATION
-- ============================================================================
