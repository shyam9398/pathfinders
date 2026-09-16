-- ============================================================================
-- MIGRATION: FIX ADMIN AUTHENTICATION, PROFILES & RLS SECURITY
-- ============================================================================
-- 1. Sets up public.profiles referencing auth.users
-- 2. Sets up secure RLS policies for profiles, admin_actions, and trainer_profiles
-- 3. Sets up get_auth_email_by_identifier RPC for secure username login lookup
-- 4. Provisions administrator:
--    Username: pathfinder
--    Password: 123456
--    Email: admin@pathfinder.org
--    Role: admin
--    Status: active
-- 5. Removes deprecated plaintext credential tables (admin_logins, trainer_logins)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure profiles table structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL DEFAULT 'User',
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'trainee', -- 'admin', 'trainer', 'trainee', 'student'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'approved', 'pending', 'suspended'
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all required columns exist if table was already created
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'trainee';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username VARCHAR(100) UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'language') THEN
    ALTER TABLE public.profiles ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'en';
  END IF;
END $$;

-- 2. Secure helper function for username resolution during login (bypasses RLS safely without exposing private data)
CREATE OR REPLACE FUNCTION public.get_auth_email_by_identifier(p_identifier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_clean TEXT := LOWER(TRIM(p_identifier));
BEGIN
  IF v_clean = '' OR v_clean IS NULL THEN
    RETURN NULL;
  END IF;

  -- If it already contains an '@', return as-is
  IF v_clean LIKE '%@%' THEN
    RETURN v_clean;
  END IF;

  -- Look up email by username from profiles
  SELECT email INTO v_email
  FROM public.profiles
  WHERE LOWER(username) = v_clean
  LIMIT 1;

  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_email_by_identifier(TEXT) TO anon, authenticated;

-- Helper to verify admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status IN ('active', 'approved')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 3. Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile or admin reads all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin updates all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile or admin reads all"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (
    auth.uid() = id 
    OR public.is_admin()
  );

CREATE POLICY "Users can update own profile or admin updates all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. Row Level Security for trainer_profiles
CREATE TABLE IF NOT EXISTS public.trainer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  qualification TEXT,
  bio TEXT,
  experience_years NUMERIC(4, 1) NOT NULL DEFAULT 0,
  subjects TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  resume_url TEXT,
  availability VARCHAR(100) DEFAULT 'Full-time',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved trainers" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Trainers can manage own record" ON public.trainer_profiles;
DROP POLICY IF EXISTS "Admins can manage all trainers" ON public.trainer_profiles;

CREATE POLICY "Anyone can view approved trainers"
  ON public.trainer_profiles FOR SELECT
  TO authenticated, anon
  USING (approval_status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Trainers can manage own record"
  ON public.trainer_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trainers"
  ON public.trainer_profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Row Level Security for admin_actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view and manage admin_actions" ON public.admin_actions;
CREATE POLICY "Admins can view and manage admin_actions"
  ON public.admin_actions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Trigger to automatically populate public.profiles on Supabase auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    email,
    phone,
    role,
    status,
    language
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    LOWER(COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'trainee'),
    CASE 
      WHEN (NEW.raw_user_meta_data ->> 'role') = 'trainer' THEN 'pending'
      ELSE 'active'
    END,
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'en')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 7. Provision Administrator: pathfinder / 123456 / admin@pathfinder.org
DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_admin_email TEXT := 'admin@pathfinder.org';
  v_admin_username TEXT := 'pathfinder';
  v_admin_pass TEXT := '123456';
BEGIN
  -- Insert or update user in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email OR id = v_admin_id) THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000',
      v_admin_email, crypt(v_admin_pass, gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      jsonb_build_object('full_name', 'PathFinder Administrator', 'username', v_admin_username, 'role', 'admin'),
      now(), now(), 'authenticated', 'authenticated'
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt(v_admin_pass, gen_salt('bf')),
      email = v_admin_email,
      raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'admin', 'username', v_admin_username),
      updated_at = now()
    WHERE email = v_admin_email OR id = v_admin_id;
  END IF;

  -- Ensure profile exists in public.profiles with role = 'admin' and status = 'active'
  INSERT INTO public.profiles (
    id, full_name, username, email, role, status
  ) VALUES (
    v_admin_id, 'PathFinder Administrator', v_admin_username, v_admin_email, 'admin', 'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = v_admin_username,
      email = v_admin_email,
      role = 'admin',
      status = 'active',
      updated_at = now();

  -- Update any matching profiles
  UPDATE public.profiles
  SET role = 'admin', status = 'active'
  WHERE username = v_admin_username OR email = v_admin_email;
END $$;

-- 8. Clean up deprecated plaintext tables
DROP TABLE IF EXISTS public.admin_logins CASCADE;
DROP TABLE IF EXISTS public.trainer_logins CASCADE;
DROP FUNCTION IF EXISTS public.verify_platform_login(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.record_approved_trainer_login(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
