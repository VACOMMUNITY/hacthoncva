import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Github, 
  Linkedin, 
  Globe, 
  Search, 
  ArrowRight,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  hackathonService, 
  HackathonRegistration,
  ProjectSubmission
} from '@/services/hackathonService';
import { useAuth } from '@/contexts/AuthContext';

export const ProjectSubmissionPhase: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [registration, setRegistration] = useState<HackathonRegistration | null>(null);
  
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [vercelLink, setVercelLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-lookup if user is logged in
  useEffect(() => {
    if (user?.email && !registration) {
      handleLookup(user.email);
    }
  }, [user]);

  const loadSubmission = async (teamId: string) => {
    try {
      const sub = await hackathonService.getProjectSubmission(teamId);
      if (sub) {
        setSubmission(sub);
        setGithubLink(sub.github_link);
        setLinkedinLink(sub.linkedin_link);
        setVercelLink(sub.vercel_link);
      }
    } catch (error) {
      console.error('Error loading submission:', error);
    }
  };

  const handleLookup = async (queryToUse?: string) => {
    const q = queryToUse || lookupQuery;
    if (!q.trim()) return;

    setIsLookingUp(true);
    try {
      const reg = await hackathonService.findRegistration(q);
      if (reg) {
        setRegistration(reg);
        await loadSubmission(reg.team_id);
        if (!queryToUse) {
          toast({
            title: 'Team Found!',
            description: `Welcome back, ${reg.team_name}.`,
          });
        }
      } else if (!queryToUse) {
        toast({
          title: 'Not Found',
          description: 'No team registration found matching that Team ID or Email.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    if (!githubLink || !linkedinLink || !vercelLink) {
      toast({
        title: 'Missing Fields',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUrl(githubLink) || !validateUrl(linkedinLink) || !validateUrl(vercelLink)) {
      toast({
        title: 'Invalid URLs',
        description: 'Please enter valid URLs (starting with http:// or https://).',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProjectSubmission = {
        team_id: registration.team_id,
        github_link: githubLink,
        linkedin_link: linkedinLink,
        vercel_link: vercelLink,
        user_id: user?.id
      };

      let result;
      if (submission?.id) {
        result = await hackathonService.updateProjectSubmission(registration.team_id, payload);
      } else {
        result = await hackathonService.submitProject(payload);
      }

      if (result) {
        setSubmission(result);
        setIsEditing(false);
        toast({
          title: 'Project submitted successfully! 🎉',
          description: 'Your project links have been securely saved.',
        });
      } else {
        throw new Error('Failed to save submission');
      }
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Unable to submit your project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!registration ? (
          /* LOOKUP STATE */
          <motion.div
            key="lookup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 rounded-3xl cyber-card-glass border border-cyan-500/30 shadow-neon-lg max-w-xl mx-auto"
          >
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-cyan-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Find Your Team</h3>
              <p className="text-sm text-slate-400">
                Enter your Team ID or registered Email to submit your project.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLookup(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lookup" className="text-slate-300">Team ID or Email</Label>
                <Input
                  id="lookup"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="e.g. CVA-HACK-1234 or team@example.com"
                  className="bg-slate-900 border-cyan-500/30 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isLookingUp || !lookupQuery.trim()}
                className="w-full cyber-button-glow font-bold"
              >
                {isLookingUp ? 'Searching...' : 'Continue'}
                {!isLookingUp && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </motion.div>
        ) : submission && !isEditing ? (
          /* SUBMITTED STATE */
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4 mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-3xl font-black text-white">Project Submitted ✓</h3>
              <p className="text-sm text-slate-300">
                Team <span className="font-bold text-emerald-400">{registration.team_name}</span> ({registration.team_id})
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href={submission.github_link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6 text-slate-300 group-hover:text-white" />
                  <div>
                    <div className="text-sm font-bold text-white">GitHub Repository</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{submission.github_link}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
              </a>

              <a 
                href={submission.linkedin_link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-blue-900/50 hover:border-blue-500/50 hover:bg-blue-950/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Linkedin className="h-6 w-6 text-blue-400 group-hover:text-blue-300" />
                  <div>
                    <div className="text-sm font-bold text-white">LinkedIn Post</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{submission.linkedin_link}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-300 transition-colors" />
              </a>

              <a 
                href={submission.vercel_link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-cyan-900/50 hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300" />
                  <div>
                    <div className="text-sm font-bold text-white">Vercel Deployment</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{submission.vercel_link}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-cyan-300 transition-colors" />
              </a>
            </div>

            <div className="mt-8 text-center flex justify-between items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setRegistration(null);
                  setSubmission(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                Not you?
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-slate-700 hover:bg-slate-800 text-white"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Submission
              </Button>
            </div>
          </motion.div>
        ) : (
          /* FORM STATE */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-10 rounded-3xl cyber-card-glass border border-cyan-500/30 shadow-neon-lg max-w-2xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black text-white">
                  {submission ? 'Edit Submission' : 'Submit Project'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (submission) {
                      setIsEditing(false);
                    } else {
                      setRegistration(null);
                    }
                  }}
                  className="text-slate-400"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-sm text-slate-300">
                Submitting as team: <span className="font-bold text-cyan-400">{registration.team_name}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="github" className="text-slate-300 flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub Repository Link
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  className="bg-slate-900 border-cyan-500/30 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-slate-300 flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn Post Link
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://www.linkedin.com/posts/username_project..."
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  className="bg-slate-900 border-cyan-500/30 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vercel" className="text-slate-300 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Vercel Deployment Link
                </Label>
                <Input
                  id="vercel"
                  type="url"
                  placeholder="https://my-project.vercel.app"
                  value={vercelLink}
                  onChange={(e) => setVercelLink(e.target.value)}
                  className="bg-slate-900 border-cyan-500/30 text-white focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="text-xs text-amber-400 flex items-center gap-1.5 max-w-[200px] sm:max-w-xs leading-tight">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Make sure all links are public and accessible to judges.
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !githubLink || !linkedinLink || !vercelLink}
                  className="cyber-button-glow font-bold min-w-[150px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Project'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectSubmissionPhase;
