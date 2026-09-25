import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Globe,
  Users,
  GraduationCap,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Mail,
  Phone,
  Code2,
  Cpu,
  Layers,
  Search,
  Bot,
  Terminal,
  HeartPulse,
  Sprout,
  Building2,
  Accessibility,
  Flame,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import AICanvasBackground from '@/components/hackathon/AICanvasBackground';
import RegistrationModal from '@/components/hackathon/RegistrationModal';
import TicketCanvas from '@/components/hackathon/TicketCanvas';
import ProjectSubmissionPhase from '@/components/hackathon/ProjectSubmissionPhase';
import {
  hackathonService,
  HackathonSettings,
  HackathonRegistration,
} from '@/services/hackathonService';

export const Hackathon2026: React.FC = () => {
  const { toast } = useToast();

  // Settings & Counters
  const [settings, setSettings] = useState<HackathonSettings | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<
    'Early Bird' | 'Regular'
  >('Early Bird');
  const [tierPrice, setTierPrice] = useState(299);

  // Ticket Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookedUpReg, setLookedUpReg] = useState<HackathonRegistration | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch Settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const data = await hackathonService.getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  // Countdown Timer calculation (Target: 9 October 2026)
  useEffect(() => {
    const targetDate = settings?.countdown_target
      ? new Date(settings.countdown_target).getTime()
      : new Date('2026-10-09T09:00:00.000Z').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings?.countdown_target]);

  const handleOpenRegistration = (
    tier: 'Early Bird' | 'Regular',
    price: number
  ) => {
    setSelectedTier(tier);
    setTierPrice(price);
    setIsRegisterOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast({
      title: 'Link Copied!',
      description: 'Hackathon link copied to clipboard.',
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🚀 Join the COMMUNITY.VA AI Innovation Hackathon 2026!\n` +
      `📅 Date: 9 October 2026 (24 Hours Online)\n` +
      `🏆 Prizes: ₹10,000 Winner + ₹5,000 Runner-Up + ₹3,000 2nd Runner-Up!\n` +
      `⚡ Early Bird: ₹299 (Only ${settings?.early_bird_remaining ?? 31} spots left!)\n` +
      `👉 Register now: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTicketLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    try {
      const reg = await hackathonService.findRegistration(lookupQuery);
      if (reg) {
        setLookedUpReg(reg);
        toast({
          title: 'Registration Found!',
          description: `Team ID: ${reg.team_id} (${reg.payment_status.toUpperCase()})`,
        });
      } else {
        setLookedUpReg(null);
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

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans relative overflow-x-hidden">
      {/* Dynamic Animated AI Neural Canvas Background */}
      <AICanvasBackground />

      {/* Floating Cyber Glow Orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-cyan-500/20 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/hackathon-2026" className="flex items-center gap-3 group">
            <img
              src="/community-va-logo.png"
              alt="Community.VA Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block text-left">
              <span className="font-black text-lg tracking-wider text-white">
                COMMUNITY<span className="text-cyan-400">.VA</span>
              </span>
              <span className="block text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
                AI Innovation Hackathon
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              About
            </a>
            <a href="#tracks" className="hover:text-cyan-400 transition-colors">
              Challenge Tracks
            </a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">
              Pricing
            </a>
            <a href="#prizes" className="hover:text-cyan-400 transition-colors">
              Prizes
            </a>
            <a href="#timeline" className="hover:text-cyan-400 transition-colors">
              Timeline
            </a>
            <a href="#submission" className="hover:text-emerald-400 transition-colors text-emerald-300 font-bold">
              Submit Project
            </a>
            <a href="#tools" className="hover:text-cyan-400 transition-colors">
              AI Tools
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs flex items-center gap-1.5 px-3"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                Admin
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const el = document.getElementById('ticket-check');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:flex border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs"
            >
              Get Ticket Pass
            </Button>

            <Button
              onClick={() => handleOpenRegistration('Early Bird', 299)}
              size="sm"
              className="cyber-button-glow text-slate-950 font-bold px-4 sm:px-5 text-xs sm:text-sm"
            >
              Register Now
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="about" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Top badges */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 px-4 rounded-full cyber-card-glass text-xs text-cyan-300 font-mono border border-cyan-500/30"
          >
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
              COMMUNITY.VA PRESENTS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 tracking-wider">
              INNOVATE • BUILD • IMPACT
            </span>
          </motion.div>

          {/* Main Hackathon Title Matching Poster Typography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h2 className="text-cyan-400 tracking-[0.25em] text-sm sm:text-lg font-black uppercase">
              Community.VA
            </h2>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none">
              AI INNOVATION
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 cyber-glow-text">
                HACKATHON 2026
              </span>
            </h1>
          </motion.div>

          {/* Tagline Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-600 text-slate-950 font-black text-sm sm:text-base md:text-lg tracking-wide uppercase shadow-neon-md">
              Build AI-Powered Solutions for Real-World Problems
            </div>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              A high-octane 24-hour virtual hackathon where students & innovators build cutting-edge
              apps using ChatGPT, Gemini, Claude, and next-gen AI technologies.
            </p>
          </motion.div>

          {/* Key Event Specs (Date, Duration, Mode, Team) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2"
          >
            {[
              { label: 'Event Date', val: '9 October 2026', icon: Calendar },
              { label: 'Duration', val: '24 Hours', icon: Clock },
              { label: 'Mode', val: '100% Online', icon: Globe },
              { label: 'Team Size', val: '2 – 4 Members', icon: Users },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl cyber-card-glass border border-cyan-500/20 text-center"
              >
                <item.icon className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="font-bold text-white text-xs sm:text-sm mt-0.5">
                  {item.val}
                </div>
              </div>
            ))}
          </motion.div>

          {/* LIVE COUNTDOWN TIMER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <div className="max-w-xl mx-auto p-5 rounded-2xl cyber-card-glass border border-cyan-500/30 shadow-neon-sm">
              <div className="text-xs uppercase font-mono tracking-widest text-cyan-300 mb-3 flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 animate-pulse text-cyan-400" />
                Live Countdown to October 9, 2026
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { label: 'DAYS', val: timeLeft.days },
                  { label: 'HOURS', val: timeLeft.hours },
                  { label: 'MINUTES', val: timeLeft.minutes },
                  { label: 'SECONDS', val: timeLeft.seconds },
                ].map((unit, i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-center"
                  >
                    <div className="text-2xl sm:text-4xl font-black text-cyan-400 font-mono">
                      {String(unit.val).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider">
                      {unit.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Big Hero CTA & Live Spot Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 pt-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => handleOpenRegistration('Early Bird', 299)}
                className="cyber-button-glow text-slate-950 font-black text-base sm:text-lg px-8 sm:px-12 py-6 rounded-xl shadow-neon-lg flex items-center gap-3"
              >
                <Flame className="h-5 w-5 text-slate-950" />
                REGISTER NOW (₹299)
                <ArrowRight className="h-5 w-5 text-slate-950" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('tracks');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 py-6 px-6 rounded-xl text-sm"
              >
                Explore Tracks
              </Button>
            </div>

            {/* Live Counter Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
              <span>
                {settings?.early_bird_remaining ?? 31} / 50 Early Bird Spots Left • Register Early
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* QUICK EVENT CARDS SECTION */}
      <section className="py-12 px-4 sm:px-6 relative z-10 border-y border-cyan-500/10 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Clock,
                title: '24 Hours Innovation',
                desc: 'Intense day-and-night marathon to design, build, and deploy.',
                glow: 'text-cyan-400',
              },
              {
                icon: Globe,
                title: 'Online Event',
                desc: 'Compete comfortably from your campus or home anywhere in India.',
                glow: 'text-sky-400',
              },
              {
                icon: Users,
                title: 'Team Size 2–4',
                desc: 'Collaborate with friends or teammates across colleges and batches.',
                glow: 'text-blue-400',
              },
              {
                icon: GraduationCap,
                title: 'College Students & Innovators',
                desc: 'Designed for ambitious undergrads, postgrads, and builders.',
                glow: 'text-indigo-400',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="p-5 rounded-2xl cyber-card-glass border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-slate-900 border border-cyan-500/20 flex items-center justify-center ${card.glow}`}
                  >
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Registration Pricing
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Per team pricing (2–4 members). Choose your phase and secure your slot today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* 1. Early Bird (Highlighted) */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-400 shadow-neon-lg flex flex-col justify-between"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-sm flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Best Value • First 50 Teams
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Early Bird</h3>
                  <p className="text-xs text-cyan-300 font-medium">Limited First 50 Teams</p>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono">
                    ₹{settings?.early_bird_price ?? 299}
                    <span className="text-xs text-slate-400 font-normal"> / Team</span>
                  </div>
                  <p className="text-xs text-slate-400">Complete team access (2-4 members)</p>
                </div>

                {/* Dynamic live counter */}
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
                  <span className="text-xs font-bold text-amber-300">
                    🔥 {settings?.early_bird_remaining ?? 31} / 50 Early Bird Spots Left
                  </span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (((settings?.early_bird_total ?? 50) -
                            (settings?.early_bird_remaining ?? 31)) /
                            (settings?.early_bird_total ?? 50)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Full 24-Hour Hackathon Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Verified QR Ticket Pass for Team
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Mentorship & Expert Check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    Official Community.VA Certificates
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() =>
                    handleOpenRegistration('Early Bird', settings?.early_bird_price ?? 299)
                  }
                  className="w-full cyber-button-glow text-slate-950 font-black py-6 rounded-xl text-sm"
                >
                  Register Early Bird
                </Button>
              </div>
            </motion.div>

            {/* 2. Regular */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-6 sm:p-8 rounded-3xl cyber-card-glass border border-slate-700 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Regular</h3>
                  <p className="text-xs text-slate-400">After Early Bird Sells Out</p>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl sm:text-5xl font-black text-white font-mono">
                    ₹{settings?.regular_price ?? 399}
                    <span className="text-xs text-slate-400 font-normal"> / Team</span>
                  </div>
                  <p className="text-xs text-slate-400">Standard team entry</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">
                    Opens after first 50 teams register
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    Full 24-Hour Hackathon Access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    Verified QR Ticket Pass
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    Mentorship & Expert Check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    Official Community.VA Certificates
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleOpenRegistration('Regular', settings?.regular_price ?? 399)
                  }
                  className="w-full border-slate-700 hover:border-cyan-400 text-white font-bold py-6 rounded-xl text-sm"
                >
                  Register Regular
                </Button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* AI CHALLENGE TRACKS SECTION */}
      <section id="tracks" className="py-20 px-4 sm:px-6 relative z-10 bg-slate-950/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Choose A Challenge. Build The Future.
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              AI Challenge Tracks
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Six real-world problem tracks curated to inspire transformative AI applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Education AI',
                desc: 'AI Study Assistants, intelligent personalized tutors, automatic doubt solvers, syllabus planners, and interview readiness coaches.',
                color: 'from-cyan-500/20 to-blue-500/10',
                border: 'border-cyan-500/30',
                tag: 'Student Impact',
              },
              {
                icon: HeartPulse,
                title: 'Healthcare AI',
                desc: 'Early symptom screening, smart hospital navigation, mental wellness companions, medical report summarizers, and emergency response bots.',
                color: 'from-emerald-500/20 to-cyan-500/10',
                border: 'border-emerald-500/30',
                tag: 'Life Sciences',
              },
              {
                icon: Sprout,
                title: 'Agriculture AI',
                desc: 'Crop disease diagnosis via mobile vision, precision irrigation advisors, pest warnings, and market yield forecast systems for farmers.',
                color: 'from-amber-500/20 to-yellow-500/10',
                border: 'border-amber-500/30',
                tag: 'AgriTech',
              },
              {
                icon: Building2,
                title: 'Smart City AI',
                desc: 'Urban traffic flow optimization, waste segregation vision models, energy load prediction, and public citizen service assistants.',
                color: 'from-sky-500/20 to-indigo-500/10',
                border: 'border-sky-500/30',
                tag: 'Civic Tech',
              },
              {
                icon: Accessibility,
                title: 'Accessibility AI',
                desc: 'AI tools for neurodivergent and differently-abled individuals: real-time sign language vision, screen audio narrators, and voice interfaces.',
                color: 'from-purple-500/20 to-pink-500/10',
                border: 'border-purple-500/30',
                tag: 'Inclusion',
              },
              {
                icon: Sparkles,
                title: 'Open Innovation',
                desc: 'Have a breakthrough AI idea? Autonomous agent frameworks, developer productivity copilots, or multimodal generative apps welcome!',
                color: 'from-blue-500/20 to-cyan-500/10',
                border: 'border-blue-500/30',
                tag: 'Free Exploration',
              },
            ].map((track, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${track.color} bg-slate-900/60 border ${track.border} shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-neon-sm">
                      <track.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300">
                      {track.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {track.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{track.desc}</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleOpenRegistration('Early Bird', 299)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
                  >
                    Build for this track <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center italic text-sm text-cyan-300 pt-2 font-mono">
            "Bring your ideas. We'll help you make it real!"
          </div>
        </div>
      </section>

      {/* PRIZES & RECOGNITION SECTION */}
      <section id="prizes" className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Exciting Rewards
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Prize Pool & Recognitions
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Compete for cash rewards, prestigious trophies, verified credentials, and spotlight.
            </p>
          </div>

          {/* Trophy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 1. Winner (Gold) */}
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] text-center space-y-4 flex flex-col justify-between order-1 md:order-2"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-lg">
                  <Trophy className="h-10 w-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono tracking-widest text-amber-300 font-bold uppercase">
                    1st Place Champion
                  </span>
                  <h3 className="text-2xl font-black text-white">WINNER</h3>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight">
                  ₹{settings?.prize_winner?.toLocaleString() ?? '10,000'}
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  Grand Trophy + Official Certificates of Excellence
                </p>
              </div>
              <div className="pt-4 border-t border-amber-500/20 text-xs text-slate-300">
                Direct Feature on Community.VA & Mentorship
              </div>
            </motion.div>

            {/* 2. Runner-Up (Silver) */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-400/50 text-center space-y-4 flex flex-col justify-between order-2 md:order-1"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-400/40 flex items-center justify-center text-slate-200">
                  <Award className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono tracking-widest text-slate-300 font-bold uppercase">
                    2nd Place
                  </span>
                  <h3 className="text-xl font-bold text-white">RUNNER-UP</h3>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-100 font-mono">
                  ₹{settings?.prize_runner_up?.toLocaleString() ?? '5,000'}
                </div>
                <p className="text-xs text-slate-300">
                  Runner-Up Trophy + Certificates
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                Special Recognition & Media Feature
              </div>
            </motion.div>

            {/* 3. Second Runner-Up (Bronze) */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl cyber-card-glass border border-amber-700/50 text-center space-y-4 flex flex-col justify-between order-3"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-900/20 border border-amber-700/40 flex items-center justify-center text-amber-500">
                  <Award className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono tracking-widest text-amber-500 font-bold uppercase">
                    3rd Place
                  </span>
                  <h3 className="text-xl font-bold text-white">SECOND RUNNER-UP</h3>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">
                  ₹{settings?.prize_second_runner_up?.toLocaleString() ?? '3,000'}
                </div>
                <p className="text-xs text-slate-300">
                  Honor Trophy + Certificates
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                Recognition on Community.VA
              </div>
            </motion.div>
          </div>

          {/* Additional Perks Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
            <div className="p-4 rounded-2xl cyber-card-glass border border-cyan-500/20 flex items-center gap-3">
              <Award className="h-8 w-8 text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Special Mentions</h4>
                <p className="text-xs text-slate-400">Certificates of merit for standout projects</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl cyber-card-glass border border-cyan-500/20 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Participation Certificates</h4>
                <p className="text-xs text-slate-400">Verified digital credential for every participant</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl cyber-card-glass border border-cyan-500/20 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Top Projects Featured</h4>
                <p className="text-xs text-slate-400">Showcased across Community.VA network</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT TIMELINE SECTION */}
      <section id="timeline" className="py-20 px-4 sm:px-6 relative z-10 bg-slate-950/60">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              24-Hour Marathon
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Event Timeline
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Clear milestone schedule keeping your team guided from opening to victory.
            </p>
          </div>

          <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-32 space-y-8 py-4">
            {[
              { time: '9:00 AM', title: 'Opening Ceremony', desc: 'Welcome address, rules overview, and keynote by industry AI leaders.' },
              { time: '9:30 AM', title: 'Problem Statement Release', desc: 'Detailed track challenge briefs and judging rubrics unveiled.' },
              { time: '10:00 AM', title: 'Hackathon Starts', desc: 'Hacking begins! Teams start prototyping and architectural setup.' },
              { time: '2:00 PM', title: 'Mentor Check-in', desc: '1-on-1 breakout guidance with mentors to review progress and tech stack.' },
              { time: '8:00 PM', title: 'Progress Review', desc: 'Mid-point sync and technical checkpoint for all participant teams.' },
              { time: 'Next Day 9:30 AM', title: 'Submission Deadline', desc: 'Code repository, presentation deck, and demo video uploaded.' },
              { time: '10:30 AM', title: 'Final Presentations', desc: 'Shortlisted teams pitch live in front of the judging panel.' },
              { time: '12:30 PM', title: 'Winners Announcement & Closing', desc: 'Cash prize announcements, awards ceremony, and wrap-up.' },
            ].map((slot, i) => (
              <div key={i} className="relative pl-6 sm:pl-8 group">
                {/* Glowing Node Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:scale-125 group-hover:bg-cyan-400 transition-all shadow-neon-sm" />

                {/* Time Badge (Desktop left pill) */}
                <div className="sm:absolute sm:-left-32 sm:top-1 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 sm:mb-0">
                  {slot.time}
                </div>

                <div className="p-4 rounded-xl cyber-card-glass border border-cyan-500/20 group-hover:border-cyan-400/50 transition-colors">
                  <h4 className="font-bold text-white text-base">{slot.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT SUBMISSION SECTION */}
      <section id="submission" className="py-20 px-4 sm:px-6 relative z-10 bg-slate-950/80">
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Project Submission
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white">
                Submit Your Project
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Ready to submit your hard work? Enter your details below.
              </p>
            </div>
            
            <ProjectSubmissionPhase />
        </div>
      </section>

      {/* AI TOOLS SECTION */}
      <section id="tools" className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Tech Stack & Tooling
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Leverage Modern AI Tools
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Build with the most powerful LLMs, assistants, and design suites in the industry.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                name: 'ChatGPT',
                company: 'OpenAI',
                badge: 'GPT-4o & Reasoning',
                icon: Bot,
                glow: 'hover:border-emerald-400/60',
              },
              {
                name: 'Gemini',
                company: 'Google DeepMind',
                badge: 'Multimodal 1.5/2.0',
                icon: Sparkles,
                glow: 'hover:border-blue-400/60',
              },
              {
                name: 'Claude',
                company: 'Anthropic',
                badge: 'Claude 3.5 Sonnet',
                icon: Cpu,
                glow: 'hover:border-amber-400/60',
              },
              {
                name: 'GitHub Copilot',
                company: 'GitHub / Microsoft',
                badge: 'Pair Programming',
                icon: Terminal,
                glow: 'hover:border-cyan-400/60',
              },
              {
                name: 'Figma',
                company: 'Figma Design',
                badge: 'UI/UX Prototyping',
                icon: Wand2,
                glow: 'hover:border-purple-400/60',
              },
            ].map((tool, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className={`p-5 rounded-2xl cyber-card-glass border border-slate-800 ${tool.glow} transition-all text-center space-y-3`}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-sm">
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{tool.name}</h4>
                  <p className="text-[11px] text-slate-400">{tool.company}</p>
                </div>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
                  {tool.badge}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CHECK MY TICKET / PASS LOOKUP SECTION */}
      <section id="ticket-check" className="py-16 px-4 sm:px-6 relative z-10 bg-slate-950/80 border-y border-cyan-500/20">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Already Registered?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Check Your Registration & Download Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter your Team ID (e.g. CVA-HACK-8492) or registered email to retrieve your verified pass.
            </p>
          </div>

          <form onSubmit={handleTicketLookup} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Enter Team ID or Email..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-400 outline-none"
            />
            <Button
              type="submit"
              disabled={isLookingUp}
              className="cyber-button-glow text-slate-950 font-bold px-6"
            >
              <Search className="h-4 w-4 mr-2" /> Find Pass
            </Button>
          </form>

          {lookedUpReg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6"
            >
              <TicketCanvas registration={lookedUpReg} />
            </motion.div>
          )}
        </div>
      </section>

      {/* SPONSORS SECTION */}
      <section className="py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Partnership & Support
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Hackathon Sponsors
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Empowering young innovators and providing mentorship, API credits, and opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tier: 'Title Sponsor', amount: '₹25,000', perk: 'Exclusive keynote & prime branding' },
              { tier: 'Gold Sponsor', amount: '₹10,000', perk: 'Track sponsorship & booth' },
              { tier: 'Silver Sponsor', amount: '₹5,000', perk: 'Logo on badges & website' },
              { tier: 'Community Partner', amount: 'Partner', perk: 'Cross-promotion & community reach' },
            ].map((sponsor, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl cyber-card-glass border border-slate-800 text-center space-y-3"
              >
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {sponsor.tier}
                </span>
                <div className="text-2xl font-black text-white font-mono">{sponsor.amount}</div>
                <p className="text-xs text-slate-400">{sponsor.perk}</p>
                <div className="pt-2">
                  <a
                    href="mailto:community.va01@gmail.com?subject=Sponsorship%20Inquiry%20Hackathon%202026"
                    className="text-xs text-cyan-300 hover:text-cyan-200 underline inline-flex items-center gap-1"
                  >
                    Partner with us <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 relative z-10 bg-slate-950/60">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Everything you need to know about participating in the AI Innovation Hackathon.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {(settings?.faqs || []).map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-cyan-500/20 rounded-2xl cyber-card-glass px-4"
              >
                <AccordionTrigger className="text-sm sm:text-base font-semibold text-white hover:text-cyan-400 text-left py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-300 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* SOCIAL SHARING & COMMUNITY CTA */}
      <section className="py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-cyan-950/40 to-slate-950 border border-cyan-500/30 text-center space-y-6 shadow-neon-md">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
            <Share2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Spread The Word & Invite Your Teammates
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Share the AI Innovation Hackathon 2026 with your college groups, coding clubs, and friends.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </Button>

            <a
              href="https://instagram.com/community.va"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-white font-bold text-sm transition-colors"
            >
              <Instagram className="h-4 w-4" /> Follow @community.va
            </a>

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-2"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? 'Copied Link' : 'Copy Registration Link'}
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cyan-500/20 py-12 px-4 sm:px-8 bg-[#02050e] relative z-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img
                src="/community-va-logo.png"
                alt="Community.VA Logo"
                className="h-9 w-auto"
              />
              <span className="font-black text-lg text-white">
                COMMUNITY<span className="text-cyan-400">.VA</span>
              </span>
            </div>
            <p className="max-w-sm text-slate-400">
              BUILDING FUTURE INNOVATORS THROUGH PRACTICAL LEARNING.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-slate-300">
            <a
              href="mailto:community.va01@gmail.com"
              className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
            >
              <Mail className="h-4 w-4 text-cyan-400" /> community.va01@gmail.com
            </a>
            <a
              href="tel:7416201359"
              className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
            >
              <Phone className="h-4 w-4 text-cyan-400" /> +91 7416201359
            </a>
            <a
              href="https://instagram.com/community.va"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
            >
              <Instagram className="h-4 w-4 text-cyan-400" /> @community.va
            </a>
          </div>

          <div className="text-center md:text-right space-y-1 text-slate-500">
            <p>© 2026 Community.VA. All rights reserved.</p>
            <p className="text-[11px]">
              AI Innovation Hackathon 2026 • 9 October 2026
            </p>
            <p className="text-xs pt-1">
              <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Dashboard (Approve / Reject Teams)
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {/* REGISTRATION MODAL */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        selectedTier={selectedTier}
        tierPrice={tierPrice}
        earlyBirdRemaining={settings?.early_bird_remaining ?? 31}
        onSuccessRegistration={(reg) => {
          setLookedUpReg(reg);
          if (settings && selectedTier === 'Early Bird') {
            setSettings({
              ...settings,
              early_bird_remaining: Math.max(0, settings.early_bird_remaining - 1),
            });
          }
        }}
      />
    </div>
  );
};
export default Hackathon2026;
