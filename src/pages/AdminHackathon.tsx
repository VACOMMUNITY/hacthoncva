import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Search,
  ExternalLink,
  Flame,
  Save,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  UploadCloud,
  Code2,
  Globe,
  Video,
  Presentation,
  Github,
  Mail,
  Phone,
  Copy,
  UserCheck,
  QrCode,
  Ticket,
  PlusCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  hackathonService,
  HackathonRegistration,
  HackathonSettings,
  ProjectSubmission,
} from '@/services/hackathonService';

export const AdminHackathon: React.FC = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<HackathonRegistration[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [settings, setSettings] = useState<HackathonSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'cva-hackathon-2026'>('all');

  // Proof Modal
  const [selectedProofReg, setSelectedProofReg] = useState<HackathonRegistration | null>(null);

  // Full Team & Members Details Modal
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<HackathonRegistration | null>(null);

  // Reject Dialog
  const [rejectingReg, setRejectingReg] = useState<HackathonRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment receipt could not be verified.');

  // Quick Pass Lookup & Admit Modal State
  const [isPassLookupOpen, setIsPassLookupOpen] = useState(false);
  const [passLookupQuery, setPassLookupQuery] = useState('');

  // Manual Team Admit State
  const [manualTeamModalOpen, setManualTeamModalOpen] = useState(false);
  const [manTeamName, setManTeamName] = useState('');
  const [manLeaderName, setManLeaderName] = useState('');
  const [manPhone, setManPhone] = useState('');
  const [manEmail, setManEmail] = useState('');
  const [manCollege, setManCollege] = useState('');
  const [manBranch, setManBranch] = useState('CSE');
  const [manYear, setManYear] = useState('3rd Year');
  const [manTrack, setManTrack] = useState('Education AI');
  const [manTeamId, setManTeamId] = useState('');
  const [manTeammates, setManTeammates] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Settings Form State
  const [eventDate, setEventDate] = useState('');
  const [countdownTarget, setCountdownTarget] = useState('');
  const [earlyBirdRemaining, setEarlyBirdRemaining] = useState(31);
  const [earlyBirdPrice, setEarlyBirdPrice] = useState(299);
  const [regularPrice, setRegularPrice] = useState(299);
  const [lastMinutePrice, setLastMinutePrice] = useState(399);
  const [prizeWinner, setPrizeWinner] = useState(10000);
  const [prizeRunnerUp, setPrizeRunnerUp] = useState(5000);
  const [prizeSecondRunnerUp, setPrizeSecondRunnerUp] = useState(3000);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [regs, cfg, subs] = await Promise.all([
        hackathonService.getRegistrations(),
        hackathonService.getSettings(),
        hackathonService.getProjectSubmissions(),
      ]);
      setRegistrations(regs);
      setSettings(cfg);
      setSubmissions(subs);

      setEventDate(cfg.event_date);
      setCountdownTarget(cfg.countdown_target);
      setEarlyBirdRemaining(cfg.early_bird_remaining);
      setEarlyBirdPrice(cfg.early_bird_price);
      setRegularPrice(cfg.regular_price);
      setLastMinutePrice(cfg.last_minute_price);
      setPrizeWinner(cfg.prize_winner);
      setPrizeRunnerUp(cfg.prize_runner_up);
      setPrizeSecondRunnerUp(cfg.prize_second_runner_up);
      setFaqs(cfg.faqs || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for live updates whenever a team registers or submits in any tab/window
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('cva_data_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('cva_hackathon_channel');
        channel.onmessage = () => handleUpdate();
      } catch {}
    }

    return () => {
      window.removeEventListener('cva_data_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      try {
        channel?.close();
      } catch {}
    };
  }, []);

  // Stats Calculations
  const totalTeams = registrations.length;
  const approvedTeams = registrations.filter((r) => r.payment_status === 'approved');
  const pendingTeams = registrations.filter((r) => r.payment_status === 'pending');
  const totalRevenue = approvedTeams.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered List with safe null checks
  const filteredRegistrations = registrations.filter((r) => {
    if (!r) return false;
    const matchesStatus =
      statusFilter === 'all' ? true : r.payment_status === statusFilter;
    const matchesEvent =
      eventFilter === 'all' ? true : ((r as any).event_id ? (r as any).event_id === eventFilter : true);
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      Boolean(r.team_name && r.team_name.toLowerCase().includes(q)) ||
      Boolean(r.leader_name && r.leader_name.toLowerCase().includes(q)) ||
      Boolean(r.email && r.email.toLowerCase().includes(q)) ||
      Boolean(r.team_id && r.team_id.toLowerCase().includes(q)) ||
      Boolean(r.college && r.college.toLowerCase().includes(q));
    return matchesStatus && matchesEvent && matchesQuery;
  });

  const handleCreateSampleRegistration = async () => {
    try {
      const sample = await hackathonService.registerTeam({
        team_name: 'Neural Innovators',
        leader_name: 'Abhi Ram',
        phone: '9849046019',
        email: 'abhiram@community.va',
        college: 'Community Institute of Technology',
        year: '3rd Year',
        branch: 'Computer Science & AI',
        track: 'Open Innovation',
        team_members: [
          { name: 'Kavya Sharma', email: 'kavya@gmail.com', role: 'ML Engineer' },
          { name: 'Rahul Varma', email: 'rahul@gmail.com', role: 'Frontend Dev' },
        ],
        registration_phase: 'Early Bird',
        amount: 299,
        transaction_id: 'UPI9849046019PAY299',
        payment_status: 'pending',
      });
      toast({
        title: 'Sample Registration Created! 🎉',
        description: `Team ${sample.team_name} (${sample.team_id}) is now listed in the dashboard.`,
      });
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create sample registration.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveManualTeam = async () => {
    if (!manTeamName.trim() || !manLeaderName.trim() || !manCollege.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please provide Team Name, Leader Name, and College.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingManual(true);
    try {
      const teammateList = manTeammates
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name, i) => ({
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
          role: `Member #${i + 2}`,
        }));

      const teamCode = manTeamId.trim() || `CVA-HACK-${Math.floor(1000 + Math.random() * 9000)}`;

      await hackathonService.registerTeam({
        team_name: manTeamName.trim(),
        leader_name: manLeaderName.trim(),
        phone: manPhone.trim() || '9849046019',
        email: manEmail.trim().toLowerCase() || `${manLeaderName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        college: manCollege.trim(),
        year: manYear,
        branch: manBranch.trim() || 'Engineering',
        track: manTrack,
        team_members: [
          {
            name: manLeaderName.trim(),
            email: manEmail.trim().toLowerCase() || `${manLeaderName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
            role: 'Team Leader',
          },
          ...teammateList,
        ],
        registration_phase: 'Early Bird',
        amount: 299,
        payment_status: 'approved',
        transaction_id: `VERIFIED-PASS-${teamCode}`,
      });

      toast({
        title: 'Team Successfully Admitted! 🎉',
        description: `${manTeamName} (${teamCode}) is now registered and verified in the dashboard.`,
      });

      setManualTeamModalOpen(false);
      setManTeamName('');
      setManLeaderName('');
      setManPhone('');
      setManEmail('');
      setManCollege('');
      setManTeamId('');
      setManTeammates('');
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to admit team.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Actions
  const handleApprove = async (reg: HackathonRegistration) => {
    try {
      await hackathonService.updateStatus(reg.id, 'approved');
      toast({
        title: 'Team Approved & Verified! 🎉',
        description: `${reg.team_name} (${reg.team_id}) is marked as paid and can download ticket pass.`,
      });
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to approve registration.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingReg) return;
    try {
      await hackathonService.updateStatus(
        rejectingReg.id,
        'rejected',
        rejectionReason
      );
      toast({
        title: 'Registration Rejected',
        description: `${rejectingReg.team_name} status updated to rejected.`,
      });
      setRejectingReg(null);
      loadData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reject registration.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await hackathonService.updateSettings({
        event_date: eventDate,
        countdown_target: countdownTarget,
        early_bird_remaining: Number(earlyBirdRemaining),
        early_bird_price: Number(earlyBirdPrice),
        regular_price: Number(regularPrice),
        last_minute_price: Number(lastMinutePrice),
        prize_winner: Number(prizeWinner),
        prize_runner_up: Number(prizeRunnerUp),
        prize_second_runner_up: Number(prizeSecondRunnerUp),
        faqs,
      });

      toast({
        title: 'Settings Saved Successfully!',
        description: 'Landing page and live counters updated immediately.',
      });
      loadData();
    } catch {
      toast({
        title: 'Error Saving Settings',
        description: 'Could not update hackathon settings.',
        variant: 'destructive',
      });
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: 'New Question?', answer: 'Answer here...' }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (
    index: number,
    field: 'question' | 'answer',
    val: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Hackathon 2026 Management"
          description="Manage AI Innovation Hackathon registrations, approve payments, export CSV, and edit live content."
        />
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <a href="/hackathon-2026" target="_blank" rel="noreferrer">
            <Button size="sm" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> View Landing Page
            </Button>
          </a>
        </div>
      </div>

      {/* DASHBOARD STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Teams"
          value={totalTeams}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<IndianRupee className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          title="Pending Payments"
          value={pendingTeams.length}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />
        <StatCard
          title="Approved Teams"
          value={approvedTeams.length}
          icon={<CheckCircle className="h-5 w-5 text-cyan-500" />}
        />
        <StatCard
          title="Projects Submitted"
          value={submissions.length}
          icon={<UploadCloud className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Early Bird Left"
          value={settings?.early_bird_remaining ?? 31}
          icon={<Flame className="h-5 w-5 text-red-500" />}
        />
      </div>

      {/* TABS: REGISTRATIONS, SUBMISSIONS, CONTENT */}
      <Tabs defaultValue="registrations" className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          <TabsTrigger value="content">Content & Settings</TabsTrigger>
        </TabsList>

        {/* TAB 1: REGISTRATIONS MANAGEMENT */}
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg">Registered Teams</CardTitle>
                <CardDescription>
                  Review payment screenshots, approve verified registrations, or reject with feedback.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPassLookupOpen(true)}
                  className="flex items-center gap-1.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold"
                >
                  <QrCode className="h-3.5 w-3.5" /> Look up Pass
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManualTeamModalOpen(true)}
                  className="flex items-center gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> + Admit Team
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => hackathonService.exportCSV(registrations)}
                  className="flex items-center gap-2 text-xs"
                >
                  <Download className="h-4 w-4" /> Export CSV ({registrations.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by team, leader, email, college, or Team ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(val: any) => setStatusFilter(val)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending Verification</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={eventFilter}
                  onValueChange={(val: any) => setEventFilter(val)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="cva-hackathon-2026">AI Hackathon 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">Team Details</th>
                      <th className="p-3">Leader & Contact</th>
                      <th className="p-3">College & Track</th>
                      <th className="p-3">Members</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Proof</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-foreground">{reg.team_name}</div>
                            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
                              {reg.team_id}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-foreground">{reg.leader_name}</div>
                            <div className="text-xs text-muted-foreground">{reg.email}</div>
                            <div className="text-xs text-muted-foreground">{reg.phone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium truncate max-w-[160px]">
                              {reg.college}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {reg.year} • {reg.branch}
                            </div>
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {reg.track}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setSelectedTeamForDetails(reg)}
                              className="text-left group hover:opacity-90 transition-all p-1.5 rounded-lg hover:bg-muted/60 -ml-1.5"
                              title="Click to view all member names, emails, phones & roles"
                            >
                              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {(reg.team_members?.length || 0) + 1} Members
                              </div>
                              <div className="text-[11px] text-muted-foreground max-w-[170px] truncate mt-0.5">
                                <span className="font-semibold text-foreground">{reg.leader_name}</span>
                                {reg.team_members && reg.team_members.length > 0
                                  ? `, ${reg.team_members.map((m) => m.name).join(', ')}`
                                  : ' (Solo)'}
                              </div>
                              <span className="text-[10px] text-primary font-medium block mt-0.5">View Members Details →</span>
                            </button>
                          </td>
                          <td className="p-3 font-mono font-bold">
                            ₹{reg.amount}
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {reg.registration_phase}
                            </span>
                          </td>
                          <td className="p-3">
                            {reg.payment_screenshot_url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProofReg(reg)}
                                className="h-8 px-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 text-xs flex items-center gap-1 font-medium"
                              >
                                <Eye className="h-3.5 w-3.5" /> View Proof
                              </Button>
                            ) : reg.transaction_id ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProofReg(reg)}
                                className="h-8 px-2 text-amber-500 hover:text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1 font-mono"
                              >
                                <Eye className="h-3.5 w-3.5" /> Txn: {reg.transaction_id.slice(0, 8)}...
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">No proof</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                reg.payment_status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : reg.payment_status === 'rejected'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {reg.payment_status === 'approved'
                                ? 'Approved'
                                : reg.payment_status === 'rejected'
                                ? 'Rejected'
                                : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTeamForDetails(reg)}
                                className="h-7 text-xs border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1 font-medium"
                                title="View full team members details"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Details
                              </Button>
                              {reg.payment_status !== 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(reg)}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                  Approve
                                </Button>
                              )}
                              {reg.payment_status !== 'rejected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRejectingReg(reg)}
                                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                >
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground space-y-3">
                          <p className="text-sm">No registrations found matching criteria.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateSampleRegistration}
                            className="text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                          >
                            + Add Sample Team Registration
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PROJECT SUBMISSIONS */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg">Hackathon Project Submissions</CardTitle>
                <CardDescription>
                  Review participant code repositories, live demo URLs, pitch decks, and AI tool usage.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => hackathonService.exportSubmissionsCSV(submissions)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Submissions CSV ({submissions.length})
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions by project title, team name, track, or tech stack..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Submissions Table */}
              <div className="rounded-md border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left font-medium text-muted-foreground">
                      <th className="p-3">Team & Project</th>
                      <th className="p-3">Track</th>
                      <th className="p-3">Pitch / Tagline</th>
                      <th className="p-3">AI Tools & Tech</th>
                      <th className="p-3">Deliverables</th>
                      <th className="p-3">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {submissions.filter((s) => {
                      const q = submissionSearch.toLowerCase();
                      return (
                        !q ||
                        s.project_title.toLowerCase().includes(q) ||
                        s.team_name.toLowerCase().includes(q) ||
                        s.team_id.toLowerCase().includes(q) ||
                        s.track.toLowerCase().includes(q) ||
                        s.tagline.toLowerCase().includes(q) ||
                        s.ai_tools?.some((t) => t.toLowerCase().includes(q))
                      );
                    }).length > 0 ? (
                      submissions
                        .filter((s) => {
                          const q = submissionSearch.toLowerCase();
                          return (
                            !q ||
                            s.project_title.toLowerCase().includes(q) ||
                            s.team_name.toLowerCase().includes(q) ||
                            s.team_id.toLowerCase().includes(q) ||
                            s.track.toLowerCase().includes(q) ||
                            s.tagline.toLowerCase().includes(q) ||
                            s.ai_tools?.some((t) => t.toLowerCase().includes(q))
                          );
                        })
                        .map((sub) => (
                          <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-foreground text-sm">{sub.project_title}</div>
                              <div className="text-xs text-primary font-mono">{sub.team_name} ({sub.team_id})</div>
                              <div className="text-[11px] text-muted-foreground">{sub.leader_name} • {sub.leader_email}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30 whitespace-nowrap">
                                {sub.track}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs">
                              <div className="font-medium text-xs text-foreground line-clamp-1">{sub.tagline}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{sub.description}</div>
                            </td>
                            <td className="p-3 max-w-[200px]">
                              <div className="flex flex-wrap gap-1">
                                {sub.ai_tools?.slice(0, 3).map((t, idx) => (
                                  <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">
                                    {t}
                                  </span>
                                ))}
                                {sub.ai_tools?.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground">+{sub.ai_tools.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {sub.github_url && (
                                  <a href={sub.github_url} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs flex items-center gap-1">
                                      <Github className="h-3.5 w-3.5" /> Code
                                    </Button>
                                  </a>
                                )}
                                {sub.demo_url && (
                                  <a href={sub.demo_url} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 flex items-center gap-1">
                                      <Globe className="h-3.5 w-3.5" /> Demo
                                    </Button>
                                  </a>
                                )}
                                {sub.video_url && (
                                  <a href={sub.video_url} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-1">
                                      <Video className="h-3.5 w-3.5" /> Video
                                    </Button>
                                  </a>
                                )}
                                {sub.presentation_url && (
                                  <a href={sub.presentation_url} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10 flex items-center gap-1">
                                      <Presentation className="h-3.5 w-3.5" /> Slides
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                              {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No project submissions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CONTENT & SETTINGS MANAGEMENT */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Schedule & Live Counters</CardTitle>
              <CardDescription>
                Changes made here immediately update the hackathon countdown, date banners, and spots left counter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Event Date Display</Label>
                  <Input
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="9 October 2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Countdown Target (ISO Timestamp)</Label>
                  <Input
                    value={countdownTarget}
                    onChange={(e) => setCountdownTarget(e.target.value)}
                    placeholder="2026-10-09T09:00:00.000Z"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-amber-500 font-bold flex items-center gap-1.5">
                    <Flame className="h-4 w-4" /> Early Bird Spots Remaining
                  </Label>
                  <Input
                    type="number"
                    value={earlyBirdRemaining}
                    onChange={(e) => setEarlyBirdRemaining(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Directly updates the "X / 50 Spots Left" counter on the landing page.
                  </p>
                </div>
              </div>

              {/* Pricing Settings */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-sm mb-3">Registration Tier Pricing (₹)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Early Bird Price (₹)</Label>
                    <Input
                      type="number"
                      value={earlyBirdPrice}
                      onChange={(e) => setEarlyBirdPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Regular Price (₹)</Label>
                    <Input
                      type="number"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Minute Price (₹)</Label>
                    <Input
                      type="number"
                      value={lastMinutePrice}
                      onChange={(e) => setLastMinutePrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Prize Pool Settings */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-sm mb-3">Prize Amounts (₹)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Winner Prize (₹)</Label>
                    <Input
                      type="number"
                      value={prizeWinner}
                      onChange={(e) => setPrizeWinner(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Runner-Up Prize (₹)</Label>
                    <Input
                      type="number"
                      value={prizeRunnerUp}
                      onChange={(e) => setPrizeRunnerUp(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Second Runner-Up (₹)</Label>
                    <Input
                      type="number"
                      value={prizeSecondRunnerUp}
                      onChange={(e) => setPrizeSecondRunnerUp(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Management */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">FAQ Accordions</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddFaq}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add FAQ
                  </Button>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-border bg-muted/40 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold">Question #{idx + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFaq(idx)}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                        placeholder="FAQ question"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                        placeholder="FAQ answer"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSettings}
                  size="lg"
                  className="flex items-center gap-2 px-8"
                >
                  <Save className="h-4 w-4" /> Save All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* VIEW PAYMENT PROOF MODAL */}
      <Dialog open={!!selectedProofReg} onOpenChange={() => setSelectedProofReg(null)}>
        <DialogContent className="max-w-2xl bg-slate-950 text-white border-cyan-500/30 max-h-[90vh] overflow-y-auto">
          {selectedProofReg && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    Payment Proof • {selectedProofReg.team_name}
                  </DialogTitle>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedProofReg.payment_status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedProofReg.payment_status === 'rejected'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {selectedProofReg.payment_status.toUpperCase()}
                  </span>
                </div>
                <DialogDescription className="text-slate-400 text-xs">
                  Team ID: <span className="font-mono text-cyan-400 font-semibold">{selectedProofReg.team_id}</span> • Leader: {selectedProofReg.leader_name} ({selectedProofReg.phone}) • Amount: <span className="font-bold text-white">₹{selectedProofReg.amount}</span> ({selectedProofReg.registration_phase})
                </DialogDescription>
              </DialogHeader>

              {/* Transaction ID if specified */}
              {selectedProofReg.transaction_id && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 font-medium">UPI Ref / Transaction ID:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm select-all">
                    {selectedProofReg.transaction_id}
                  </span>
                </div>
              )}

              {/* Screenshot display */}
              {selectedProofReg.payment_screenshot_url ? (
                <div className="space-y-3">
                  <div className="p-2 flex items-center justify-center bg-black/80 rounded-xl border border-slate-800 overflow-hidden">
                    <img
                      src={selectedProofReg.payment_screenshot_url}
                      alt={`Payment proof for ${selectedProofReg.team_name}`}
                      className="max-h-[55vh] object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedProofReg.payment_screenshot_url, '_blank')}
                      className="text-xs flex items-center gap-1.5 border-slate-700 hover:bg-slate-800 text-slate-200"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-cyan-400" /> Open Full Image
                    </Button>
                    <a
                      href={selectedProofReg.payment_screenshot_url}
                      download={`payment-proof-${selectedProofReg.team_id}.png`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1.5 border-slate-700 hover:bg-slate-800 text-slate-200"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-400" /> Download Proof
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-muted-foreground space-y-2">
                  <p className="text-sm">No payment screenshot image uploaded for this registration.</p>
                  {selectedProofReg.transaction_id && (
                    <p className="text-xs text-slate-300">
                      Verify through UPI Ref ID: <span className="font-mono text-cyan-400">{selectedProofReg.transaction_id}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Quick Actions in Proof Modal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                {selectedProofReg.payment_status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const regToApprove = selectedProofReg;
                      setSelectedProofReg(null);
                      handleApprove(regToApprove);
                    }}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve Payment
                  </Button>
                )}
                {selectedProofReg.payment_status !== 'rejected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const regToReject = selectedProofReg;
                      setSelectedProofReg(null);
                      setRejectingReg(regToReject);
                    }}
                    className="h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProofReg(null)}
                  className="h-8 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW FULL TEAM & MEMBERS DETAILS MODAL */}
      <Dialog open={!!selectedTeamForDetails} onOpenChange={() => setSelectedTeamForDetails(null)}>
        <DialogContent className="max-w-3xl bg-slate-950 text-white border-cyan-500/30 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          {selectedTeamForDetails && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl font-black text-white">
                        {selectedTeamForDetails.team_name}
                      </DialogTitle>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          selectedTeamForDetails.payment_status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : selectedTeamForDetails.payment_status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {selectedTeamForDetails.payment_status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                      <span className="font-mono text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {selectedTeamForDetails.team_id}
                      </span>
                      <span>•</span>
                      <span>Registered on {new Date(selectedTeamForDetails.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{selectedTeamForDetails.registration_phase} (₹{selectedTeamForDetails.amount})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allInfo = [
                          `Team: ${selectedTeamForDetails.team_name} (${selectedTeamForDetails.team_id})`,
                          `Leader: ${selectedTeamForDetails.leader_name} (${selectedTeamForDetails.email} / ${selectedTeamForDetails.phone})`,
                          `College: ${selectedTeamForDetails.college} - ${selectedTeamForDetails.branch} (${selectedTeamForDetails.year})`,
                          `Track: ${selectedTeamForDetails.track}`,
                          `Members (${(selectedTeamForDetails.team_members?.length || 0) + 1}):`,
                          `1. ${selectedTeamForDetails.leader_name} (Lead) - ${selectedTeamForDetails.email} / ${selectedTeamForDetails.phone}`,
                          ...(selectedTeamForDetails.team_members || []).map((m, idx) => `${idx + 2}. ${m.name} (${m.role || 'Member'}) - ${m.email}${m.phone ? ` / ${m.phone}` : ''}`)
                        ].join('\n');
                        navigator.clipboard.writeText(allInfo);
                        toast({ title: 'Copied!', description: 'All team & member details copied to clipboard.' });
                      }}
                      className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5 text-cyan-400" /> Copy All Details
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* TEAM METADATA SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">College / University</span>
                  <span className="font-semibold text-white text-sm">{selectedTeamForDetails.college}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year & Branch</span>
                  <span className="font-semibold text-white text-sm">{selectedTeamForDetails.year} • {selectedTeamForDetails.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Chosen Track</span>
                  <span className="font-semibold text-cyan-400 text-sm">{selectedTeamForDetails.track}</span>
                </div>
              </div>

              {/* REGISTERED MEMBERS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    Registered Members ({(selectedTeamForDetails.team_members?.length || 0) + 1} Total)
                  </h4>
                  <span className="text-xs text-muted-foreground">Team Size: 2–4 Members</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Member 1: Leader */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        👑 Team Leader
                      </span>
                      <span className="text-xs text-slate-400">Member #1</span>
                    </div>
                    <div className="text-base font-bold text-white">{selectedTeamForDetails.leader_name}</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <a href={`mailto:${selectedTeamForDetails.email}`} className="hover:underline hover:text-cyan-300 truncate">
                          {selectedTeamForDetails.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <a href={`tel:${selectedTeamForDetails.phone}`} className="hover:underline hover:text-cyan-300 font-mono">
                          {selectedTeamForDetails.phone}
                        </a>
                        <a
                          href={`https://wa.me/91${selectedTeamForDetails.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-[10px] text-emerald-400 hover:underline"
                        >
                          WhatsApp ↗
                        </a>
                      </div>
                    </div>
                    {(selectedTeamForDetails.github_url || selectedTeamForDetails.linkedin_url) && (
                      <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs">
                        {selectedTeamForDetails.github_url && (
                          <a href={selectedTeamForDetails.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]">
                            <Github className="h-3 w-3" /> GitHub
                          </a>
                        )}
                        {selectedTeamForDetails.linkedin_url && (
                          <a href={selectedTeamForDetails.linkedin_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]">
                            <ExternalLink className="h-3 w-3" /> LinkedIn
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Registered Teammates */}
                  {selectedTeamForDetails.team_members && selectedTeamForDetails.team_members.length > 0 ? (
                    selectedTeamForDetails.team_members.map((member, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            👤 Teammate #{idx + 2}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {member.role || 'Developer'}
                          </span>
                        </div>
                        <div className="text-base font-bold text-white">{member.name || `Teammate ${idx + 2}`}</div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            <a href={`mailto:${member.email}`} className="hover:underline hover:text-purple-300 truncate">
                              {member.email}
                            </a>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                              <a href={`tel:${member.phone}`} className="hover:underline hover:text-purple-300 font-mono">
                                {member.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 flex items-center justify-center text-center text-slate-500 text-xs">
                      Solo Participant or Additional Teammates Not Registered Yet.
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT & PROOF VERIFICATION SECTION */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                    Payment Details & Verification Proof
                  </h4>
                  {selectedTeamForDetails.payment_screenshot_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProofReg(selectedTeamForDetails);
                      }}
                      className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Full Screenshot Proof
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fee Paid</span>
                    <span className="font-bold text-white text-sm">₹{selectedTeamForDetails.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">UPI Transaction ID</span>
                    <span className="font-mono text-cyan-300 font-bold select-all">
                      {selectedTeamForDetails.transaction_id || 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Verification Status</span>
                    <span className="font-semibold capitalize text-slate-200">
                      {selectedTeamForDetails.payment_status}
                    </span>
                  </div>
                </div>

                {selectedTeamForDetails.payment_screenshot_url && (
                  <div className="pt-2 flex items-center gap-3">
                    <div
                      className="h-20 w-32 rounded-lg bg-black/60 border border-slate-700 overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => setSelectedProofReg(selectedTeamForDetails)}
                    >
                      <img
                        src={selectedTeamForDetails.payment_screenshot_url}
                        alt="Payment receipt preview"
                        className="h-full w-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="text-slate-300 font-medium">Receipt Screenshot Uploaded</div>
                      <p className="text-[11px] text-slate-500">Click to view full image, zoom, or download proof.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProofReg(selectedTeamForDetails)}
                        className="h-6 text-[11px] text-cyan-400 border-cyan-500/30"
                      >
                        Inspect Proof Screenshot
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {selectedTeamForDetails.payment_status !== 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const t = selectedTeamForDetails;
                        setSelectedTeamForDetails(null);
                        handleApprove(t);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve Registration
                    </Button>
                  )}
                  {selectedTeamForDetails.payment_status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const t = selectedTeamForDetails;
                        setSelectedTeamForDetails(null);
                        setRejectingReg(t);
                      }}
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject Registration
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTeamForDetails(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECT REGISTRATION MODAL */}
      <Dialog open={!!rejectingReg} onOpenChange={() => setRejectingReg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectingReg?.team_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why payment could not be verified..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectingReg(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QUICK PASS LOOKUP MODAL */}
      <Dialog open={isPassLookupOpen} onOpenChange={setIsPassLookupOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border border-cyan-500/30 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <QrCode className="h-5 w-5 text-cyan-400" /> Look up Event Pass or Team ID
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Enter any Team ID (e.g. CVA-HACK-6184), team name, or leader name to instantly fetch their pass and verification status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Team ID, Name, or Leader</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="e.g. CVA-HACK-6184 or DATA DRIFT"
                  value={passLookupQuery}
                  onChange={(e) => setPassLookupQuery(e.target.value)}
                  className="pl-9 bg-slate-900 border-slate-700 text-white font-mono text-sm focus:border-cyan-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Live Search Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(() => {
                const q = passLookupQuery.trim().toLowerCase();
                const matches = q
                  ? registrations.filter(
                      (r) =>
                        r.team_id.toLowerCase().includes(q) ||
                        r.team_name.toLowerCase().includes(q) ||
                        r.leader_name.toLowerCase().includes(q) ||
                        r.college.toLowerCase().includes(q)
                    )
                  : registrations.slice(0, 5);

                if (matches.length > 0) {
                  return matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">{m.team_name}</span>
                          <span className="font-mono text-xs text-cyan-400 font-semibold">{m.team_id}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          Leader: <span className="text-slate-200">{m.leader_name}</span> • {m.college}
                        </p>
                        <p className="text-[11px] text-cyan-500/80 font-mono mt-0.5">{m.track}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsPassLookupOpen(false);
                          setSelectedTeamForDetails(m);
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shrink-0"
                      >
                        View Pass Details
                      </Button>
                    </div>
                  ));
                }

                if (q) {
                  return (
                    <div className="text-center p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
                      <p className="text-xs text-slate-400">
                        No team found matching <span className="font-mono text-cyan-400">"{passLookupQuery}"</span>.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setManTeamId(passLookupQuery.toUpperCase());
                          setIsPassLookupOpen(false);
                          setManualTeamModalOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        + Admit Team as "{passLookupQuery.toUpperCase()}"
                      </Button>
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MANUAL ADMIT TEAM MODAL */}
      <Dialog open={manualTeamModalOpen} onOpenChange={setManualTeamModalOpen}>
        <DialogContent className="max-w-lg bg-slate-950 border border-emerald-500/30 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <PlusCircle className="h-5 w-5 text-emerald-400" /> Admit & Verify Team
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Directly admit a participant team with confirmed payment into the admin dashboard and official roster.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Team Name *</Label>
                <Input
                  placeholder="e.g. DATA DRIFT"
                  value={manTeamName}
                  onChange={(e) => setManTeamName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Team ID / Pass Code</Label>
                <Input
                  placeholder="e.g. CVA-HACK-6184"
                  value={manTeamId}
                  onChange={(e) => setManTeamId(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Leader Name *</Label>
                <Input
                  placeholder="e.g. M.SIDDARDHA"
                  value={manLeaderName}
                  onChange={(e) => setManLeaderName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Leader Mobile *</Label>
                <Input
                  placeholder="10-digit phone"
                  value={manPhone}
                  onChange={(e) => setManPhone(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Leader Email</Label>
              <Input
                placeholder="leader@college.edu"
                value={manEmail}
                onChange={(e) => setManEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">College Name *</Label>
                <Input
                  placeholder="e.g. MVSR"
                  value={manCollege}
                  onChange={(e) => setManCollege(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">Branch</Label>
                <Input
                  placeholder="e.g. CSE"
                  value={manBranch}
                  onChange={(e) => setManBranch(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Track</Label>
              <Select value={manTrack} onValueChange={setManTrack}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="Education AI">🎓 Education AI</SelectItem>
                  <SelectItem value="Healthcare AI">🏥 Healthcare AI</SelectItem>
                  <SelectItem value="Agriculture AI">🌱 Agriculture AI</SelectItem>
                  <SelectItem value="Smart City AI">🏙️ Smart City AI</SelectItem>
                  <SelectItem value="Accessibility AI">♿ Accessibility AI</SelectItem>
                  <SelectItem value="Open Innovation">🚀 Open Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Teammate Names (1 per line)</Label>
              <Textarea
                placeholder="Teammate 2&#10;Teammate 3"
                value={manTeammates}
                onChange={(e) => setManTeammates(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white text-xs h-16"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setManualTeamModalOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveManualTeam}
                disabled={isSubmittingManual}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {isSubmittingManual ? 'Admitting...' : 'Admit & Verify Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminHackathon;
