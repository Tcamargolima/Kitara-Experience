-- KITARA Backend Provisioning
-- Complete database schema, RLS policies, storage buckets, and triggers

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- 2. Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now()
);

-- 3. Create user_roles table (for secure role checks - separate from profiles)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Create assets table
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Create sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text,
  created_at timestamptz DEFAULT now()
);

-- 6. Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 7. Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 8. RLS Policies for profiles table
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. RLS Policies for user_roles table
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. RLS Policies for assets table
CREATE POLICY "Users can CRUD own assets"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all assets"
  ON public.assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. RLS Policies for sessions table
CREATE POLICY "Users can CRUD own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all sessions"
  ON public.sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 12. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 13. Storage RLS policies for assets bucket
CREATE POLICY "Authenticated users can upload to assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can read assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Users can update own assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 14. Storage RLS policies for avatars bucket
CREATE POLICY "Authenticated users can upload to avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 15. Trigger function to auto-create profile and role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$$;

-- 16. Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();