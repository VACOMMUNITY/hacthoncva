-- Migration: Project Submissions Table

CREATE TABLE IF NOT EXISTS public.project_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id TEXT NOT NULL,
    github_link TEXT NOT NULL,
    linkedin_link TEXT NOT NULL,
    vercel_link TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id)
);

-- Note: team_id should ideally be a foreign key to hackathon_registrations(team_id), 
-- but team_id in hackathon_registrations is TEXT and UNIQUE, so we just use TEXT here.
-- We can add a foreign key constraint:
ALTER TABLE public.project_submissions
ADD CONSTRAINT fk_team_id
FOREIGN KEY (team_id)
REFERENCES public.hackathon_registrations(team_id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_project_submissions_team_id ON public.project_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_user_id ON public.project_submissions(user_id);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read project submissions"
ON public.project_submissions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can insert submissions"
ON public.project_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own submissions"
ON public.project_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
