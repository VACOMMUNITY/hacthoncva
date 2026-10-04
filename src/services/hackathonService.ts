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
const STORAGE_KEY_SUBMISSIONS = 'cva_hackathon_submissions';

// Initial verified teams so dashboard is never empty across new devices/browsers
export const DEFAULT_INITIAL_REGISTRATIONS: HackathonRegistration[] = [
  {
    id: 'reg-cva-hack-6184',
    team_id: 'CVA-HACK-6184',
    team_name: 'DATA DRIFT',
    leader_name: 'M.SIDDARDHA',
    phone: '9849046019',
    email: 'siddardha.m@mvsr.ac.in',
    college: 'MVSR Engineering College',
    year: '3rd Year',
    branch: 'CSE (AI & DS)',
    track: 'Education AI',
    team_members: [
      { name: 'M.SIDDARDHA', email: 'siddardha.m@mvsr.ac.in', role: 'Team Leader / AI Engineer' },
      { name: 'Teammate 1', email: 'teammate1@mvsr.ac.in', role: 'Fullstack Developer' },
    ],
    registration_phase: 'Early Bird',
    amount: 299,
    payment_status: 'approved',
    transaction_id: 'UPI-SIDDARDHA-6184',
    qr_ticket_code: 'CVA2026-CVA-HACK-6184',
    created_at: new Date('2026-10-04T08:30:00.000Z').toISOString(),
  },
  {
    id: 'reg-cva-hack-4102',
    team_id: 'CVA-HACK-4102',
    team_name: 'RAM INNOVATORS',
    leader_name: 'Ram',
    phone: '9849046019',
    email: 'ram@mvsr.ac.in',
    college: 'MVSR',
    year: '3rd Year',
    branch: 'CSE',
    track: 'Healthcare AI',
    team_members: [
      { name: 'Ram', email: 'ram@mvsr.ac.in', role: 'Team Leader' },
      { name: 'Teammate', email: 'teammate@mvsr.ac.in', role: 'Developer' },
    ],
    registration_phase: 'Early Bird',
    amount: 299,
    payment_status: 'approved',
    transaction_id: 'UPI-RAM-4102',
    qr_ticket_code: 'CVA2026-CVA-HACK-4102',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// IndexedDB Helper for high-capacity offline/persistent storage (surpasses 5MB quota)
const IDB_NAME = 'cva_hackathon_db';
const IDB_VERSION = 1;
const IDB_STORE_REGISTRATIONS = 'registrations';
const IDB_STORE_SUBMISSIONS = 'submissions';

const openIDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(IDB_STORE_REGISTRATIONS)) {
          db.createObjectStore(IDB_STORE_REGISTRATIONS, { keyPath: 'team_id' });
        }
        if (!db.objectStoreNames.contains(IDB_STORE_SUBMISSIONS)) {
          db.createObjectStore(IDB_STORE_SUBMISSIONS, { keyPath: 'team_id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

const saveToIDB = async (storeName: string, items: any[]): Promise<void> => {
  try {
    const db = await openIDB();
    if (!db) return;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) {
      if (item && item.team_id) {
        store.put(item);
      }
    }
  } catch (err) {
    console.warn('IDB write error:', err);
  }
};

const getFromIDB = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await openIDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

// Cross-tab and window live synchronization
const notifyDataUpdate = (type: 'registration' | 'submission') => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('cva_data_update', { detail: { type } }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('cva_hackathon_channel');
        bc.postMessage({ type });
        bc.close();
      }
    } catch {}
  }
};

// Helper with timeout to prevent dead remote endpoints from stalling UI
const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T | null> => {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
};

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
  // 1. Try to save full data to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(regs));
  } catch (err) {
    console.warn('LocalStorage save error, attempting lightweight fallback:', err);
    try {
      // Keep screenshot only on 3 most recent registrations to fit within 5MB quota
      const lightweight = regs.map((r, idx) => {
        if (idx > 2 && r.payment_screenshot_url?.startsWith('data:')) {
          const { payment_screenshot_url, ...rest } = r;
          return rest as HackathonRegistration;
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(lightweight));
    } catch (e2) {
      console.warn('Secondary localStorage fallback error:', e2);
    }
  }

  // 2. Always persist full data into IndexedDB (virtually unlimited quota)
  saveToIDB(IDB_STORE_REGISTRATIONS, regs);
};

export const hackathonService = {
  // 1. Get Settings
  async getSettings(): Promise<HackathonSettings> {
    try {
      const res: any = await withTimeout(
        supabase
          .from('hackathon_settings' as any)
          .select('*')
          .eq('id', 'config')
          .single(),
        1500
      );

      if (res && !res.error && res.data) {
        return { ...DEFAULT_SETTINGS, ...res.data } as HackathonSettings;
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
      await withTimeout(
        supabase
          .from('hackathon_settings' as any)
          .upsert(updated, { onConflict: 'id' }),
        1500
      );
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

    // Save immediately to local storage cache & IndexedDB
    const currentList = getLocalRegistrations();
    saveLocalRegistrations([newReg, ...currentList]);

    // Notify all open tabs/windows immediately
    notifyDataUpdate('registration');

    // Update remaining early bird spots if applicable
    if (newReg.registration_phase === 'Early Bird') {
      const settings = await this.getSettings();
      if (settings.early_bird_remaining > 0) {
        await this.updateSettings({
          early_bird_remaining: Math.max(0, settings.early_bird_remaining - 1),
        });
      }
    }

    // Try saving to Supabase with timeout
    try {
      await withTimeout(
        supabase
          .from('hackathon_registrations' as any)
          .insert([newReg]),
        2000
      );
    } catch (err) {
      console.warn('Supabase registration insert error (local cached):', err);
    }

    return newReg;
  },

  // 4. Upload Payment Screenshot with Sanitization, Canvas Compression & Whitelisting
  async uploadPaymentProof(file: File, teamIdentifier: string): Promise<string> {
    try {
      const rawExt = (file.name.split('.').pop() || '').toLowerCase();
      const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'png';
      const safeIdentifier = teamIdentifier.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'team';
      const fileName = `${safeIdentifier}-${Date.now()}.${safeExt}`;
      const filePath = `receipts/${fileName}`;

      const uploadPromise = supabase.storage
        .from('hackathon-receipts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      const res: any = await withTimeout(uploadPromise, 1500);

      if (res && !res.error && res.data) {
        const { data: publicUrlData } = supabase.storage
          .from('hackathon-receipts')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, compressing locally:', err);
    }

    // Fallback: Compress image via canvas to 800px max, 0.72 quality (~35-60KB) so it never breaches storage quota
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 850;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.72);
              resolve(compressed);
              return;
            }
          } catch {}
          resolve(e.target?.result as string);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  // 5. Get Registrations
  async getRegistrations(): Promise<HackathonRegistration[]> {
    // 1. Get from localStorage
    const localList = getLocalRegistrations();

    // 2. Get from IndexedDB
    const idbList = await getFromIDB<HackathonRegistration>(IDB_STORE_REGISTRATIONS);

    // 3. Try Supabase with short timeout
    let remoteList: HackathonRegistration[] = [];
    try {
      const res: any = await withTimeout(
        supabase
          .from('hackathon_registrations' as any)
          .select('*')
          .order('created_at', { ascending: false }),
        1800
      );

      if (res && !res.error && res.data && res.data.length > 0) {
        remoteList = res.data as HackathonRegistration[];
      }
    } catch {}

    // 4. Merge all by team_id (seed baseline verified teams so dashboard is never empty)
    const map = new Map<string, HackathonRegistration>();
    DEFAULT_INITIAL_REGISTRATIONS.forEach((r) => { if (r?.team_id) map.set(r.team_id, r); });
    idbList.forEach((r) => { if (r?.team_id) map.set(r.team_id, { ...(map.get(r.team_id) || {}), ...r }); });
    localList.forEach((r) => { if (r?.team_id) map.set(r.team_id, { ...(map.get(r.team_id) || {}), ...r }); });
    remoteList.forEach((r) => { if (r?.team_id) map.set(r.team_id, { ...(map.get(r.team_id) || {}), ...r }); });

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
      'Transaction ID',
      'Payment Proof URL',
      'GitHub URL',
      'LinkedIn URL',
      'Status',
      'Rejection Reason',
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
      sanitizeCsv(r.transaction_id || ''),
      sanitizeCsv(r.payment_screenshot_url || ''),
      sanitizeCsv(r.github_url || ''),
      sanitizeCsv(r.linkedin_url || ''),
      sanitizeCsv(r.payment_status),
      sanitizeCsv(r.rejection_reason || ''),
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

  // 12. Auto-sync any unsynced local registrations to Supabase cloud
  async syncLocalRegistrationsToCloud(): Promise<number> {
    const localList = getLocalRegistrations();
    if (localList.length === 0) return 0;

    let syncedCount = 0;
    try {
      for (const reg of localList) {
        if (!reg?.team_id || reg.team_id.startsWith('CVA-HACK-MOCK')) continue;

        try {
          const res: any = await withTimeout(
            supabase
              .from('hackathon_registrations' as any)
              .upsert(reg, { onConflict: 'team_id' }),
            2000
          );
          if (res && !res.error) {
            syncedCount++;
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Sync to cloud error:', err);
    }
    return syncedCount;
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

