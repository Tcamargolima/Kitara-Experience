
# KITARA - Full Backend Provisioning and Rebrand Plan

## Overview

This plan covers the complete transformation from MOSKINO to KITARA, including:
1. **Supabase Backend Provisioning** - Create all required tables, functions, RLS policies, and storage buckets
2. **Full Application Rebrand** - Update branding, theme, and visual identity to KITARA

---

## PART 1: SUPABASE BACKEND PROVISIONING

### 1.1 Database Schema Creation

Create the following tables with proper relationships and constraints:

```text
+------------------+       +------------------+       +------------------+
|    profiles      |       |      assets      |       |    sessions      |
+------------------+       +------------------+       +------------------+
| id (PK, FK auth) |<------| user_id (FK)     |       | id (PK)          |
| email (text)     |       | id (PK)          |       | user_id (FK)---->|
| role (text)      |       | file_url (text)  |       | status (text)    |
| created_at       |       | created_at       |       | created_at       |
+------------------+       +------------------+       +------------------+
```

**SQL Migration - Tables:**
- `profiles` - User profiles linked to auth.users with role (admin/client)
- `assets` - File references for user uploads
- `sessions` - User session tracking

### 1.2 Role-Based Access Control

Following security best practices, create a separate `user_roles` table:

```text
+------------------+
|   user_roles     |
+------------------+
| id (PK)          |
| user_id (FK)     |
| role (enum)      |
+------------------+
```

Create `app_role` enum type for proper role management.

### 1.3 Security Definer Function

Create `has_role()` function to prevent RLS infinite recursion:
- Security definer function to check user roles safely
- Used in RLS policies to determine access permissions

### 1.4 RLS Policies

**profiles table:**
- Users can read their own profile
- Users can update their own profile
- Admins can read all profiles

**assets table:**
- Users can CRUD their own assets
- Admins can CRUD all assets

**sessions table:**
- Users can CRUD their own sessions
- Admins can CRUD all sessions

### 1.5 Storage Buckets

Create two public storage buckets:
- `assets` - For general file storage
- `avatars` - For user profile pictures

With appropriate RLS policies for file access.

### 1.6 Fix TypeScript Errors

Update the edge function and hooks to resolve build errors:
- Fix `send-sms/index.ts` - Type the error parameter
- Update hooks to work with new schema

---

## PART 2: FULL APPLICATION REBRAND TO KITARA

### 2.1 Design System Updates

**Color Palette (HSL format):**
- Background: #050505 (matte black) → HSL: 0 0% 2%
- Default text: #E5E5E5 (soft silver) → HSL: 0 0% 90%
- Primary: #00FF9D (emerald neon glow) → HSL: 157 100% 50%
- Secondary: #C5A059 (champagne gold) → HSL: 41 50% 55%

### 2.2 Theme Implementation

Update `src/index.css`:
- New CSS custom properties for KITARA theme
- Dark glassmorphism card styles
- Backdrop blur effects
- Gold border accents at 20% opacity
- Neon green button glow effects
- Noise/grain texture overlay

### 2.3 Typography

Add Google Fonts:
- Headers (H1, H2, H3): Cinzel (elegant gold color)
- Body/UI: Inter or Manrope

### 2.4 Component Updates

**Buttons:**
- Neon green glow box-shadow
- Dark background hover states

**Inputs:**
- Dark background
- Thin gold border/underline

**Cards:**
- Dark glassmorphism surfaces
- Backdrop blur
- 1px gold border at 20% opacity

### 2.5 Files to Update

| File | Changes |
|------|---------|
| `index.html` | Title, meta tags, fonts, structured data → KITARA |
| `public/manifest.json` | App name, short_name → KITARA |
| `src/index.css` | Complete theme overhaul |
| `tailwind.config.ts` | Font families, color system |
| `src/pages/Index.tsx` | Replace MOSKINO branding |
| `src/pages/Auth.tsx` | Update branding and styling |
| `src/pages/Dashboard.tsx` | Update header and branding |
| PWA components | Update messaging |

### 2.6 PWA Updates

- Update manifest.json with KITARA branding
- Update service worker offline page
- Update install prompts messaging

---

## Technical Details

### SQL Migration Script (Complete)

```sql
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now()
);

-- 3. Create user_roles table (for secure role checks)
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

-- 6. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 7. Security definer function
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

-- 8. RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. RLS Policies for assets
CREATE POLICY "Users can CRUD own assets"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all assets"
  ON public.assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. RLS Policies for sessions
CREATE POLICY "Users can CRUD own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can CRUD all sessions"
  ON public.sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 12. Storage RLS policies
CREATE POLICY "Users can upload to assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can read assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

CREATE POLICY "Users can upload to avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 13. Profile trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'client');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Code Updates Summary

1. **Fix edge function error** - Add proper error typing
2. **Update useAuth.ts** - Adapt to new profiles schema
3. **Remove old table references** - Update all components to use new schema
4. **Update theme** - Complete CSS overhaul for KITARA design
5. **Update all branding** - Replace MOSKINO with KITARA everywhere

---

## Implementation Order

1. Run database migration
2. Fix TypeScript build errors
3. Update theme and CSS
4. Update HTML and manifest
5. Update all page components
6. Test authentication flow
