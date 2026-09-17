"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Trophy,
  Download,
  Upload,
  Clock,
  Zap,
  Users,
  AlertTriangle,
  FileCode,
  CheckCircle2,
  Bell,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Eye,
  CheckSquare,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Calendar,
  Building,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import SubmissionModal from "@/components/SubmissionModal";
import ScoreReveal from "@/components/ScoreReveal";
import CodeViewer from "@/components/CodeViewer";

export default function TeamDashboard() {
  const router = useRouter();

  const [team, setTeam] = useState<any>(null);
  const [track, setTrack] = useState<any>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Copy state helpers
  const [copiedTeamId, setCopiedTeamId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Submission form states for live arena
  const [codeContent, setCodeContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLivePatchSubmit, setIsLivePatchSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestScoreResult, setLatestScoreResult] = useState<any>(null);
  const [viewingSubCode, setViewingSubCode] = useState<any>(null);
  const [showFullProblemSpec, setShowFullProblemSpec] = useState(false);

  // Event launch countdown: 25-09-2026 09:00:00 IST
  const eventStartTime = new Date("2026-09-25T09:00:00+05:30").getTime();
  const [eventCountdown, setEventCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Competition window deadline countdown: 25-09-2026 16:00:00 IST
  const deadline = new Date("2026-09-25T16:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Live patch countdown
  const [livePatchTimeLeft, setLivePatchTimeLeft] = useState<string>("20:00");

  const loadDashboardData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData?.user || authData.user.role !== "TEAM") {
        router.push("/login");
        return;
      }

      // Fetch team and submissions
      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      setSubmissions(subData.submissions || []);

      // Fetch authenticated team profile and assigned problem track
      const profRes = await fetch("/api/team/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        setTeam(profData.team);
        setTrack(profData.track);
        setTournament(profData.tournament);
      }

      // Fetch active announcements
      const annRes = await fetch("/api/announcements");
      const annData = await annRes.json();
      setAnnouncements(annData.announcements || []);

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      const now = new Date().getTime();

      // Countdown to Event Day Launch (25-09-2026 09:00 AM)
      const diffStart = eventStartTime - now;
      if (diffStart > 0) {
        const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffStart % (1000 * 60)) / 1000);
        setEventCountdown({ days, hours, minutes, seconds });
      }

      // Countdown to Event Close (25-09-2026 16:00 PM)
      const diffEnd = deadline - now;
      if (diffEnd > 0) {
        const hours = Math.floor(diffEnd / (1000 * 60 * 60));
        const minutes = Math.floor((diffEnd % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffEnd % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Live patch timer tick
  useEffect(() => {
    if (tournament?.activeStage !== "STAGE_7_LIVE_PATCH" || !tournament?.livePatchDeadline) return;

    const patchDeadline = new Date(tournament.livePatchDeadline).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = patchDeadline - now;
      if (diff > 0) {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setLivePatchTimeLeft(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        setLivePatchTimeLeft("00:00 - Round Ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournament]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCodeContent(content);
    };
    reader.readAsText(file);
  };

  const openSubmitDialog = (isLivePatch: boolean = false) => {
    if (!codeContent.trim()) {
      alert("Please upload or paste your Python code solution first.");
      return;
    }
    setIsLivePatchSubmit(isLivePatch);
    setIsModalOpen(true);
  };

  const executeSubmission = async (approachNotes: string, whatChangedNotes: string) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeContent,
          filename: fileName || (isLivePatchSubmit ? "live_patch_solution.py" : "solution.py"),
          approachNotes,
          whatChangedNotes,
          isLivePatch: isLivePatchSubmit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Submission failed.");
        setIsSubmitting(false);
        setIsModalOpen(false);
        return;
      }

      setLatestScoreResult(data.submission);
      setIsSubmitting(false);
      setIsModalOpen(false);

      // Clear input and refresh dashboard
      setCodeContent("");
      setFileName("");
      loadDashboardData();
    } catch {
      alert("Error submitting code.");
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const copyToClipboard = (text: string, type: "id" | "pass") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedTeamId(true);
      setTimeout(() => setCopiedTeamId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Team Hub & Registration Details...</p>
      </div>
    );
  }

  const isPreEvent = !tournament?.activeStage || tournament?.activeStage === "PRE_EVENT";
  const defaultPass = team?.defaultPassword || `Forge#${team?.teamCode?.split("-")[2] || "2026"}`;
  const members = team?.members || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. ANNOUNCEMENTS BROADCAST BANNER */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-2xl bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-between gap-4 text-xs font-mono text-teal-accent">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-bounce shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block sm:inline mr-2">
                [BROADCAST] {announcements[0].title}:
              </span>
              <span className="text-brand-white font-sans">{announcements[0].message}</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-accent/20 text-teal-accent shrink-0">
            OFFICIAL ALERT
          </span>
        </div>
      )}

      {/* 2. PRE-EVENT REGISTRATION CONFIRMATION HUB (ACTIVE DURING REGISTRATION PHASE) */}
      {isPreEvent ? (
        <div className="space-y-8">
          {/* Hero Confirmation Card */}
          <div className="rounded-3xl bg-bg-card border border-teal-accent/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-green/15 border border-status-green/40 text-status-green text-xs font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>REGISTRATION CONFIRMED & VERIFIED</span>
                </div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-white tracking-tight">
                  Team {team?.teamName || team?.teamCode}
                </h1>
                <p className="text-xs sm:text-sm text-brand-muted">
                  Organized by <span className="text-brand-white font-semibold">IEEE Vardhaman Student Branch</span> (EMBS × CIS Chapters).
                </p>
              </div>

              {/* Event Countdown Widget */}
              <div className="p-4 rounded-2xl bg-navy-deep/60 border border-teal-accent/30 space-y-1.5 shrink-0 sm:min-w-[260px]">
                <div className="flex items-center justify-between text-xs font-mono text-teal-accent">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event Day: 25-09-2026</span>
                  </span>
                  <span className="text-[10px] text-brand-dim">9:00 AM IST</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono pt-1">
                  <div className="p-2 rounded-lg bg-bg-secondary border border-navy-border/60">
                    <div className="text-base sm:text-lg font-bold text-brand-white">{eventCountdown.days}</div>
                    <div className="text-[9px] text-brand-dim uppercase">Days</div>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-secondary border border-navy-border/60">
                    <div className="text-base sm:text-lg font-bold text-brand-white">{eventCountdown.hours}</div>
                    <div className="text-[9px] text-brand-dim uppercase">Hours</div>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-secondary border border-navy-border/60">
                    <div className="text-base sm:text-lg font-bold text-brand-white">{eventCountdown.minutes}</div>
                    <div className="text-[9px] text-brand-dim uppercase">Mins</div>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-secondary border border-navy-border/60">
                    <div className="text-base sm:text-lg font-bold text-teal-accent">{eventCountdown.seconds}</div>
                    <div className="text-[9px] text-brand-dim uppercase">Secs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Credentials Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-navy-border/60 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-bg-secondary/70 border border-navy-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brand-dim uppercase block">Official Team ID</span>
                  <span className="text-sm font-bold text-teal-accent">{team?.teamCode}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(team?.teamCode, "id")}
                  className="p-1.5 text-brand-muted hover:text-brand-white rounded hover:bg-navy-deep transition-colors"
                  title="Copy Team Code"
                >
                  {copiedTeamId ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-secondary/70 border border-navy-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-brand-dim uppercase block">Default Password</span>
                  <span className="text-sm font-bold text-brand-white">{defaultPass}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(defaultPass, "pass")}
                  className="p-1.5 text-brand-muted hover:text-brand-white rounded hover:bg-navy-deep transition-colors"
                  title="Copy Default Password"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-secondary/70 border border-navy-border/60">
                <span className="text-[10px] text-brand-dim uppercase block">Payment Status</span>
                <span className="text-sm font-bold text-status-green flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAID (₹{team?.paymentAmount || 150})</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-secondary/70 border border-navy-border/60">
                <span className="text-[10px] text-brand-dim uppercase block">12-Digit UTR Number</span>
                <span className="text-xs font-bold text-brand-white truncate block">
                  {team?.razorpayPaymentId || "512165830063"}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Problem Track & Starter Kit Card */}
          {track && (
            <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border/60 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-teal-accent font-semibold block">
                    Assigned Problem Track ({track.society})
                  </span>
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-white">
                    {track.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-brand-muted pt-1">
                    <span className="px-2 py-0.5 rounded bg-electric-violet/20 text-electric-violet border border-electric-violet/40">
                      Track: {track.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-teal-accent/10 text-teal-accent border border-teal-accent/30">
                      Core: {track.technique}
                    </span>
                  </div>
                </div>

                {track.starterNotebookUrl && (
                  <a
                    href={track.starterNotebookUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Starter Kit</span>
                  </a>
                )}
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-brand-muted font-sans">
                <p><span className="text-brand-white font-semibold">Context:</span> {track.context}</p>
                <p><span className="text-brand-white font-semibold">Core Challenge:</span> {track.coreChallenge}</p>
              </div>

              {/* Hard Constraints & Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-orange-accent uppercase tracking-wider block">
                    Hard Constraints (Strict Compliance)
                  </span>
                  <ul className="space-y-1.5 text-brand-muted font-sans">
                    {track.hardConstraints?.map((c: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-accent font-mono">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-2">
                  <span className="text-[11px] font-mono font-bold text-teal-accent uppercase tracking-wider block">
                    Optimization Objectives
                  </span>
                  <ul className="space-y-1.5 text-brand-muted font-sans">
                    {track.optimizationObjectives?.map((o: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-accent font-mono">✓</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Verified Team Member Roster */}
          <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-3">
              <div className="flex items-center gap-2 text-sm font-display font-bold text-brand-white">
                <Users className="w-4 h-4 text-teal-accent" />
                <span>Verified Team Roster ({members.length} Members)</span>
              </div>
              <span className="text-xs font-mono text-status-green flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Members Confirmed</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m: any, idx: number) => (
                <div
                  key={m.id || idx}
                  className="p-4 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-2 text-xs font-mono"
                >
                  <div className="flex items-center justify-between border-b border-navy-border/40 pb-2">
                    <span className="text-teal-accent font-bold text-sm truncate">{m.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-accent/15 text-teal-accent">
                      {idx === 0 ? "Leader" : `Member ${idx + 1}`}
                    </span>
                  </div>

                  <div className="space-y-1 text-brand-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-brand-dim">College:</span>
                      <span className="text-brand-white truncate max-w-[140px] text-right font-sans">
                        {m.collegeName || "Vardhaman College of Eng."}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-dim">Roll No:</span>
                      <span className="text-brand-white">{m.rollNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-brand-dim">Branch & Year:</span>
                      <span className="text-brand-white">{m.branch} · {m.year}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-navy-border/30 text-[11px]">
                      <span className="text-brand-dim truncate max-w-[140px]">{m.email}</span>
                      <span className="text-brand-dim">{m.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Payment Receipt Card */}
          <div className="rounded-2xl bg-bg-secondary/50 border border-teal-accent/30 p-6 space-y-3 text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-border/50 pb-3">
              <div className="flex items-center gap-2 text-teal-accent font-bold">
                <Building className="w-4 h-4" />
                <span>Official Registration Receipt · IEEE Vardhaman Student Branch</span>
              </div>
              <span className="text-brand-dim text-[11px]">
                Receipt No: <span className="text-teal-accent font-bold">RCP-VCE-{team?.teamCode}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-brand-muted pt-1">
              <div>
                <span className="text-brand-dim text-[10px] uppercase block">Fee Amount</span>
                <span className="text-sm font-bold text-brand-white">₹{team?.paymentAmount || 150}</span>
              </div>
              <div>
                <span className="text-brand-dim text-[10px] uppercase block">Payment Mode</span>
                <span className="text-sm font-bold text-brand-white">Direct UPI Transfer</span>
              </div>
              <div>
                <span className="text-brand-dim text-[10px] uppercase block">12-Digit UTR</span>
                <span className="text-sm font-bold text-status-green truncate block">{team?.razorpayPaymentId || "512165830063"}</span>
              </div>
              <div>
                <span className="text-brand-dim text-[10px] uppercase block">Payee Recipient</span>
                <span className="text-sm font-bold text-brand-white truncate block">Pilli Maruthi Sai Teja (9490298994@axl)</span>
              </div>
            </div>
          </div>

          {/* Pre-Event Live Arena Lock Notice */}
          <div className="p-6 rounded-2xl bg-navy-deep/60 border border-navy-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-accent/15 border border-orange-accent/30 flex items-center justify-center text-orange-accent shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-sm text-brand-white">
                  Competition Submission Arena Unlocks on Event Day
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed font-sans max-w-2xl">
                  The automated code execution pipeline, hidden test perturbations, 3-attempt scoring runner, and live patch round will unlock on <span className="text-brand-white font-semibold">Friday, 25th September 2026 at 9:00 AM IST</span>. Please review your problem statement and download the starter notebook in the meantime.
                </p>
              </div>
            </div>

            <Link
              href="/problems"
              className="px-4 py-2.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-xs font-mono shrink-0 transition-colors"
            >
              Browse All 6 Problems →
            </Link>
          </div>
        </div>
      ) : (
        /* 3. LIVE EVENT ARENA (RENDERED WHEN TOURNAMENT IS ACTIVE ON EVENT DAY) */
        <div className="space-y-8 animate-fade-in">
          {/* Timeline Step Indicator */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-accent" />
                <span className="font-display font-bold text-xs uppercase tracking-wider text-brand-white">
                  Event Progression Stepper
                </span>
              </div>
              <div className="text-[11px] font-mono text-brand-muted flex items-center gap-2">
                <span>Active Stage:</span>
                <span className="text-teal-accent font-bold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
                  {tournament?.activeStage}
                </span>
              </div>
            </div>
          </div>

          {/* Submission Uploader & Runner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-bg-card border border-navy-border/80 p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-brand-white">Solution Submission Box</h3>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="# Paste your Python solution here..."
                rows={12}
                className="w-full p-4 rounded-xl bg-bg-secondary border border-navy-border font-mono text-xs text-brand-white focus:outline-none focus:border-teal-accent"
              />
              <div className="flex items-center justify-between">
                <input type="file" accept=".py" onChange={handleFileUpload} className="text-xs text-brand-muted" />
                <button
                  onClick={() => openSubmitDialog(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-bold text-xs shadow-glow"
                >
                  Submit Attempt
                </button>
              </div>
            </div>

            {/* Submissions History */}
            <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-brand-white">Attempt History</h3>
              {submissions.length === 0 ? (
                <p className="text-xs text-brand-muted">No submissions recorded yet for today.</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((sub: any) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-bg-secondary border border-navy-border text-xs font-mono">
                      <div className="flex justify-between font-bold">
                        <span>Attempt #{sub.attemptNumber}</span>
                        <span className="text-teal-accent">{sub.autoScore?.toFixed(1)} / 100</span>
                      </div>
                      <div className="text-[11px] text-brand-dim mt-1">{sub.filename}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal for Live Stage */}
      {isModalOpen && (
        <SubmissionModal
          isOpen={isModalOpen}
          isLivePatch={isLivePatchSubmit}
          attemptNumber={(team?.attemptsUsed || 0) + 1}
          filename={fileName || (isLivePatchSubmit ? "live_patch_solution.py" : "solution.py")}
          onClose={() => setIsModalOpen(false)}
          onConfirm={executeSubmission}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
