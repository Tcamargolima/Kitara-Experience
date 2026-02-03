-- Fix RLS for invites table (read-only for validation via RPC, no direct access)
-- The validate_invite RPC uses SECURITY DEFINER so it bypasses RLS

-- Fix RLS for elixir_coupons table (read-only for validation via RPC, no direct access)
-- The apply_elixir RPC uses SECURITY DEFINER so it bypasses RLS

-- These tables intentionally have no direct policies because all access is via SECURITY DEFINER functions.
-- However, we need to allow the functions to work, so we don't add any policies.
-- The SECURITY DEFINER functions bypass RLS entirely.

-- For the linter warnings, we can add explicit SELECT FALSE policies to make it clear these are locked down:
CREATE POLICY "No direct access to invites"
  ON public.invites FOR ALL
  USING (false);

CREATE POLICY "No direct access to elixir_coupons"
  ON public.elixir_coupons FOR ALL
  USING (false);