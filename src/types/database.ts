export type AppRole = 'admin' | 'coordinator';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'registered' | 'won' | 'lost';
export type LeadSource = 'website' | 'event' | 'referral' | 'social_media' | 'walk_in' | 'other';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  event_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  source: LeadSource;
  status: LeadStatus;
  event_id: string | null;
  assigned_to: string | null;
  payment_status: PaymentStatus;
  payment_amount: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  event?: Event | null;
  assignee?: Profile | null;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined data
  user?: Profile;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string | null;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  // Joined data
  user?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string;
  title: string;
  description: string | null;
  due_date: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  // Joined data
  lead?: Lead;
}

export interface LeadWithDetails extends Lead {
  notes?: LeadNote[];
  activities?: LeadActivity[];
  follow_ups?: FollowUp[];
}
