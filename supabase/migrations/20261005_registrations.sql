-- ==============================================================================
-- 1. ENSURE USER ROLES TABLE & SECURE ADMIN CHECK FUNCTION
-- ==============================================================================

-- Create user_roles table if it does not already exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'coordinator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function: Securely check if the calling user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Check if user has 'admin' entry in public.user_roles
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if auth JWT metadata has role = 'admin'
  IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR 
     (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


-- ==============================================================================
-- 2. CREATE REGISTRATIONS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL DEFAULT 'cva-hackathon-2026',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    team_name TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    
    -- Additional existing hackathon fields to preserve full website features
    team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
    track TEXT DEFAULT 'Open Innovation',
    amount NUMERIC DEFAULT 299,
    registration_phase TEXT DEFAULT 'Early Bird',
    transaction_id TEXT,
    payment_screenshot_url TEXT,
    qr_ticket_code TEXT,
    rejection_reason TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ==============================================================================
-- 3. PREVENT DUPLICATE REGISTRATIONS (PER EVENT)
-- ==============================================================================

-- Prevent duplicate registration for the same event by email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_event_email 
ON public.registrations (event_id, LOWER(TRIM(email)));

-- Prevent duplicate registration for the same event by phone number
CREATE UNIQUE INDEX IF NOT EXISTS uq_registrations_event_phone 
ON public.registrations (event_id, TRIM(phone));

-- Additional lookup indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_team_name ON public.registrations(team_name);


-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop any previous test policies on registrations
DROP POLICY IF EXISTS "Public users can submit registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can update registration status" ON public.registrations;
DROP POLICY IF EXISTS "Public users can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins can delete registrations" ON public.registrations;

-- Policy 1: PUBLIC / ANONYMOUS USERS -> INSERT ONLY
-- Public users can ONLY insert a new registration. They cannot read, update, or delete.
CREATE POLICY "Public users can insert registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: ADMIN USERS ONLY -> SELECT
-- Only authenticated users verified as admin can read registrations.
CREATE POLICY "Admins can view registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy 3: ADMIN USERS ONLY -> UPDATE
-- Only authenticated users verified as admin can update registration status or details.
CREATE POLICY "Admins can update registrations"
ON public.registrations
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy 4: ADMIN USERS ONLY -> DELETE
-- Only authenticated users verified as admin can delete registrations.
CREATE POLICY "Admins can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (public.is_admin());
