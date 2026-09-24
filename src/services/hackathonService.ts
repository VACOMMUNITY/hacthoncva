import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface HackathonRegistration {
  id: string;
  team_id: string;
  team_name: string;
  leader_name: string;
  phone: string;
  email: string;
  college: string;
  year: string;
  branch: string;
  track: string;
  team_members: TeamMember[];
  github_url?: string;
  linkedin_url?: string;
  registration_phase: 'Early Bird' | 'Regular';
  amount: number;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_screenshot_url?: string;
  transaction_id?: string;
  qr_ticket_code?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectSubmission {
  id?: string;
  team_id: string;
  github_link: string;
  linkedin_link: string;
  vercel_link: string;
  status?: string;
  user_id?: string;
  submitted_at?: string;
  updated_at?: string;
}

export interface HackathonSettings {
  id: string;
  event_date: string;
  countdown_target: string;
  duration: string;
  mode: string;
  team_size: string;
  early_bird_total: number;
  early_bird_remaining: number;
  early_bird_price: number;
  regular_price: number;
  prize_winner: number;
  prize_runner_up: number;
  prize_second_runner_up: number;
  upi_id: string;
  upi_name: string;
  sponsors: Array<{ name: string; tier: string; logoUrl?: string; website?: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

const DEFAULT_SETTINGS: HackathonSettings = {
  id: 'config',
  event_date: '9 October 2026',
  countdown_target: '2026-10-09T09:00:00.000Z',
  duration: '24 Hours',
  mode: 'Online',
  team_size: '2–4 Members',
  early_bird_total: 50,
  early_bird_remaining: 31,
  early_bird_price: 299,
  regular_price: 399,
  prize_winner: 10000,
  prize_runner_up: 5000,
  prize_second_runner_up: 3000,
  upi_id: '7416201359@ybl',
  upi_name: 'Community.VA',
  sponsors: [
    { name: 'Title Sponsor', tier: 'Title', website: 'https://community.va' },
    { name: 'Gold Sponsor', tier: 'Gold', website: 'https://community.va' },
    { name: 'Silver Sponsor', tier: 'Silver', website: 'https://community.va' },
    { name: 'Community Partner', tier: 'Community Partner', website: 'https://community.va' },
  ],
  faqs: [
    {
      question: 'Who can participate in the AI Innovation Hackathon?',
      answer: 'The hackathon is open to all college students, developers, and young innovators passionate about building AI solutions. Beginners and experienced coders are equally welcome!',
    },
    {
      question: 'Is the event completely online?',
      answer: 'Yes! The entire 24-hour hackathon is conducted online with live opening, mentorship sessions, progress check-ins, and final submissions through Discord/Google Meet.',
    },
    {
      question: 'What is the required team size?',
      answer: 'Teams must consist of 2 to 4 members. You can select a team leader during registration and add your teammates’ names and details.',
    },
    {
      question: 'What is the registration fee structure?',
      answer: 'Registration is in three tiers: Early Bird at ₹149 (first 50 teams only), Regular at ₹249, and Last Minute at ₹299 per team.',
    },
    {
      question: 'Will all participants receive certificates?',
      answer: 'Yes! All valid teams who submit a project will receive official verified Community.VA certificates of participation. Winners receive cash prizes, trophies, certificates of excellence, and features on Community.VA.',
    },
    {
      question: 'How does the payment and verification process work?',
      answer: 'Scan our official Community.VA UPI QR code or pay to 7416201359@ybl. Upload the transaction screenshot in the registration form. Our team verifies payments promptly and your QR Event Pass will be issued immediately!',
    },
  ],
};

const STORAGE_KEY_REGISTRATIONS = 'cva_hackathon_registrations';
const STORAGE_KEY_SETTINGS = 'cva_hackathon_settings';

// Helper to get local storage fallback
const getLocalRegistrations = (): HackathonRegistration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalRegistrations = (regs: HackathonRegistration[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(regs));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
};

export const hackathonService = {
  // 1. Get Settings
  async getSettings(): Promise<HackathonSettings> {
    try {
      const { data, error } = await supabase
        .from('hackathon_settings' as any)
        .select('*')
        .eq('id', 'config')
        .single();

      if (!error && data) {
        return { ...DEFAULT_SETTINGS, ...data } as HackathonSettings;
      }
    } catch {
      // Supabase table not created yet; fallback gracefully
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}

    return DEFAULT_SETTINGS;
  },

  // 2. Update Settings
  async updateSettings(settings: Partial<HackathonSettings>): Promise<HackathonSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };

    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {}

    try {
      await supabase
        .from('hackathon_settings' as any)
        .upsert(updated, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase settings update error (fallback active):', err);
    }

    return updated;
  },

  // 3. Register Team
  async registerTeam(payload: Omit<HackathonRegistration, 'id' | 'team_id' | 'created_at' | 'payment_status'> & {
    payment_status?: 'pending' | 'approved';
  }): Promise<HackathonRegistration> {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const team_id = `CVA-HACK-${randomCode}`;
    const newReg: HackathonRegistration = {
      ...payload,
      id: crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}-${randomCode}`,
      team_id,
      payment_status: payload.payment_status || 'pending',
      qr_ticket_code: `CVA2026-${team_id}-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Save to local storage cache
    const currentList = getLocalRegistrations();
    saveLocalRegistrations([newReg, ...currentList]);

    // Update remaining early bird spots if applicable
    if (newReg.registration_phase === 'Early Bird') {
      const settings = await this.getSettings();
      if (settings.early_bird_remaining > 0) {
        await this.updateSettings({
          early_bird_remaining: Math.max(0, settings.early_bird_remaining - 1),
        });
      }
    }

    // Try saving to Supabase
    try {
      await supabase
        .from('hackathon_registrations' as any)
        .insert([newReg]);
    } catch (err) {
      console.warn('Supabase registration insert error (local cached):', err);
    }

    return newReg;
  },

  // 4. Upload Payment Screenshot
  async uploadPaymentProof(file: File, teamIdentifier: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamIdentifier}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('hackathon-receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('hackathon-receipts')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, creating local data URL:', err);
    }

    // Fallback to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  },

  // 5. Get Registrations
  async getRegistrations(): Promise<HackathonRegistration[]> {
    let remoteList: HackathonRegistration[] = [];
    try {
      const { data, error } = await supabase
        .from('hackathon_registrations' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        remoteList = data as HackathonRegistration[];
      }
    } catch {}

    const localList = getLocalRegistrations();

    // Merge by team_id or id
    const map = new Map<string, HackathonRegistration>();
    localList.forEach((r) => map.set(r.team_id, r));
    remoteList.forEach((r) => map.set(r.team_id, { ...map.get(r.team_id), ...r }));

    const merged = Array.from(map.values());
    if (merged.length > 0) {
      saveLocalRegistrations(merged);
    }
    return merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // 6. Update Registration Status (Approve / Reject)
  async updateStatus(
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    rejectionReason?: string
  ): Promise<void> {
    const list = getLocalRegistrations();
    const index = list.findIndex((r) => r.id === id || r.team_id === id);
    if (index !== -1) {
      list[index].payment_status = status;
      if (rejectionReason) list[index].rejection_reason = rejectionReason;
      list[index].updated_at = new Date().toISOString();
      saveLocalRegistrations(list);
    }

    try {
      await supabase
        .from('hackathon_registrations' as any)
        .update({
          payment_status: status,
          rejection_reason: rejectionReason || null,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${id},team_id.eq.${id}`);
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }
  },

  // 7. Find Registration by Team ID or Email
  async findRegistration(query: string): Promise<HackathonRegistration | null> {
    const trimmed = query.trim().toLowerCase();
    const list = await this.getRegistrations();
    const found = list.find(
      (r) =>
        r.team_id.toLowerCase() === trimmed ||
        r.email.toLowerCase() === trimmed ||
        r.team_name.toLowerCase() === trimmed
    );
    return found || null;
  },

  // 8. Export CSV
  exportCSV(registrations: HackathonRegistration[]) {
    const headers = [
      'Team ID',
      'Team Name',
      'Leader Name',
      'Email',
      'Phone',
      'College',
      'Year',
      'Branch',
      'Track',
      'Members Count',
      'Members List',
      'Phase',
      'Amount',
      'Status',
      'Registration Date',
    ];

    const rows = registrations.map((r) => [
      `"${r.team_id}"`,
      `"${r.team_name.replace(/"/g, '""')}"`,
      `"${r.leader_name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.college.replace(/"/g, '""')}"`,
      `"${r.year}"`,
      `"${r.branch.replace(/"/g, '""')}"`,
      `"${r.track}"`,
      r.team_members?.length ? r.team_members.length + 1 : 1,
      `"${r.team_members?.map((m) => `${m.name} (${m.email})`).join('; ') || 'Solo/None'}"`,
      `"${r.registration_phase}"`,
      r.amount,
      `"${r.payment_status}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `community_va_hackathon_teams_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // 9. Get Project Submission
  async getProjectSubmission(team_id: string): Promise<ProjectSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('project_submissions' as any)
        .select('*')
        .eq('team_id', team_id)
        .single();
      
      if (!error && data) {
        return data as ProjectSubmission;
      }
    } catch {}
    
    // Local fallback
    try {
      const local = localStorage.getItem(`cva_submission_${team_id}`);
      if (local) return JSON.parse(local);
    } catch {}
    
    return null;
  },

  // 9b. Get All Project Submissions
  async getAllProjectSubmissions(): Promise<ProjectSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('project_submissions' as any)
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (!error && data) {
        return data as ProjectSubmission[];
      }
    } catch {}
    return [];
  },

  // 10. Submit Project
  async submitProject(payload: ProjectSubmission): Promise<ProjectSubmission> {
    const newSubmission = {
      ...payload,
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to local cache
    try {
      localStorage.setItem(`cva_submission_${payload.team_id}`, JSON.stringify(newSubmission));
    } catch {}

    try {
      const { data, error } = await supabase
        .from('project_submissions' as any)
        .insert([newSubmission])
        .select()
        .single();
      
      if (data) {
        return data as ProjectSubmission;
      }
      if (error) throw error;
    } catch (err) {
      console.warn('Supabase project submission insert error:', err);
    }

    return newSubmission;
  },

  // 11. Update Project Submission
  async updateProjectSubmission(team_id: string, payload: Partial<ProjectSubmission>): Promise<ProjectSubmission | null> {
    const updated = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    try {
      const current = localStorage.getItem(`cva_submission_${team_id}`);
      if (current) {
        localStorage.setItem(`cva_submission_${team_id}`, JSON.stringify({ ...JSON.parse(current), ...updated }));
      }
    } catch {}

    try {
      const { data, error } = await supabase
        .from('project_submissions' as any)
        .update(updated)
        .eq('team_id', team_id)
        .select()
        .single();
      
      if (data) {
        return data as ProjectSubmission;
      }
    } catch (err) {
      console.warn('Supabase project submission update error:', err);
    }

    const current = await this.getProjectSubmission(team_id);
    return current ? { ...current, ...updated } : null;
  }
};
