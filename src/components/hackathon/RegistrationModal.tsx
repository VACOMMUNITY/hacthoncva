import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Copy,
  Check,
  Upload,
  UserPlus,
  Trash2,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  hackathonService,
  HackathonRegistration,
  TeamMember,
} from '@/services/hackathonService';
import TicketCanvas from './TicketCanvas';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: 'Early Bird' | 'Regular';
  tierPrice: number;
  earlyBirdRemaining?: number;
  onSuccessRegistration?: (reg: HackathonRegistration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  tierPrice,
  earlyBirdRemaining = 31,
  onSuccessRegistration,
}) => {
  const { toast } = useToast();

  // Wizard Steps: 1: Team & Leader Details, 2: Teammates (2-4), 3: Payment & Screenshot, 4: Confirmation / Pass
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [branch, setBranch] = useState('Computer Science / AI');
  const [track, setTrack] = useState('Education AI');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Teammates: Minimum 1 additional member (total team size 2-4)
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', email: '', role: 'Developer' },
  ]);

  // Payment proof
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Completed registration state
  const [completedRegistration, setCompletedRegistration] =
    useState<HackathonRegistration | null>(null);

  const upiId = '9849046019@ybl';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast({
      title: 'UPI ID Copied',
      description: `${upiId} copied to clipboard`,
    });
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleAddMember = () => {
    if (members.length >= 3) {
      toast({
        title: 'Maximum Team Size Reached',
        description: 'Teams can have at most 4 members (Leader + 3 members).',
        variant: 'destructive',
      });
      return;
    }
    setMembers([...members, { name: '', email: '', role: 'Developer' }]);
  };

  const handleRemoveMember = (idx: number) => {
    if (members.length <= 1) {
      toast({
        title: 'Minimum Team Size',
        description: 'Teams must have at least 2 members (Leader + 1 member).',
      });
      return;
    }
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    }
  };

  // Google OAuth Login
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: 'Google Login',
        description: err.message || 'Unable to connect to Google OAuth',
        variant: 'destructive',
      });
    }
  };

  const validateStep1 = () => {
    if (!teamName.trim() || !leaderName.trim() || !email.trim() || !phone.trim() || !college.trim()) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please complete all team leader & college details.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const emptyMember = members.some((m) => !m.name.trim() || !m.email.trim());
    if (emptyMember) {
      toast({
        title: 'Teammate Information Required',
        description: 'Please provide name and email for each teammate.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleSubmitRegistration = async () => {
    if (!proofFile && !transactionId.trim()) {
      toast({
        title: 'Payment Verification Required',
        description: 'Please upload your UPI payment screenshot or enter the transaction ID.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = '';
      if (proofFile) {
        screenshotUrl = await hackathonService.uploadPaymentProof(
          proofFile,
          teamName.replace(/\s+/g, '-').toLowerCase()
        );
      }

      const newReg = await hackathonService.registerTeam({
        team_name: teamName,
        leader_name: leaderName,
        phone,
        email,
        college,
        year,
        branch,
        track,
        team_members: members,
        github_url: githubUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        registration_phase: selectedTier,
        amount: tierPrice,
        payment_screenshot_url: screenshotUrl,
        transaction_id: transactionId || undefined,
      });

      setCompletedRegistration(newReg);
      setStep(4);
      onSuccessRegistration?.(newReg);
      toast({
        title: 'Registration Submitted Successfully! 🎉',
        description: `Team ID: ${newReg.team_id}. Your payment is pending quick verification.`,
      });
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: err.message || 'Something went wrong while submitting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTeamName('');
    setLeaderName('');
    setEmail('');
    setPhone('');
    setCollege('');
    setGithubUrl('');
    setLinkedinUrl('');
    setProofFile(null);
    setProofPreview(null);
    setTransactionId('');
    setCompletedRegistration(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? resetForm() : null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-cyan-500/30 text-slate-100 shadow-2xl backdrop-blur-xl rounded-2xl p-6 sm:p-8">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
              {selectedTier} Tier • ₹{tierPrice}
            </span>
            {selectedTier === 'Early Bird' && (
              <span className="text-xs font-medium text-amber-400 animate-pulse">
                🔥 {earlyBirdRemaining} / 50 Spots Left
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Register for AI Innovation Hackathon 2026
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Event Date: 9 October 2026 • 24 Hours Online • Team Size: 2–4 Members
          </DialogDescription>
        </DialogHeader>

        {/* Multi-step progress bar */}
        <div className="flex items-center justify-between my-4 border-b border-cyan-500/20 pb-4">
          {[
            { num: 1, label: 'Leader & College' },
            { num: 2, label: 'Teammates (2-4)' },
            { num: 3, label: 'UPI Payment' },
            { num: 4, label: 'Ticket Pass' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 text-xs font-medium ${
                step === s.num
                  ? 'text-cyan-400'
                  : step > s.num
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? 'bg-cyan-500 text-slate-950 shadow-neon-sm'
                    : step > s.num
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Leader & College */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Quick Google Sign In */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-200">Have a Google Account?</p>
                <p className="text-xs text-slate-400">Sign in with Google or continue filling the form below.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGoogleSignIn}
                className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs text-white"
              >
                Sign In with Google
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Team Name *</Label>
                <Input
                  placeholder="e.g. Neural Ninjas"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Team Leader Full Name *</Label>
                <Input
                  placeholder="Leader full name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Leader Email *</Label>
                <Input
                  type="email"
                  placeholder="leader@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Leader Phone (WhatsApp) *</Label>
                <Input
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-slate-300">College / Institution Name *</Label>
                <Input
                  placeholder="Full university / institute name"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Year of Study *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="bg-slate-900/70 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                    <SelectItem value="Postgraduate / Graduate">Postgraduate / Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Branch / Major *</Label>
                <Input
                  placeholder="e.g. CSE, IT, ECE, AI & DS"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-slate-300">AI Challenge Track *</Label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger className="bg-slate-900/70 border-slate-700 text-white">
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

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">GitHub Profile / Org (Optional)</Label>
                <Input
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">LinkedIn Profile (Optional)</Label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="cyber-button-glow text-slate-950 font-bold px-6 flex items-center gap-2"
              >
                Next: Teammates <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Teammates (Total 2-4 Members) */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-slate-900/70 border border-cyan-500/20 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-cyan-300">Team Roster</p>
                <p className="text-xs text-slate-400">
                  Total Size: {members.length + 1} Members (Leader + {members.length} Teammates).
                  Requirement: 2 to 4 members.
                </p>
              </div>
              {members.length < 3 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddMember}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Add Member
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 inline-flex items-center justify-center text-xs">
                        {idx + 2}
                      </span>
                      Teammate #{idx + 2}
                    </span>
                    {members.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-slate-500 hover:text-red-400 h-7 w-7"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Full Name *</Label>
                      <Input
                        placeholder="Teammate name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Email *</Label>
                      <Input
                        type="email"
                        placeholder="teammate@college.edu"
                        value={member.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Role / Specialization</Label>
                      <Input
                        placeholder="e.g. AI Dev, Frontend, UI/UX"
                        value={member.role}
                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                        className="bg-slate-950 border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-700 text-slate-300"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="cyber-button-glow text-slate-950 font-bold px-6 flex items-center gap-2"
              >
                Next: Payment <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: UPI Payment & Proof Upload */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-5">
              {/* Branded UPI QR Display */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-neon-md border-2 border-cyan-400/50">
                  <img
                    src="/community-va-upi-qr.png"
                    alt="Community.VA UPI QR"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Official Community.VA QR
                </p>
              </div>

              {/* Payment Details & Copy */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Payable Amount
                  </span>
                  <div className="text-3xl font-black text-cyan-400 tracking-tight">
                    ₹{tierPrice}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      / Team ({selectedTier})
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400">Official UPI ID</span>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg p-2.5">
                    <span className="font-mono text-sm text-cyan-300 flex-1 truncate">
                      {upiId}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCopyUPI}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs h-8 px-3"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  <p>• Accepted apps: PhonePe, Google Pay, Paytm, CRED, BHIM</p>
                  <p>• Scan QR or pay directly to the UPI ID above</p>
                </div>
              </div>
            </div>

            {/* Proof Upload and Transaction ID */}
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-cyan-400" />
                  Upload Payment Screenshot *
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 hover:border-cyan-400/50 transition-colors">
                    {proofPreview ? (
                      <div className="flex items-center gap-3 p-2">
                        <img
                          src={proofPreview}
                          alt="Screenshot Proof"
                          className="h-24 w-24 object-cover rounded-lg border border-cyan-400"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-emerald-400">Screenshot Attached</p>
                          <p className="text-slate-400">{proofFile?.name}</p>
                          <p className="text-cyan-400 text-[11px] underline mt-1">Click to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-slate-400" />
                        <p className="mb-1 text-xs text-slate-300">
                          <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-500">PNG, JPG or WEBP (Receipt or UTR)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">UPI Ref / UTR / Transaction ID (Optional)</Label>
                <Input
                  placeholder="e.g. 427928374921"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="bg-slate-900/70 border-slate-700 text-white focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="border-slate-700 text-slate-300"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
                className="cyber-button-glow text-slate-950 font-bold px-8 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Registration <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success & QR Ticket Pass Preview */}
        {step === 4 && completedRegistration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Registration Received!</h3>
              <p className="text-xs text-slate-400">
                Team ID: <span className="font-mono text-cyan-400 font-bold">{completedRegistration.team_id}</span>
              </p>
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 max-w-md mx-auto">
                Status: <strong>Pending Quick Verification</strong>. Once verified, your ticket pass is
                official for opening check-in.
              </p>
            </div>

            {/* Canvas Pass Generator */}
            <TicketCanvas registration={completedRegistration} />

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="border-slate-700 text-slate-300 hover:text-white"
              >
                Close Window
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default RegistrationModal;
