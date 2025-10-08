-- ============================================
-- FIX: Secure the profiles table RLS policies
-- ============================================
-- This migration fixes the security vulnerability where users could
-- modify sensitive fields in their own profile records.

-- Step 1: Drop problematic UPDATE policies
DROP POLICY IF EXISTS "Users can safely update their own info" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 2: Drop duplicate SELECT policies (keep the most specific one)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Step 3: Create secure UPDATE policy for regular users
-- Users can ONLY update non-sensitive fields (name, phone, device_info, location_data)
-- All sensitive fields are protected from user modification
CREATE POLICY "Users can update their own safe profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Ensure sensitive fields are not being modified by comparing OLD and NEW
  AND (
    -- These fields must remain unchanged by regular users:
    password_hash IS NOT DISTINCT FROM (SELECT password_hash FROM profiles WHERE user_id = auth.uid())
    AND approval_code IS NOT DISTINCT FROM (SELECT approval_code FROM profiles WHERE user_id = auth.uid())
    AND profile IS NOT DISTINCT FROM (SELECT profile FROM profiles WHERE user_id = auth.uid())
    AND two_factor_enabled IS NOT DISTINCT FROM (SELECT two_factor_enabled FROM profiles WHERE user_id = auth.uid())
    AND pending_approval IS NOT DISTINCT FROM (SELECT pending_approval FROM profiles WHERE user_id = auth.uid())
    AND phone_verified IS NOT DISTINCT FROM (SELECT phone_verified FROM profiles WHERE user_id = auth.uid())
    AND require_password_change IS NOT DISTINCT FROM (SELECT require_password_change FROM profiles WHERE user_id = auth.uid())
    AND last_password_change IS NOT DISTINCT FROM (SELECT last_password_change FROM profiles WHERE user_id = auth.uid())
    AND last_login IS NOT DISTINCT FROM (SELECT last_login FROM profiles WHERE user_id = auth.uid())
  )
);

-- Step 4: Create admin UPDATE policy with full access
CREATE POLICY "Admins can update all profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Step 5: Create DELETE policy (only admins)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 6: Add helpful comment
COMMENT ON TABLE public.profiles IS 'User profiles table with RLS protecting sensitive fields. Regular users can only update: name, phone, device_info, location_data. Admins have full access.';