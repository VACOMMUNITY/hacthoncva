-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'registered', 'won', 'lost');
CREATE TYPE public.lead_source AS ENUM ('website', 'event', 'referral', 'social_media', 'walk_in', 'other');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'coordinator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  event_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  source lead_source NOT NULL DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lead_notes table
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lead_activities table
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Events policies (all authenticated can view, admins can manage)
CREATE POLICY "Authenticated users can view events" ON public.events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Admins can view all leads" ON public.leads
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coordinators can view assigned leads" ON public.leads
  FOR SELECT TO authenticated 
  USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update all leads" ON public.leads
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coordinators can update assigned leads" ON public.leads
  FOR UPDATE TO authenticated 
  USING (assigned_to = auth.uid());

CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Lead notes policies
CREATE POLICY "Users can view notes for accessible leads" ON public.lead_notes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (public.has_role(auth.uid(), 'admin') OR leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create notes on accessible leads" ON public.lead_notes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_notes.lead_id 
      AND (public.has_role(auth.uid(), 'admin') OR leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

-- Lead activities policies
CREATE POLICY "Users can view activities for accessible leads" ON public.lead_activities
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND (public.has_role(auth.uid(), 'admin') OR leads.assigned_to = auth.uid() OR leads.created_by = auth.uid())
    )
  );

CREATE POLICY "System can create activities" ON public.lead_activities
  FOR INSERT TO authenticated WITH CHECK (true);

-- Follow-ups policies
CREATE POLICY "Users can view own follow-ups" ON public.follow_ups
  FOR SELECT TO authenticated 
  USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create follow-ups" ON public.follow_ups
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own follow-ups" ON public.follow_ups
  FOR UPDATE TO authenticated 
  USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete follow-ups" ON public.follow_ups
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to log lead activities
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activities (lead_id, user_id, activity_type, description)
    VALUES (NEW.id, NEW.created_by, 'created', 'Lead was created');
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.lead_activities (lead_id, user_id, activity_type, description, metadata)
    VALUES (NEW.id, auth.uid(), 'status_change', 'Status changed from ' || OLD.status || ' to ' || NEW.status, 
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
  ELSIF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.lead_activities (lead_id, user_id, activity_type, description)
    VALUES (NEW.id, auth.uid(), 'assignment', 'Lead was reassigned');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_lead_change
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.log_lead_activity();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_event_id ON public.leads(event_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX idx_follow_ups_due_date ON public.follow_ups(due_date);
CREATE INDEX idx_follow_ups_assigned_to ON public.follow_ups(assigned_to);