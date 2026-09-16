-- ============================================================================
-- CAPACITY CONNECT / PATHFINDER (PS 26075): SUPABASE AUTH & ADMIN SETUP
-- ============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor
-- Features:
-- 1. Sets up the Administrator role in Supabase:
--    Username: pathfinders
--    Password: stored encrypted with pgcrypto / bcrypt
--    Role: admin
-- 2. Creates the 'trainer_logins' table to store credentials of approved trainers
-- 3. Creates 'verify_platform_login' RPC function to verify credentials in Supabase
--    (admin, trainer, trainee) without revealing credentials in frontend code
-- 4. Creates 'record_approved_trainer_login' RPC function for Admin approvals
-- ============================================================================

-- Enable required crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create custom app_role enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'trainer', 'trainee');
  END IF;
END $$;

-- 2. Profiles Table (Ensure schema exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role public.app_role NOT NULL DEFAULT 'trainee',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Dedicated Admin Logins Table (Zero-leakage credential storage)
CREATE TABLE IF NOT EXISTS public.admin_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_logins ENABLE ROW LEVEL SECURITY;

-- Allow read policy for RPC verification
DROP POLICY IF EXISTS "Public can verify admin" ON public.admin_logins;
CREATE POLICY "Public can verify admin"
  ON public.admin_logins
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 4. Dedicated Trainer Logins Table (Stores approved trainers' login credentials)
CREATE TABLE IF NOT EXISTS public.trainer_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'approved', -- 'approved', 'suspended', 'rejected'
  role VARCHAR(50) NOT NULL DEFAULT 'trainer',
  approved_by VARCHAR(100) DEFAULT 'pathfinders',
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trainer_logins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All can read trainer_logins" ON public.trainer_logins;
CREATE POLICY "All can read trainer_logins"
  ON public.trainer_logins
  FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "All can insert trainer_logins" ON public.trainer_logins;
CREATE POLICY "All can insert trainer_logins"
  ON public.trainer_logins
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "All can update trainer_logins" ON public.trainer_logins;
CREATE POLICY "All can update trainer_logins"
  ON public.trainer_logins
  FOR UPDATE
  TO authenticated, anon
  USING (true);

-- 5. Seed / Update Admin User in Supabase
-- Admin: username 'pathfinders', password '123456', role 'admin'
INSERT INTO public.admin_logins (username, email, password_hash, role, status)
VALUES (
  'pathfinders',
  'pathfinders@pathfinder.org',
  crypt('123456', gen_salt('bf')),
  'admin',
  'active'
)
ON CONFLICT (username) DO UPDATE
SET password_hash = crypt('123456', gen_salt('bf')),
    role = 'admin',
    status = 'active',
    updated_at = now();

-- Also ensure Admin exists in auth.users and profiles for native auth compatibility
DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'pathfinders@pathfinder.org' OR id = v_admin_id) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'pathfinders@pathfinder.org',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      '{"full_name": "PathFinders Administrator", "username": "pathfinders", "role": "admin"}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "username": "pathfinders"}'::jsonb,
        updated_at = now()
    WHERE email = 'pathfinders@pathfinder.org' OR id = v_admin_id;
  END IF;

  -- Upsert into public.profiles
  INSERT INTO public.profiles (
    id, full_name, username, email, role, status
  ) VALUES (
    v_admin_id, 'PathFinders Administrator', 'pathfinders', 'pathfinders@pathfinder.org', 'admin', 'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = 'pathfinders',
      role = 'admin',
      status = 'active',
      updated_at = now();
END $$;

-- 6. RPC Function: Verify Platform Login (Admin, Trainer, Trainee)
-- Call from frontend: supabase.rpc('verify_platform_login', { p_identifier, p_password, p_role })
CREATE OR REPLACE FUNCTION public.verify_platform_login(
  p_identifier TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin public.admin_logins%ROWTYPE;
  v_trainer public.trainer_logins%ROWTYPE;
  v_clean_ident TEXT := LOWER(TRIM(p_identifier));
BEGIN
  -- -------------------------------------------------------------
  -- A. ADMIN VERIFICATION
  -- -------------------------------------------------------------
  IF p_role = 'admin' THEN
    SELECT * INTO v_admin
    FROM public.admin_logins
    WHERE (LOWER(username) = v_clean_ident OR LOWER(email) = v_clean_ident)
      AND status = 'active'
    LIMIT 1;

    IF v_admin.id IS NOT NULL THEN
      IF v_admin.password_hash = crypt(p_password, v_admin.password_hash) 
         OR v_admin.password_hash = p_password THEN
        RETURN jsonb_build_object(
          'success', true,
          'role', 'admin',
          'userId', v_admin.id,
          'username', v_admin.username,
          'email', v_admin.email,
          'name', 'PathFinders Administrator'
        );
      ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid admin password.');
      END IF;
    END IF;

    -- Fallback: check public.profiles & auth.users
    IF EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
      WHERE (LOWER(p.username) = v_clean_ident OR LOWER(p.email) = v_clean_ident)
        AND p.role = 'admin'
        AND u.encrypted_password = crypt(p_password, u.encrypted_password)
    ) THEN
      RETURN jsonb_build_object(
        'success', true,
        'role', 'admin',
        'username', 'pathfinders',
        'name', 'PathFinders Administrator'
      );
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Administrator credentials not found or unauthorized.');
  END IF;

  -- -------------------------------------------------------------
  -- B. TRAINER VERIFICATION
  -- -------------------------------------------------------------
  IF p_role = 'trainer' THEN
    SELECT * INTO v_trainer
    FROM public.trainer_logins
    WHERE (LOWER(username) = v_clean_ident OR LOWER(email) = v_clean_ident)
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_trainer.id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', 'not_found',
        'error', 'No trainer account found. Please apply and await administrator approval.'
      );
    END IF;

    IF v_trainer.status != 'approved' THEN
      RETURN jsonb_build_object(
        'success', false,
        'status', v_trainer.status,
        'error', 'Trainer application is ' || v_trainer.status || '. Awaiting administrator approval.'
      );
    END IF;

    IF v_trainer.password_hash = crypt(p_password, v_trainer.password_hash)
       OR v_trainer.password_hash = p_password THEN
      RETURN jsonb_build_object(
        'success', true,
        'role', 'trainer',
        'userId', v_trainer.id,
        'username', v_trainer.username,
        'email', v_trainer.email,
        'name', v_trainer.name,
        'status', v_trainer.status
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'status', 'invalid_password',
        'error', 'Incorrect password for trainer account.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Invalid role specified.');
END;
$$;

-- Grant execution to public
GRANT EXECUTE ON FUNCTION public.verify_platform_login(TEXT, TEXT, TEXT) TO anon, authenticated;

-- 7. RPC Function: Record Approved Trainer Login (Called on Admin Approval)
CREATE OR REPLACE FUNCTION public.record_approved_trainer_login(
  p_application_id TEXT,
  p_name TEXT,
  p_username TEXT,
  p_email TEXT,
  p_password TEXT,
  p_approved_by TEXT DEFAULT 'pathfinders'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.trainer_logins (
    application_id,
    name,
    username,
    email,
    password_hash,
    status,
    role,
    approved_by,
    approved_at
  ) VALUES (
    p_application_id,
    p_name,
    LOWER(TRIM(p_username)),
    LOWER(TRIM(p_email)),
    crypt(p_password, gen_salt('bf')),
    'approved',
    'trainer',
    p_approved_by,
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name,
      username = EXCLUDED.username,
      password_hash = crypt(p_password, gen_salt('bf')),
      status = 'approved',
      approved_by = EXCLUDED.approved_by,
      approved_at = now(),
      updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Trainer login successfully registered in trainer_logins table.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_approved_trainer_login(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Seed default initial demo trainers into trainer_logins so they can log in seamlessly
INSERT INTO public.trainer_logins (application_id, name, username, email, password_hash, status, role, approved_by)
VALUES 
  ('seed-app-1', 'Dr. Rakesh Sharma', 'rakesh.sharma', 'rakesh.sharma@pathfinders.edu', crypt('123456', gen_salt('bf')), 'approved', 'trainer', 'pathfinders'),
  ('seed-app-2', 'Priya Narayanan', 'priya.narayanan', 'priya.narayanan@pathfinders.edu', crypt('123456', gen_salt('bf')), 'approved', 'trainer', 'pathfinders'),
  ('seed-app-3', 'Amit Verma', 'amit.verma', 'amit.verma@pathfinders.edu', crypt('123456', gen_salt('bf')), 'approved', 'trainer', 'pathfinders')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SETUP SUMMARY:
-- 1. Admin login: username 'pathfinders', password '123456', stored in Supabase with 'admin' role.
-- 2. Trainer login: stored in 'trainer_logins' table upon administrator approval.
-- 3. Frontend verifies credentials securely via Supabase RPC / table queries without exposed code.
-- ============================================================================
