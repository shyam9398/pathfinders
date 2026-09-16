-- Migration: Add Admin & Trainer Logins and Verification Functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
CREATE POLICY "Public can verify admin" ON public.admin_logins FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE IF NOT EXISTS public.trainer_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'approved',
  role VARCHAR(50) NOT NULL DEFAULT 'trainer',
  approved_by VARCHAR(100) DEFAULT 'pathfinders',
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trainer_logins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trainer_logins" ON public.trainer_logins FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public can insert trainer_logins" ON public.trainer_logins FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Public can update trainer_logins" ON public.trainer_logins FOR UPDATE TO authenticated, anon USING (true);

-- Insert admin: pathfinders / 123456
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

    RETURN jsonb_build_object('success', false, 'error', 'Administrator credentials not found or unauthorized.');
  END IF;

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

GRANT EXECUTE ON FUNCTION public.verify_platform_login(TEXT, TEXT, TEXT) TO anon, authenticated;

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
    application_id, name, username, email, password_hash, status, role, approved_by, approved_at
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

  RETURN jsonb_build_object('success', true, 'message', 'Trainer login recorded successfully.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_approved_trainer_login(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
