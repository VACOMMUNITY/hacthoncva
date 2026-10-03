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
  registration_phase: 'Early Bird' | 'Regular' | 'Last Minute';
  amount: number;
  payment_status: 'pending' | 'approved' | 'rejected';
  payment_screenshot_url?: string;
  transaction_id?: string;
  qr_ticket_code?: string;
  rejection_reason?: string;
  created_at: string;
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
  last_minute_price: number;
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
  regular_price: 299,
  last_minute_price: 399,
  prize_winner: 10000,
  prize_runner_up: 5000,
  prize_second_runner_up: 3000,
  upi_id: 'padimarriabhiram@oksbi, 9849046019@ybl',
  upi_name: 'Abhi Ram',
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
      answer: 'Registration is in two phases: Early Bird at ₹299 (first 50 teams only) and Final / Late Pass at ₹399 per team.',
    },
    {
      question: 'Will all participants receive certificates?',
      answer: 'Yes! All valid teams who submit a project will receive official verified Community.VA certificates of participation. Winners receive cash prizes, trophies, certificates of excellence, and features on Community.VA.',
    },
    {
      question: 'How does the payment and verification process work?',
      answer: 'Scan our official Abhi Ram UPI QR code or pay directly to padimarriabhiram@oksbi or 9849046019@ybl. Upload the transaction screenshot in the registration form. Our team verifies payments promptly and your QR Event Pass will be issued immediately!',
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

  // 4. Upload Payment Screenshot with Sanitization & Whitelisting
  async uploadPaymentProof(file: File, teamIdentifier: string): Promise<string> {
    try {
      const rawExt = (file.name.split('.').pop() || '').toLowerCase();
      // Whitelist only safe image extensions
      const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'png';
      // Path traversal protection: strip all non-alphanumeric chars
      const safeIdentifier = teamIdentifier.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'team';
      const fileName = `${safeIdentifier}-${Date.now()}.${safeExt}`;
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

  // 8. Export CSV with Formula Injection (CWE-1236) Protection
  exportCSV(registrations: HackathonRegistration[]) {
    // Neutralize dangerous spreadsheet formulas (=, +, -, @)
    const sanitizeCsv = (val: any): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        return `"'${str}"`;
      }
      return `"${str}"`;
    };

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
      sanitizeCsv(r.team_id),
      sanitizeCsv(r.team_name),
      sanitizeCsv(r.leader_name),
      sanitizeCsv(r.email),
      sanitizeCsv(r.phone),
      sanitizeCsv(r.college),
      sanitizeCsv(r.year),
      sanitizeCsv(r.branch),
      sanitizeCsv(r.track),
      r.team_members?.length ? r.team_members.length + 1 : 1,
      sanitizeCsv(r.team_members?.map((m) => `${m.name} (${m.email})`).join('; ') || 'Solo/None'),
      sanitizeCsv(r.registration_phase),
      r.amount,
      sanitizeCsv(r.payment_status),
      sanitizeCsv(new Date(r.created_at).toLocaleString()),
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

  // 9. Participant Project Submissions
  async submitProject(payload: {
    team_id: string;
    team_name: string;
    leader_name: string;
    leader_email: string;
    project_title: string;
    track: string;
    tagline: string;
    description: string;
    ai_tools: string[];
    tech_stack: string[];
    github_url: string;
    demo_url?: string;
    video_url?: string;
    presentation_url?: string;
  }): Promise<{ data: ProjectSubmission | null; error: string | null }> {
    const newSubmission: ProjectSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      team_id: payload.team_id.trim(),
      team_name: payload.team_name.trim(),
      leader_name: payload.leader_name.trim(),
      leader_email: payload.leader_email.trim(),
      project_title: payload.project_title.trim(),
      track: payload.track,
      tagline: payload.tagline.trim(),
      description: payload.description.trim(),
      ai_tools: payload.ai_tools || [],
      tech_stack: payload.tech_stack || [],
      github_url: payload.github_url.trim(),
      demo_url: payload.demo_url?.trim() || undefined,
      video_url: payload.video_url?.trim() || undefined,
      presentation_url: payload.presentation_url?.trim() || undefined,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('hackathon_project_submissions' as any)
        .insert([newSubmission])
        .select()
        .single();

      if (error) {
        console.warn('Supabase submission insert error, saving to local storage fallback:', error.message);
        const local = this.getLocalSubmissions();
        const existingIdx = local.findIndex((s) => s.team_id.toLowerCase() === newSubmission.team_id.toLowerCase());
        if (existingIdx >= 0) {
          local[existingIdx] = newSubmission;
        } else {
          local.unshift(newSubmission);
        }
        localStorage.setItem('cva_hackathon_submissions', JSON.stringify(local));
        return { data: newSubmission, error: null };
      }

      // Also mirror locally
      const local = this.getLocalSubmissions();
      local.unshift(data as unknown as ProjectSubmission);
      localStorage.setItem('cva_hackathon_submissions', JSON.stringify(local));
      return { data: data as unknown as ProjectSubmission, error: null };
    } catch {
      const local = this.getLocalSubmissions();
      const existingIdx = local.findIndex((s) => s.team_id.toLowerCase() === newSubmission.team_id.toLowerCase());
      if (existingIdx >= 0) {
        local[existingIdx] = newSubmission;
      } else {
        local.unshift(newSubmission);
      }
      localStorage.setItem('cva_hackathon_submissions', JSON.stringify(local));
      return { data: newSubmission, error: null };
    }
  },

  getLocalSubmissions(): ProjectSubmission[] {
    const raw = localStorage.getItem('cva_hackathon_submissions');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async getProjectSubmissions(): Promise<ProjectSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('hackathon_project_submissions' as any)
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error || !data) {
        return this.getLocalSubmissions();
      }

      // Merge remote and local
      const local = this.getLocalSubmissions();
      const combined = [...(data as unknown as ProjectSubmission[])];
      for (const loc of local) {
        if (!combined.some((c) => c.team_id === loc.team_id)) {
          combined.push(loc);
        }
      }
      return combined;
    } catch {
      return this.getLocalSubmissions();
    }
  },

  async getProjectSubmissionByTeamId(teamId: string): Promise<ProjectSubmission | null> {
    const cleanId = teamId.trim().toLowerCase();
    try {
      const { data, error } = await supabase
        .from('hackathon_project_submissions' as any)
        .select('*')
        .ilike('team_id', cleanId)
        .single();

      if (!error && data) {
        return data as unknown as ProjectSubmission;
      }
    } catch {}

    const local = this.getLocalSubmissions();
    return local.find((s) => s.team_id.toLowerCase() === cleanId) || null;
  },

  exportSubmissionsCSV(submissions: ProjectSubmission[]) {
    const sanitizeCsv = (val: any): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        return `"'${str}"`;
      }
      return `"${str}"`;
    };

    const headers = [
      'Team ID',
      'Team Name',
      'Leader Name',
      'Leader Email',
      'Project Title',
      'Track',
      'Tagline',
      'Description',
      'AI Tools',
      'Tech Stack',
      'GitHub Repository',
      'Live Demo URL',
      'Video URL',
      'Presentation URL',
      'Status',
      'Submission Timestamp',
    ];

    const rows = submissions.map((s) => [
      sanitizeCsv(s.team_id),
      sanitizeCsv(s.team_name),
      sanitizeCsv(s.leader_name),
      sanitizeCsv(s.leader_email),
      sanitizeCsv(s.project_title),
      sanitizeCsv(s.track),
      sanitizeCsv(s.tagline),
      sanitizeCsv(s.description),
      sanitizeCsv(s.ai_tools?.join(', ') || ''),
      sanitizeCsv(s.tech_stack?.join(', ') || ''),
      sanitizeCsv(s.github_url),
      sanitizeCsv(s.demo_url || ''),
      sanitizeCsv(s.video_url || ''),
      sanitizeCsv(s.presentation_url || ''),
      sanitizeCsv(s.status),
      sanitizeCsv(new Date(s.submitted_at).toLocaleString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `community_va_project_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export interface ProjectSubmission {
  id: string;
  team_id: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  project_title: string;
  track: string;
  tagline: string;
  description: string;
  ai_tools: string[];
  tech_stack: string[];
  github_url: string;
  demo_url?: string;
  video_url?: string;
  presentation_url?: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'winner';
  submitted_at: string;
  updated_at?: string;
}

