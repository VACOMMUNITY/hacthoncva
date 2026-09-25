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
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  hackathonService,
  HackathonRegistration,
  HackathonSettings,
  ProjectSubmission
} from '@/services/hackathonService';

export const AdminHackathon: React.FC = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<HackathonRegistration[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [settings, setSettings] = useState<HackathonSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Proof Modal
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  // Reject Dialog
  const [rejectingReg, setRejectingReg] = useState<HackathonRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment receipt could not be verified.');

  // Settings Form State
  const [eventDate, setEventDate] = useState('');
  const [countdownTarget, setCountdownTarget] = useState('');
  const [earlyBirdRemaining, setEarlyBirdRemaining] = useState(31);
  const [earlyBirdPrice, setEarlyBirdPrice] = useState(299);
  const [regularPrice, setRegularPrice] = useState(399);
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
        hackathonService.getAllProjectSubmissions(),
      ]);
      setRegistrations(regs);
      setSettings(cfg);
      setSubmissions(subs);

      setEventDate(cfg.event_date);
      setCountdownTarget(cfg.countdown_target);
      setEarlyBirdRemaining(cfg.early_bird_remaining);
      setEarlyBirdPrice(cfg.early_bird_price);
      setRegularPrice(cfg.regular_price);
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
  }, []);

  // Stats Calculations
  const totalTeams = registrations.length;
  const approvedTeams = registrations.filter((r) => r.payment_status === 'approved');
  const pendingTeams = registrations.filter((r) => r.payment_status === 'pending');
  const totalRevenue = approvedTeams.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered List
  const filteredRegistrations = registrations.filter((r) => {
    const matchesStatus =
      statusFilter === 'all' ? true : r.payment_status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      r.team_name.toLowerCase().includes(q) ||
      r.leader_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.team_id.toLowerCase().includes(q) ||
      r.college.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Navbar / Back Link */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <a
            href="/hackathon-2026"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hackathon Portal
          </a>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Control Center
          </div>
        </div>

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
              className="flex items-center gap-2 border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <a href="/hackathon-2026" target="_blank" rel="noreferrer">
              <Button size="sm" className="cyber-button-glow text-slate-950 font-bold flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Open Landing Page
              </Button>
            </a>
          </div>
        </div>

      {/* DASHBOARD STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="Early Bird Left"
          value={settings?.early_bird_remaining ?? 31}
          icon={<Flame className="h-5 w-5 text-red-500" />}
        />
      </div>

      {/* TABS: REGISTRATIONS vs CONTENT MANAGEMENT */}
      <Tabs defaultValue="registrations" className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="registrations">Registration Management</TabsTrigger>
          <TabsTrigger value="submissions">Project Submissions</TabsTrigger>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => hackathonService.exportCSV(registrations)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export CSV ({registrations.length})
              </Button>
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
                            <div className="text-xs font-semibold">
                              {(reg.team_members?.length || 0) + 1} Members
                            </div>
                            <div className="text-[11px] text-muted-foreground max-w-[140px] truncate">
                              {reg.team_members?.map((m) => m.name).join(', ') || 'Solo/None'}
                            </div>
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
                                onClick={() => setViewProofUrl(reg.payment_screenshot_url!)}
                                className="h-8 px-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 text-xs flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" /> View Proof
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {reg.transaction_id ? `ID: ${reg.transaction_id}` : 'No proof'}
                              </span>
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
                            <div className="flex items-center justify-end gap-1.5">
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
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          No registrations found matching criteria.
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
            <CardHeader>
              <CardTitle>Project Submissions</CardTitle>
              <CardDescription>View and review all submitted projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">Team Details</th>
                      <th className="p-3">GitHub</th>
                      <th className="p-3">LinkedIn</th>
                      <th className="p-3">Vercel</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {submissions.length > 0 ? (
                      submissions.map((sub) => {
                        const team = registrations.find(r => r.team_id === sub.team_id);
                        return (
                          <tr key={sub.id || sub.team_id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-foreground">{team?.team_name || 'Unknown Team'}</div>
                              <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
                                {sub.team_id}
                              </div>
                            </td>
                            <td className="p-3">
                              <a href={sub.github_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3"/> View Repo
                              </a>
                            </td>
                            <td className="p-3">
                              <a href={sub.linkedin_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3"/> View Post
                              </a>
                            </td>
                            <td className="p-3">
                              <a href={sub.vercel_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                <ExternalLink className="h-3 w-3"/> View Site
                              </a>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {new Date(sub.submitted_at || Date.now()).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {sub.status || 'SUBMITTED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
      <Dialog open={!!viewProofUrl} onOpenChange={() => setViewProofUrl(null)}>
        <DialogContent className="max-w-xl bg-slate-950 text-white border-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Payment Verification Proof</DialogTitle>
            <DialogDescription>
              Screenshot submitted by participant during UPI payment checkout.
            </DialogDescription>
          </DialogHeader>
          {viewProofUrl && (
            <div className="p-2 flex items-center justify-center bg-black/60 rounded-xl overflow-hidden">
              <img
                src={viewProofUrl}
                alt="Payment proof screenshot"
                className="max-h-[70vh] object-contain rounded-lg"
              />
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
      </div>
    </div>
  );
};
export default AdminHackathon;
