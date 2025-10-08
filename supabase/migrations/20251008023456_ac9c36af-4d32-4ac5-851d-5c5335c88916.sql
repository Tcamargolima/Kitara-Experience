-- Remove the private_credentials table as it's not needed with Supabase Auth
-- and currently has no RLS protection, exposing password hashes

DROP TABLE IF EXISTS public.private_credentials CASCADE;

-- Note: This app uses Supabase Auth's built-in password management,
-- so custom password storage is unnecessary and introduces security risks