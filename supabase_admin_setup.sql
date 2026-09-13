-- ============================================================================
-- CAPACITY CONNECT (PS 26075): DYNAMIC SUPABASE ADMIN AUTHENTICATION SCHEMA
-- ============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor
-- This eliminates hardcoded admin passwords or emails in client code,
-- storing roles dynamically in PostgreSQL with Row Level Security (RLS).
-- ============================================================================

-- 1. Create custom app_role enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'trainer', 'trainee');
  END IF;
END $$;

-- 2. Create the user_roles table for Dynamic Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'trainee',
  organization VARCHAR(255) DEFAULT 'Capacity Connect Platform',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Enable Row-Level Security (RLS) on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies:
-- Allow authenticated users to read their own assigned roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow platform administrators to inspect and grant roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
    )
  );

-- 5. Helper Function: Check if the calling user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
      AND is_active = TRUE
  );
$$;

-- 6. Helper Function: Grant Admin Privileges to an email dynamically
-- Usage in SQL Editor: SELECT public.grant_admin_by_email('admin@capacityconnect.org');
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(admin_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Lookup user ID in Supabase Auth
  SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;

  IF target_user_id IS NULL THEN
    RETURN 'Error: User with email ' || admin_email || ' does not exist in auth.users. Please sign up first.';
  END IF;

  -- Upsert admin role
  INSERT INTO public.user_roles (user_id, role, organization, is_active)
  VALUES (target_user_id, 'admin', 'Institutional Governance', TRUE)
  ON CONFLICT (user_id, role)
  DO UPDATE SET is_active = TRUE, updated_at = now();

  -- Update metadata on auth.users for fast token validation
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
  WHERE id = target_user_id;

  RETURN 'Success: Granted dynamic administrator role to ' || admin_email;
END;
$$;

-- ============================================================================
-- HOW TO USE:
-- 1. Create a user via the Sign Up form or Supabase Auth UI (e.g., admin@yourdomain.org)
-- 2. Run: SELECT public.grant_admin_by_email('admin@yourdomain.org');
-- 3. The user can now log into the Admin portal dynamically.
-- ============================================================================
