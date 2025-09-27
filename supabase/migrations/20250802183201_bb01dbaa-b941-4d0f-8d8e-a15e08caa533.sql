-- Update profiles table for phone authentication
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pending_approval BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS approval_code TEXT,
ADD COLUMN IF NOT EXISTS device_info JSONB,
ADD COLUMN IF NOT EXISTS location_data JSONB;

-- Create secure access logs table
CREATE TABLE IF NOT EXISTS public.secure_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  phone_hash TEXT NOT NULL,
  device_fingerprint TEXT,
  location_data JSONB,
  access_type TEXT NOT NULL DEFAULT 'login',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  encrypted_data TEXT
);

-- Enable RLS on secure_access_logs
ALTER TABLE public.secure_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for secure_access_logs
CREATE POLICY "Admins can view all secure logs" ON public.secure_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.profile = 'admin'
    )
  );

-- Create SMS codes table
CREATE TABLE IF NOT EXISTS public.sms_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on sms_codes
ALTER TABLE public.sms_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_codes
CREATE POLICY "Users can insert SMS codes" ON public.sms_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their SMS codes" ON public.sms_codes
  FOR UPDATE USING (true);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone, profile, device_info)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'),
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.phone = '+5511999999999' THEN 'admin'
      ELSE 'cliente'
    END,
    NEW.raw_user_meta_data -> 'device_info'
  );

  -- Log registration in secure access logs
  INSERT INTO public.secure_access_logs (
    user_id, 
    phone_hash, 
    device_fingerprint, 
    access_type,
    encrypted_data
  ) VALUES (
    NEW.id,
    encode(digest(COALESCE(NEW.phone, ''), 'sha256'), 'hex'),
    NEW.raw_user_meta_data ->> 'device_fingerprint',
    'registration',
    encode(NEW.raw_user_meta_data::text::bytea, 'base64')
  );
  
  RETURN NEW;
END;
$function$;