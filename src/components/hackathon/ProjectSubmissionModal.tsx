import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Github,
  Globe,
  Video,
  Presentation,
  CheckCircle2,
  Loader2,
  Users,
  Code2,
  Cpu,
  Layers,
  Send,
  FileCheck,
} from 'lucide-react';
import { hackathonService, ProjectSubmission } from '@/services/hackathonService';

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTeamId?: string;
}

const AVAILABLE_TRACKS = [
  'Education AI',
  'Healthcare AI',
  'Agriculture AI',
  'Smart City AI',
  'Accessibility AI',
  'Open Innovation',
];

const POPULAR_AI_TOOLS = [
  'ChatGPT',
  'Gemini',
  'Claude',
  'GitHub Copilot',
  'Figma AI',
  'Cursor',
  'LangChain',
  'Hugging Face',
  'Whisper',
  'Llama 3',
];

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  isOpen,
  onClose,
  initialTeamId = '',
}) => {
  const { toast } = useToast();
  const [teamId, setTeamId] = useState(initialTeamId);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [track, setTrack] = useState('Open Innovation');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAITools, setSelectedAITools] = useState<string[]>(['ChatGPT', 'Gemini']);
  const [customAITool, setCustomAITool] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<ProjectSubmission | null>(null);

  // Reset when opening
  React.useEffect(() => {
    if (isOpen) {
      if (initialTeamId) {
        setTeamId(initialTeamId);
        hackathonService.getProjectSubmissionByTeamId(initialTeamId).then((existing) => {
          if (existing) {
            setProjectTitle(existing.project_title);
            setTrack(existing.track);
            setTagline(existing.tagline);
            setDescription(existing.description);
            setSelectedAITools(existing.ai_tools || []);
            setTechStackInput(existing.tech_stack?.join(', ') || '');
            setGithubUrl(existing.github_url);
            setDemoUrl(existing.demo_url || '');
            setVideoUrl(existing.video_url || '');
            setPresentationUrl(existing.presentation_url || '');
          }
        }).catch(() => {});
      }
    } else {
      setSubmittedProject(null);
    }
  }, [isOpen, initialTeamId]);

  const toggleAITool = (tool: string) => {
    setSelectedAITools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleAddCustomTool = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customAITool.trim()) {
      e.preventDefault();
      const tool = customAITool.trim();
      if (!selectedAITools.includes(tool)) {
        setSelectedAITools((prev) => [...prev, tool]);
      }
      setCustomAITool('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalTeamId = teamId.trim() || (teamName.trim() ? `TEAM-${teamName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}` : '');

    if (!finalTeamId) {
      toast({ title: 'Team ID or Name required', description: 'Please enter your Team ID or Team Name.', variant: 'destructive' });
      return;
    }
    if (!projectTitle.trim()) {
      toast({ title: 'Project Title required', description: 'Please enter a name for your project.', variant: 'destructive' });
      return;
    }
    if (!description.trim() || description.trim().length < 30) {
      toast({ title: 'Description too short', description: 'Please provide at least 30 characters explaining your solution.', variant: 'destructive' });
      return;
    }
    if (!githubUrl.trim().startsWith('http')) {
      toast({ title: 'Valid GitHub URL required', description: 'Please provide a valid GitHub link (e.g. https://github.com/...).', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalTeamName = teamName.trim() || `Team ${finalTeamId}`;

    const payload = {
      team_id: finalTeamId,
      team_name: finalTeamName,
      leader_name: leaderName.trim() || 'Team Leader',
      leader_email: leaderEmail.trim() || 'leader@community.va',
      project_title: projectTitle.trim(),
      track,
      tagline: tagline.trim() || projectTitle.trim(),
      description: description.trim(),
      ai_tools: selectedAITools,
      tech_stack: techStack,
      github_url: githubUrl.trim(),
      demo_url: demoUrl.trim() || undefined,
      video_url: videoUrl.trim() || undefined,
      presentation_url: presentationUrl.trim() || undefined,
    };

    const res = await hackathonService.submitProject(payload);
    setIsSubmitting(false);

    if (res.data) {
      setSubmittedProject(res.data);
      toast({
        title: 'Project Submitted Successfully! 🚀',
        description: 'Your project has been recorded for jury evaluation.',
      });
    } else {
      toast({
        title: 'Submission Failed',
        description: res.error || 'Please check your inputs and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-purple-500/40 text-slate-100 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)]">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-wide text-white">
              PROJECT <span className="text-cyan-400">SUBMISSION</span> PORTAL
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs sm:text-sm">
            AI Innovation Hackathon 2026 • Submit your repository, live demo, and pitch deck for jury review.
          </DialogDescription>
        </DialogHeader>

        {submittedProject ? (
          /* SUCCESS SCREEN */
          <div className="py-8 space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Submission Confirmed!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Congratulations <span className="text-cyan-400 font-semibold">{submittedProject.team_name}</span>! Your project{' '}
                <span className="text-purple-400 font-semibold">"{submittedProject.project_title}"</span> has been successfully logged for jury evaluation.
              </p>
            </div>

            <div className="cyber-card-glass p-5 rounded-2xl border border-slate-800 text-left max-w-lg mx-auto space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Submission ID:</span>
                <span className="text-cyan-300">{submittedProject.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Team ID:</span>
                <span className="text-white font-bold">{submittedProject.team_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Track:</span>
                <span className="text-purple-400">{submittedProject.track}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">GitHub:</span>
                <a
                  href={submittedProject.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline truncate max-w-[200px]"
                >
                  {submittedProject.github_url}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted At:</span>
                <span className="text-slate-400">{new Date(submittedProject.submitted_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => setSubmittedProject(null)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Edit Submission
              </Button>
              <Button
                onClick={onClose}
                className="cyber-button-glow font-bold text-slate-950 px-6"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Step 1: Team Details */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <Label className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                1. Team Details
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-slate-400">Team ID (Optional)</Label>
                  <Input
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="e.g. CVA-AI-123456"
                    className="bg-slate-950 border-slate-800 text-xs text-white font-mono placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Team Name *</Label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Neural Nexus"
                    className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Leader Name</Label>
                  <Input
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Team Leader"
                    className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-400">Leader Email</Label>
                  <Input
                    type="email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    placeholder="leader@gmail.com"
                    className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Project Core Info */}
            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-wider text-purple-400 font-mono font-bold flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                2. Project Details
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Project Title *</Label>
                  <Input
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. MedVision AI Diagnosis Engine"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300">Challenge Track *</Label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    {AVAILABLE_TRACKS.map((t) => (
                      <option key={t} value={t} className="bg-slate-900">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">1-Line Elevator Pitch / Tagline *</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Autonomous early crop disease detection using vision transformers and edge AI"
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">
                  Comprehensive Description (Problem, Architecture & Innovation) *
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Explain what real-world problem your solution solves, what AI models you integrated, key features, and future roadmap..."
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            {/* Step 3: AI Tools & Tech Stack */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                3. AI Tools & Tech Stack
              </Label>

              <div>
                <span className="text-[11px] text-slate-400 mb-2 block">
                  Select AI Tools Used:
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_AI_TOOLS.map((tool) => {
                    const isSelected = selectedAITools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleAITool(tool)}
                        className={`text-xs px-3 py-1 rounded-full transition-all border font-medium ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {tool}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2">
                  <Input
                    value={customAITool}
                    onChange={(e) => setCustomAITool(e.target.value)}
                    onKeyDown={handleAddCustomTool}
                    placeholder="Add other AI tools (Press Enter)..."
                    className="bg-slate-900/60 border-slate-800 text-xs text-white max-w-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs text-slate-300">
                  Tech Stack (Comma-separated)
                </Label>
                <Input
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, FastAPI, PyTorch, TailwindCSS, Supabase"
                  className="bg-slate-900 border-slate-700 text-white text-xs placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Step 4: Links & Deliverables */}
            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-wider text-purple-400 font-mono font-bold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                4. Deliverables & URLs
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5 text-cyan-400" />
                    GitHub Repository URL *
                  </Label>
                  <Input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project-repo"
                    required
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-400" />
                    Live Deployed Demo (Optional)
                  </Label>
                  <Input
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-red-400" />
                    Demo Video URL (YouTube / Loom / Drive)
                  </Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or Loom"
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Presentation className="h-3.5 w-3.5 text-amber-400" />
                    Presentation Slides / Pitch Deck URL
                  </Label>
                  <Input
                    value={presentationUrl}
                    onChange={(e) => setPresentationUrl(e.target.value)}
                    placeholder="https://canva.com/... or Google Slides"
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-purple-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="cyber-button-glow font-bold text-slate-950 px-8 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Hackathon Project
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSubmissionModal;
