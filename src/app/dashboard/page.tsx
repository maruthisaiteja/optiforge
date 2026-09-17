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

  // Submission form states
  const [codeContent, setCodeContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLivePatchSubmit, setIsLivePatchSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestScoreResult, setLatestScoreResult] = useState<any>(null);
  const [viewingSubCode, setViewingSubCode] = useState<any>(null);
  const [showFullProblemSpec, setShowFullProblemSpec] = useState(false);

  // Window deadline countdown: 25-09-2026 16:00:00 IST
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
      const diff = deadline - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Team Competition Arena...</p>
      </div>
    );
  }

  const attemptsUsed = team?.attemptsUsed || 0;
  const attemptsLeft = Math.max(0, 3 - attemptsUsed);

  // Check if live patch submission exists
  const livePatchSubmission = submissions.find((s) => s.isLivePatch);

  const stagesList = [
    { key: "STAGE_1_STRATEGY", label: "Stage 1", title: "Strategy" },
    { key: "STAGE_2_DISTRIBUTION", label: "Stage 2", title: "Starter Code" },
    { key: "STAGE_3_ATTEMPT_1", label: "Stage 3", title: "Attempt 1" },
    { key: "STAGE_4_ATTEMPT_2", label: "Stage 4", title: "Shift 1 (Att 2)" },
    { key: "STAGE_5_ATTEMPT_3", label: "Stage 5", title: "Shift 2 (Att 3)" },
    { key: "STAGE_6_FREEZE", label: "Stage 6", title: "Freeze" },
    { key: "STAGE_7_LIVE_PATCH", label: "Stage 7", title: "Live Patch" },
    { key: "STAGE_8_VIVA", label: "Stage 8", title: "Viva Q&A" },
  ];

  const currentStageIndex = stagesList.findIndex((s) => s.key === tournament?.activeStage);

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
            ORGANIZER ALERT
          </span>
        </div>
      )}

      {/* 2. TOURNAMENT STAGE TIMELINE PROGRESS STEPPER */}
      <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-accent" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-brand-white">
              Event Workflow Progression
            </span>
          </div>
          <div className="text-[11px] font-mono text-brand-muted flex items-center gap-2">
            <span>Current Active Stage:</span>
            <span className="text-teal-accent font-bold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
              {stagesList.find((s) => s.key === tournament?.activeStage)?.title || tournament?.activeStage}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {stagesList.map((stg, idx) => {
            const isCurrent = stg.key === tournament?.activeStage;
            const isPast = currentStageIndex > idx;
            return (
              <div
                key={stg.key}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-teal-accent/15 border-teal-accent shadow-glow text-teal-accent font-bold"
                    : isPast
                    ? "bg-bg-secondary/40 border-navy-border/40 text-brand-dim"
                    : "bg-bg-secondary/20 border-navy-border/20 text-brand-muted opacity-50"
                }`}
              >
                <div className="text-[10px] font-mono uppercase">{stg.label}</div>
                <div className="text-xs truncate">{stg.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC SCENARIO SHIFT NOTICES (IF UNLOCKED BY STAGE) */}
      {track?.activeShiftAttempt2 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-accent/15 to-transparent border border-orange-accent/40 text-xs font-mono space-y-1.5 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-orange-accent font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>🚨 Active Perturbation: Hidden Scenario Shift #1 (Attempt 2)</span>
          </div>
          <p className="text-brand-white font-sans leading-relaxed text-xs pl-6">
            {track.activeShiftAttempt2}
          </p>
          <div className="text-[11px] text-orange-accent/90 pl-6">
            * Note: Submitting Attempt 2 requires a mandatory written reflection on what parameter or logic changes were made.
          </div>
        </div>
      )}

      {track?.activeShiftAttempt3 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-electric-violet/15 to-transparent border border-electric-violet/40 text-xs font-mono space-y-1.5 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-electric-violet font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>🚨 Active Stress Case: Hidden Scenario Shift #2 (Attempt 3)</span>
          </div>
          <p className="text-brand-white font-sans leading-relaxed text-xs pl-6">
            {track.activeShiftAttempt3}
          </p>
          <div className="text-[11px] text-electric-violet/90 pl-6">
            * Final attempt to optimize heuristic stability and handle combined multi-constraint stress.
          </div>
        </div>
      )}

      {/* 4. STAGE 7: LIVE PATCH ROUND DEDICATED CALLOUT (WHEN ACTIVE) */}
      {tournament?.activeStage === "STAGE_7_LIVE_PATCH" && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-accent/20 via-bg-card to-bg-card border-2 border-orange-accent shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-orange-accent/30 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-accent/20 border border-orange-accent/40 flex items-center justify-center text-orange-accent">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
                  <span>STAGE 7: THE LIVE PATCH ROUND IS LIVE!</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    ZERO AI ALLOWED
                  </span>
                </h3>
                <p className="text-xs text-brand-muted">
                  A surprise constraint has been injected. You have a 15–20 minute window to patch your algorithm live.
                </p>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="px-4 py-2 rounded-xl bg-bg-primary border border-orange-accent/50 font-mono text-sm font-bold text-orange-accent flex items-center gap-2 shadow-inner">
              <Clock className="w-4 h-4" />
              <span>{livePatchTimeLeft}</span>
            </div>
          </div>

          {/* Surprise Constraint Details */}
          <div className="p-4 rounded-xl bg-bg-secondary/80 border border-navy-border space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-orange-accent font-bold block">
              Surprise Constraint Injected:
            </span>
            <p className="text-xs text-brand-white leading-relaxed font-sans font-medium">
              {track?.activeLivePatchSurprise || "A sudden real-time operational constraint has been injected into your domain benchmark."}
            </p>
          </div>

          {/* Submission status or submit button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {livePatchSubmission ? (
              <div className="flex items-center gap-2 text-xs font-mono text-status-green">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Patch Submitted & Scored: {livePatchSubmission.autoScore} pts</span>
              </div>
            ) : (
              <button
                onClick={() => openSubmitDialog(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-accent to-red-500 text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Submit Live Patch Code</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-brand-dim">
              Judges inspect your live patch agility during the viva defense.
            </span>
          </div>
        </div>
      )}

      {/* 5. TEAM PROFILE & STATS HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Identity Card */}
        <div className="lg:col-span-2 rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand-muted mb-1">
                <span>TEAM ID:</span>
                <span className="text-teal-accent font-bold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
                  {team?.teamCode}
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
                {team?.teamName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-status-green/15 text-status-green border border-status-green/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-green" />
                <span>Verified Participant</span>
              </span>
            </div>
          </div>

          {/* Assigned Problem Track Banner */}
          {track && (
            <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/80 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim block">
                  Assigned Problem Track
                </span>
                <h4 className="font-display font-bold text-sm text-brand-white">
                  {track.name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-teal-accent">
                  <span>{track.society}</span>
                  <span>•</span>
                  <span>{track.technique}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFullProblemSpec(true)}
                  className="px-3 py-2 rounded-xl bg-bg-primary hover:bg-navy-deep border border-navy-border text-xs text-brand-white flex items-center gap-1.5 transition-colors font-mono"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-accent" />
                  <span>View 7-Section Spec</span>
                </button>
                {track.starterNotebookUrl && (
                  <a
                    href={track.starterNotebookUrl}
                    download
                    className="px-3 py-2 rounded-xl bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-xs text-teal-accent flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Starter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Roster Members */}
          <div className="pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-dim block mb-2">
              Team Roster ({team?.members?.length || 0} Members)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {team?.members?.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-bg-secondary/50 border border-navy-border/50 text-xs"
                >
                  <div className="font-medium text-brand-white truncate">{m.name}</div>
                  <div className="text-[10px] font-mono text-brand-muted truncate">
                    {m.branch} · {m.rollNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attempts & Score HUD */}
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-dim block mb-2">
              Official Attempt Budget
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-4xl text-brand-white">
                {attemptsUsed}
              </span>
              <span className="font-mono text-lg text-brand-muted">/ 3</span>
            </div>

            {/* Visual attempt meter */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`h-2.5 rounded-full border transition-all ${
                    num <= attemptsUsed
                      ? "bg-teal-accent border-teal-accent shadow-glow"
                      : "bg-navy-deep border-navy-border"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-brand-muted mt-3">
              {attemptsLeft > 0 ? (
                <span>
                  You have <span className="text-teal-accent font-bold font-mono">{attemptsLeft}</span>{" "}
                  attempt{attemptsLeft > 1 ? "s" : ""} remaining.
                </span>
              ) : (
                <span className="text-orange-accent font-mono font-medium">
                  Standard attempt limit reached. Submissions locked.
                </span>
              )}
            </p>
          </div>

          <div className="pt-4 border-t border-navy-border/60">
            <span className="text-[11px] font-mono uppercase tracking-wider text-brand-dim block mb-1">
              Current Best Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-3xl text-teal-accent">
                {team?.bestScore > 0 ? team.bestScore.toFixed(1) : "--"}
              </span>
              <span className="font-mono text-xs text-brand-muted">pts</span>
            </div>
            <Link
              href="/leaderboard"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-teal-accent transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-electric-violet" />
              <span>View live standings →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 6. UPLOAD & SUBMIT CODING ARENA */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-teal-accent" />
              <span>Upload Solution Script (.py)</span>
            </h3>
            <p className="text-xs text-brand-muted">
              Submit your algorithm script. It will be executed inside the sandboxed benchmark runner.
            </p>
          </div>

          {/* File Input Controls */}
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 rounded-xl bg-navy-deep hover:bg-bg-secondary border border-navy-border hover:border-teal-accent text-xs font-mono text-teal-accent cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>{fileName ? "Change File" : "Choose .py File"}</span>
              <input
                type="file"
                accept=".py,.ipynb,.txt"
                onChange={handleFileUpload}
                disabled={attemptsLeft === 0 && tournament?.activeStage !== "STAGE_7_LIVE_PATCH"}
                className="hidden"
              />
            </label>

            <button
              onClick={() => openSubmitDialog(false)}
              disabled={attemptsLeft === 0 || !codeContent.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Attempt #{attemptsUsed + 1}</span>
            </button>
          </div>
        </div>

        {/* Code Preview Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
            <span>Code Input Buffer:</span>
            {fileName && <span className="text-teal-accent font-semibold">{fileName}</span>}
          </div>

          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            disabled={attemptsLeft === 0 && tournament?.activeStage !== "STAGE_7_LIVE_PATCH"}
            placeholder="# Paste your Python code here or upload a file above...
# Ensure your script defines solve() or prints the objective value."
            rows={10}
            className="w-full p-4 rounded-xl bg-bg-primary border border-navy-border font-mono text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent resize-y transition-colors leading-relaxed"
          />
        </div>
      </div>

      {/* 7. SUBMISSION HISTORY & RESULTS TABLE */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white">
              Submission History ({submissions.length})
            </h3>
            <p className="text-xs text-brand-muted">
              Detailed breakdown of scores, AST analysis, and written reflections for each attempt.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-xl bg-bg-secondary/40 border border-dashed border-navy-border">
            <FileCode className="w-8 h-8 text-brand-dim mx-auto" />
            <p className="text-xs font-mono text-brand-muted">No submissions recorded yet.</p>
            <p className="text-[11px] text-brand-dim">
              Upload your baseline script to record your Attempt #1.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-border/60 text-brand-dim uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Attempt</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Quality</th>
                  <th className="py-3 px-3">Efficiency</th>
                  <th className="py-3 px-3">AST Design</th>
                  <th className="py-3 px-3">Similarity</th>
                  <th className="py-3 px-3">Reflection Note</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border/40">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-brand-white">
                      {sub.isLivePatch ? (
                        <span className="text-orange-accent">Live Patch</span>
                      ) : (
                        `Attempt #${sub.attemptNumber}`
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-status-green/15 text-status-green border border-status-green/30">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-accent">
                      {sub.autoScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-brand-muted">{sub.solutionQuality.toFixed(1)}</td>
                    <td className="py-3 px-3 text-brand-muted">{sub.efficiencyScore.toFixed(0)}</td>
                    <td className="py-3 px-3 text-brand-muted">{sub.designQuality.toFixed(0)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={
                          sub.similarityFlag
                            ? "text-red-400 font-bold"
                            : "text-brand-muted"
                        }
                      >
                        {sub.similarityScore || 0}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-brand-muted max-w-[160px] truncate font-sans">
                      {sub.whatChangedNotes || sub.approachNotes || "--"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setViewingSubCode(sub)}
                        className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-[11px] transition-colors"
                      >
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 8. MODAL: SUBMISSION CONFIRMATION */}
      <SubmissionModal
        isOpen={isModalOpen}
        attemptNumber={isLivePatchSubmit ? 4 : attemptsUsed + 1}
        filename={fileName || (isLivePatchSubmit ? "live_patch_solution.py" : `attempt_${attemptsUsed + 1}.py`)}
        isLivePatch={isLivePatchSubmit}
        onClose={() => setIsModalOpen(false)}
        onConfirm={executeSubmission}
        isSubmitting={isSubmitting}
      />

      {/* 9. MODAL: SCORE REVEAL CELEBRATION */}
      {latestScoreResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setLatestScoreResult(null)}
              className="absolute top-4 right-4 z-10 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              ✕
            </button>
            <ScoreReveal
              score={latestScoreResult.autoScore}
              breakdown={{
                solutionQuality: latestScoreResult.solutionQuality,
                efficiencyScore: latestScoreResult.efficiencyScore,
                designQuality: latestScoreResult.designQuality,
                consistencyScore: latestScoreResult.consistencyScore,
              }}
              runtimeMs={latestScoreResult.runtimeMs}
              attemptNumber={latestScoreResult.attemptNumber}
              aiExplanation={latestScoreResult.aiExplanation}
              executionLogs={latestScoreResult.executionLogs}
            />
          </div>
        </div>
      )}

      {/* 10. MODAL: CODE VIEWER */}
      {viewingSubCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-bg-card border border-navy-border/80 p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-3">
              <h4 className="font-display font-bold text-sm text-brand-white">
                {viewingSubCode.isLivePatch ? "Stage 7 Live Patch" : `Attempt #${viewingSubCode.attemptNumber}`} — {viewingSubCode.filename}
              </h4>
              <button
                onClick={() => setViewingSubCode(null)}
                className="p-1.5 text-brand-muted hover:text-brand-white transition-colors"
              >
                ✕
              </button>
            </div>
            <CodeViewer
              code={viewingSubCode.codeContent}
              filename={viewingSubCode.filename}
              maxHeight="400px"
            />
          </div>
        </div>
      )}

      {/* 11. MODAL: 7-SECTION PROBLEM STATEMENT VIEWER */}
      {showFullProblemSpec && track && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-bg-card border border-teal-accent/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto relative">
            <button
              onClick={() => setShowFullProblemSpec(false)}
              className="absolute top-5 right-5 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              ✕
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30 text-teal-accent font-bold">
                  {track.shortName}
                </span>
                <span className="text-brand-muted">{track.society}</span>
                <span className="text-electric-violet">· {track.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-brand-white">{track.name}</h2>
              <div className="text-xs font-mono text-teal-accent">{track.technique}</div>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                1. Real-World Context
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">{track.context}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                2. Core Optimization Challenge
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">{track.coreChallenge}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                3. Hard Constraints
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted">
                {track.hardConstraints?.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                4. Optimization Objectives
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted">
                {track.optimizationObjectives?.map((obj: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-teal-accent font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                5. Evaluation Methodology
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Continuous sandboxed benchmarking measuring solution quality, computational efficiency,
                AST design quality, and stability under dynamic perturbations.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-teal-accent font-semibold">
                6. Expected Team Output Checklist
              </h4>
              <ul className="space-y-1.5 text-xs text-brand-muted pt-1">
                {track.expectedOutputChecklist?.map((chk: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-accent shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-navy-border flex items-center justify-between">
              <button
                onClick={() => setShowFullProblemSpec(false)}
                className="px-4 py-2 rounded-xl text-xs text-brand-muted hover:text-brand-white transition-colors"
              >
                Close Spec
              </button>
              {track.starterNotebookUrl && (
                <a
                  href={track.starterNotebookUrl}
                  download
                  className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Starter Script (.py)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
