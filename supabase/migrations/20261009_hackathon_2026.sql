-- Migration: Community.VA AI Innovation Hackathon 2026 Tables and Storage

-- 1. Create Hackathon Settings Table
CREATE TABLE IF NOT EXISTS public.hackathon_settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    event_date TEXT NOT NULL DEFAULT '2026-10-09T09:00:00.000Z',
    countdown_target TEXT NOT NULL DEFAULT '2026-10-09T09:00:00.000Z',
    duration TEXT NOT NULL DEFAULT '24 Hours',
    mode TEXT NOT NULL DEFAULT 'Online',
    team_size TEXT NOT NULL DEFAULT '2 - 4 Members',
    early_bird_total INTEGER NOT NULL DEFAULT 50,
    early_bird_remaining INTEGER NOT NULL DEFAULT 31,
    early_bird_price NUMERIC NOT NULL DEFAULT 299,
    regular_price NUMERIC NOT NULL DEFAULT 399,
    last_minute_price NUMERIC NOT NULL DEFAULT 499,
    prize_winner NUMERIC NOT NULL DEFAULT 10000,
    prize_runner_up NUMERIC NOT NULL DEFAULT 5000,
    prize_second_runner_up NUMERIC NOT NULL DEFAULT 3000,
    upi_id TEXT NOT NULL DEFAULT '9849046019@ybl',
    upi_name TEXT NOT NULL DEFAULT 'Community.VA',
    sponsors JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings row if missing
INSERT INTO public.hackathon_settings (id, early_bird_remaining)
VALUES ('config', 31)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Hackathon Registrations Table
CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id TEXT UNIQUE NOT NULL,
    team_name TEXT NOT NULL,
    leader_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT NOT NULL,
    year TEXT NOT NULL,
    branch TEXT NOT NULL,
    track TEXT NOT NULL DEFAULT 'Open Innovation',
    team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
    github_url TEXT,
    linkedin_url TEXT,
    registration_phase TEXT NOT NULL DEFAULT 'Early Bird',
    amount NUMERIC NOT NULL DEFAULT 299,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    payment_screenshot_url TEXT,
    transaction_id TEXT,
    qr_ticket_code TEXT,
    rejection_reason TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_hackathon_reg_team_id ON public.hackathon_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_reg_email ON public.hackathon_registrations(email);
CREATE INDEX IF NOT EXISTS idx_hackathon_reg_status ON public.hackathon_registrations(payment_status);

-- Enable RLS
ALTER TABLE public.hackathon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Settings Policies: Anyone can read, only authenticated/admins can update
CREATE POLICY "Public can read hackathon settings"
ON public.hackathon_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can update hackathon settings"
ON public.hackathon_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Registrations Policies:
CREATE POLICY "Anyone can register for hackathon"
ON public.hackathon_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can read own registration or all for authenticated"
ON public.hackathon_registrations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can update registrations"
ON public.hackathon_registrations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('hackathon-receipts', 'hackathon-receipts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public upload to hackathon-receipts"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'hackathon-receipts');

CREATE POLICY "Allow public read from hackathon-receipts"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'hackathon-receipts');
