-- Update profiles table to support phone authentication
ALTER TABLE public.profiles 
ADD COLUMN phone_verified boolean DEFAULT false,
ADD COLUMN pending_approval boolean DEFAULT true,
ADD COLUMN approval_code text,
ADD COLUMN device_info jsonb,
ADD COLUMN location_data jsonb;

-- Create secure access logs table
CREATE TABLE public.secure_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  encrypted_data text,
  device_fingerprint text,
  ip_address inet,
  location_data jsonb,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on secure_access_logs
ALTER TABLE public.secure_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for secure_access_logs
CREATE POLICY "Admins can view all secure logs" 
ON public.secure_access_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.profile = 'admin'
));

CREATE POLICY "System can insert secure logs" 
ON public.secure_access_logs 
FOR INSERT 
WITH CHECK (true);

-- Create SMS codes table
CREATE TABLE public.sms_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on sms_codes
ALTER TABLE public.sms_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_codes
CREATE POLICY "Users can insert SMS codes" 
ON public.sms_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their SMS codes" 
ON public.sms_codes 
FOR UPDATE 
USING (phone IN (
  SELECT profiles.phone FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

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
      WHEN NEW.email = 'alice@gatepass.com' THEN 'admin'
      ELSE 'cliente'
    END,
    NEW.raw_user_meta_data -> 'device_info'
  );
  
  -- Log user registration in secure logs
  INSERT INTO public.secure_access_logs (user_id, event_type, device_fingerprint)
  VALUES (
    NEW.id,
    'user_registration',
    NEW.raw_user_meta_data ->> 'device_fingerprint'
  );
  
  RETURN NEW;
END;
$function$;