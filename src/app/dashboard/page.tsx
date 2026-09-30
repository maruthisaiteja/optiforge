"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal, Trophy, Download, Upload, Clock, Zap, Users,
  AlertTriangle, FileCode, CheckCircle2, Bell, Sparkles, Layers,
  ArrowRight, ShieldAlert, HelpCircle, Eye, CheckSquare, ShieldCheck,
  Lock, Copy, Check, Calendar, Building, GraduationCap, ExternalLink,
  EyeOff, LogOut, Server, Globe, Share2, Target, Shield,
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Info, Edit3
} from "lucide-react";
import AiEvaluationResultsModal from "@/components/AiEvaluationResultsModal";
import LoopCodeEvaluationProgressModal from "@/components/LoopCodeEvaluationProgressModal";
import SubmissionInstructionsModal from "@/components/SubmissionInstructionsModal";

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const INNOVATION_THEMES = [
  { id: "theme-1-biomedical-ai", label: "01: Biomedical Artificial Intelligence", society: "IEEE EMBS × CIS" },
  { id: "theme-2-signals", label: "02: Biomedical Signals & Intelligent Systems", society: "IEEE EMBS" },
  { id: "theme-3-imaging", label: "03: Medical Imaging & Computer Vision", society: "IEEE EMBS" },
  { id: "theme-4-ml-ai", label: "04: Machine Learning & Artificial Intelligence", society: "IEEE CIS" },
  { id: "theme-5-autonomous", label: "05: Intelligent Systems & Autonomous Computing", society: "IEEE CIS" },
  { id: "theme-6-open-innovation", label: "06: Open Innovation: CIS × EMBS", society: "IEEE EMBS × CIS" },
];

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
  const [showPassword, setShowPassword] = useState(false);

  // Curated Hack2Skill-grade Submission Form States
  const [selectedTrackId, setSelectedTrackId] = useState("theme-1-biomedical-ai");
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [approachNotes, setApproachNotes] = useState("");
  const [whatChangedNotes, setWhatChangedNotes] = useState("");
  const [formValidation, setFormValidation] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formSectionRef = React.useRef<HTMLDivElement>(null);

  // Modal inspection state
  const [activeModalSubmission, setActiveModalSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // LoopCode 1-minute progressive evaluation modal states
  const [isLoopCodeModalOpen, setIsLoopCodeModalOpen] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const populateFormFromSubmission = (sub: any, overwriteReflection = false, isTest = false) => {
    if (!sub) return;
    if (sub.problemTitle) setProblemTitle(sub.problemTitle);
    if (sub.problemDescription) setProblemDescription(sub.problemDescription);
    if (sub.githubUrl) setGithubUrl(sub.githubUrl);
    if (sub.deployedUrl) setDeployedUrl(sub.deployedUrl);
    if (sub.mediaUrl) setMediaUrl(sub.mediaUrl);
    if (sub.codeContent && !sub.codeContent.startsWith("[GitHub Repository Submission:")) {
      setCodeContent(sub.codeContent);
    }
    if (sub.filename) setFileName(sub.filename);
    if (sub.approachNotes) setApproachNotes(sub.approachNotes);
    if (overwriteReflection && sub.whatChangedNotes) {
      setWhatChangedNotes(sub.whatChangedNotes);
    }
    if (isTest && sub.trackId) {
      setSelectedTrackId(sub.trackId);
    }
  };

  const handleTrackChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTrackId = e.target.value;
    setSelectedTrackId(newTrackId);
    try {
      await fetch("/api/team/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: newTrackId }),
      });
      const profRes = await fetch("/api/team/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        setTeam(profData.team);
        setTrack(profData.track);
      }
    } catch (err) {
      console.error("Failed to update test track:", err);
    }
  };

  const loadDashboardData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsSyncing(true);

      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData?.user || authData.user.role !== "TEAM") {
        router.push("/login");
        return;
      }

      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      const subList: any[] = subData.submissions || [];
      setSubmissions(subList);

      const profRes = await fetch("/api/team/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        const loadedTeam = profData.team;
        setTeam(loadedTeam);
        setTrack(profData.track);
        setTournament(profData.tournament);

        const isTest =
          loadedTeam?.teamCode === "OPT-26-TEST" ||
          loadedTeam?.teamCode?.includes("TEST") ||
          loadedTeam?.leaderEmail === "test@optiforge.internal";

        let populated = false;

        // 1. Try restoring in-progress draft from localStorage (only on initial load, not silent polls)
        if (!isSilent && loadedTeam?.id && typeof window !== "undefined") {
          try {
            const rawDraft = localStorage.getItem(`optiforge_submission_draft_${loadedTeam.id}`);
            if (rawDraft) {
              const draft = JSON.parse(rawDraft);
              if (draft && (draft.problemTitle || draft.githubUrl || draft.codeContent)) {
                if (draft.problemTitle) setProblemTitle(draft.problemTitle);
                if (draft.problemDescription) setProblemDescription(draft.problemDescription);
                if (draft.githubUrl) setGithubUrl(draft.githubUrl);
                if (draft.deployedUrl) setDeployedUrl(draft.deployedUrl);
                if (draft.mediaUrl) setMediaUrl(draft.mediaUrl);
                if (draft.codeContent) setCodeContent(draft.codeContent);
                if (draft.fileName) setFileName(draft.fileName);
                if (draft.approachNotes) setApproachNotes(draft.approachNotes);
                if (draft.whatChangedNotes) setWhatChangedNotes(draft.whatChangedNotes);
                if (isTest && draft.selectedTrackId) {
                  setSelectedTrackId(draft.selectedTrackId);
                } else if (loadedTeam?.domainId) {
                  setSelectedTrackId(loadedTeam.domainId);
                }
                populated = true;
              }
            }
          } catch {}
        }

        // 2. If no local draft was restored, pre-fill from latest recorded submission
        if (!populated && !isSilent && subList.length > 0) {
          const latest = subList[0];
          populateFormFromSubmission(latest, false, isTest);
          if (isTest && latest.trackId) {
            setSelectedTrackId(latest.trackId);
          } else if (loadedTeam?.domainId) {
            setSelectedTrackId(loadedTeam.domainId);
          }
        } else if (!populated && !isSilent && loadedTeam?.domainId) {
          setSelectedTrackId(loadedTeam.domainId);
        }
      }

      const annRes = await fetch("/api/announcements");
      const annData = await annRes.json();
      setAnnouncements(annData.announcements || []);

      setLoading(false);
      setIsSyncing(false);
    } catch {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Multi-device automatic synchronization: Poll every 12 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Don't interrupt if team is actively submitting
      if (!isSubmitting && !isLoopCodeModalOpen) {
        loadDashboardData(true);
      }
    }, 12000);

    return () => clearInterval(pollInterval);
  }, [isSubmitting, isLoopCodeModalOpen]);

  // Auto-save form draft to localStorage on edits
  useEffect(() => {
    if (!team?.id || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `optiforge_submission_draft_${team.id}`,
        JSON.stringify({
          problemTitle,
          problemDescription,
          githubUrl,
          deployedUrl,
          mediaUrl,
          codeContent,
          fileName,
          approachNotes,
          whatChangedNotes,
          selectedTrackId,
        })
      );
    } catch {}
  }, [
    team?.id,
    problemTitle,
    problemDescription,
    githubUrl,
    deployedUrl,
    mediaUrl,
    codeContent,
    fileName,
    approachNotes,
    whatChangedNotes,
    selectedTrackId,
  ]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);

    const hasCode = Boolean(codeContent && codeContent.trim());
    const hasGithub = Boolean(githubUrl && githubUrl.trim());

    if (!hasCode && !hasGithub) {
      setFormValidation("Please provide either a Public GitHub Repository Link OR paste/upload your solution code.");
      return;
    }

    const isTestAccount = team?.teamCode === "OPT-26-TEST" || team?.teamCode?.includes("TEST") || team?.leaderEmail === "test@optiforge.internal";

    const currentAttempts = team?.attemptsUsed || 0;
    if (!isTestAccount && currentAttempts >= 3) {
      setFormValidation("Maximum 3 attempts reached. Further standard submissions are locked.");
      return;
    }

    if (!isTestAccount && currentAttempts >= 1 && (!whatChangedNotes || !whatChangedNotes.trim())) {
      setFormValidation(`A mandatory 'What changed and why' reflection note is required for Attempt ${currentAttempts + 1}.`);
      return;
    }

    setIsSubmitting(true);
    setIsBackendReady(false);
    setPendingSubmission(null);
    setIsLoopCodeModalOpen(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: selectedTrackId,
          problemTitle: problemTitle.trim(),
          problemDescription: problemDescription.trim(),
          githubUrl: githubUrl.trim(),
          deployedUrl: deployedUrl.trim(),
          mediaUrl: mediaUrl.trim(),
          codeContent: codeContent.trim(),
          filename: fileName || (codeContent.trim().startsWith('{"cells"') ? "notebook.ipynb" : "solution.py"),
          approachNotes: approachNotes.trim(),
          whatChangedNotes: whatChangedNotes.trim(),
          isLivePatch: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setIsLoopCodeModalOpen(false);
        setFormValidation(data.error || "Submission evaluation failed.");
        setIsSubmitting(false);
        return;
      }

      // Backend evaluation succeeded! Signal backend readiness to LoopCode modal
      if (data.submission) {
        setPendingSubmission(data.submission);
        setIsBackendReady(true);

        // Update local state smoothly
        setSubmissions((prev) => [data.submission, ...prev.filter((s) => s.id !== data.submission.id)]);
        setTeam((prev: any) => ({
          ...prev,
          attemptsUsed: data.submission.attemptNumber,
          bestScore: data.teamBestScore ?? Math.max(prev?.bestScore || 0, data.submission.autoScore || 0),
        }));

        setFormNotice(
          `✓ Attempt ${data.submission.attemptNumber} evaluated successfully and stored. You can edit any fields below to submit Attempt ${data.submission.attemptNumber + 1 > 3 && !isTestAccount ? "3" : data.submission.attemptNumber + 1}.`
        );
      }

      // Preserve all submitted fields in the editor so teams can easily edit and resubmit
      // Clear only the reflection note so they can write what changed for the next attempt
      setWhatChangedNotes("");

      // Save latest submitted values into localStorage draft
      if (team?.id && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `optiforge_submission_draft_${team.id}`,
            JSON.stringify({
              problemTitle,
              problemDescription,
              githubUrl,
              deployedUrl,
              mediaUrl,
              codeContent,
              fileName,
              approachNotes,
              selectedTrackId,
            })
          );
        } catch {}
      }
    } catch {
      setIsLoopCodeModalOpen(false);
      setFormValidation("Network error during evaluation. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleLoopCodeComplete = () => {
    setIsLoopCodeModalOpen(false);
    setIsSubmitting(false);
    if (pendingSubmission) {
      setActiveModalSubmission(pendingSubmission);
      setIsModalOpen(true);
    }
    loadDashboardData(true);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading OptiForge Intelligence Console...</p>
      </div>
    );
  }

  const members = team?.members || [];
  const leader = members.length > 0 ? members[0] : null;
  const isTestAccount = team?.teamCode === "OPT-26-TEST" || team?.teamCode?.includes("TEST") || team?.leaderEmail === "test@optiforge.internal";
  const defaultPass = isTestAccount ? "Test#Forge2026" : (team?.rawPassword || team?.defaultPassword || `Forge#${team?.teamCode?.split("-")[2] || "2026"}`);
  const isSubmissionsLocked = !isTestAccount && tournament?.submissionsLocked !== false;
  const totalScore = (team?.bestScore || 0) + (team?.vivaScore || 0);

  // Latest submission for quick score card
  const latestSub = submissions.length > 0 ? submissions[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Team Header Bar */}
      <div className="rounded-2xl bg-bg-card border border-navy-border p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
              {team?.teamName || "Team"}
            </h1>
            <span className="px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
            {isTestAccount && (
              <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Test Sandbox (Unlimited Attempts)
              </span>
            )}
          </div>
          <div className="text-sm font-mono text-brand-muted flex flex-wrap items-center gap-4">
            <span>ID: <strong className="text-brand-white">{team?.teamCode}</strong></span>
            {leader && <span>Leader: <strong className="text-brand-white">{leader.name}</strong></span>}
            <span>
              Track:{" "}
              <strong className="text-teal-accent">
                {INNOVATION_THEMES.find((t) => t.id === selectedTrackId)?.label?.split(":")[1]?.trim() || track?.shortName || track?.name || "Biomedical AI"}
              </strong>
              {isTestAccount && <span className="ml-1.5 text-[10px] text-purple-300 font-mono">(Sandbox)</span>}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Synchronize live team status and submissions across devices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Team"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications / Broadcast */}
          {announcements.length > 0 && (
            <div className="p-4 rounded-xl bg-teal-accent/10 border border-teal-accent/30 flex items-start gap-3 text-sm">
              <Bell className="w-5 h-5 text-teal-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-teal-accent uppercase block">[BROADCAST] {announcements[0].title}</span>
                <span className="text-brand-white">{announcements[0].message}</span>
              </div>
            </div>
          )}

          {/* Event Information & Tournament Status Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#D9E6EE] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#00629B] font-semibold text-xs font-mono uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#00629B]" /> Event Date & Time
              </div>
              <div className="text-base font-bold text-[#102A43]">
                30-09-2026
              </div>
              <div className="text-xs text-[#52606D] font-mono">
                09:00 AM – 04:00 PM IST (On-Campus)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D9E6EE] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#772583] font-semibold text-xs font-mono uppercase tracking-wider">
                <Building className="w-4 h-4 text-[#772583]" /> Venue & Host
              </div>
              <div className="text-base font-bold text-[#102A43]">
                Vardhaman College of Eng.
              </div>
              <div className="text-xs text-[#52606D] font-mono">
                IEEE EMBS × CIS Joint Chapters
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D9E6EE] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-[#12A8C4] font-semibold text-xs font-mono uppercase tracking-wider">
                <Zap className="w-4 h-4 text-[#12A8C4]" /> Evaluation Engine
              </div>
              <div className="text-base font-bold text-[#102A43]">
                Autonomous AI Auditor
              </div>
              <div className="text-xs text-[#52606D] font-mono">
                7 Parameters · 2-Decimal Precision
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              HACK2SKILL-GRADE AI CODE SUBMISSION CONSOLE
             ═══════════════════════════════════════════════════════════════ */}
          <div ref={formSectionRef} className="rounded-2xl bg-white border border-[#D9E6EE] shadow-xl overflow-hidden scroll-mt-24">
            
            {/* Header Strip with Attempt Counter */}
            <div className="p-5 border-b border-[#D9E6EE] bg-gradient-to-r from-[#F0F7FB] via-white to-[#F6F1F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00629B]/15 border border-[#00629B]/30 flex items-center justify-center text-[#00629B]">
                  <Sparkles className="w-5 h-5 text-[#00629B]" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#102A43] flex items-center gap-2">
                    [Submission] Challenge Evaluation Console
                  </h2>
                  <p className="text-xs text-[#52606D]">
                    Autonomous multi-dimensional code and system audit for OptiForge 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#D9E6EE] text-xs font-mono text-[#102A43] shadow-xs">
                  Evaluation Attempts: <strong className="text-[#00629B]">{team?.attemptsUsed || 0} {isTestAccount ? "(Unlimited Sandbox)" : "/ 3"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsInstructionsOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F0F7FB] border border-[#00629B]/40 hover:border-[#00629B] text-[#00629B] text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="View Hack2Skill Challenge Submission Rules & Evaluation Details"
                >
                  <Info className="w-3.5 h-3.5 text-[#00629B]" />
                  <span>Instructions</span>
                </button>
              </div>
            </div>

            {/* Criteria Evaluation Badges (Hack2Skill parameters) */}
            <div className="p-4 border-b border-[#D9E6EE] bg-[#F8FAFC] space-y-2.5">
              <div className="text-xs text-[#52606D] font-mono">
                Your code submission is evaluated autonomously across the following 7 core parameters:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Code Quality (20%)", icon: <FileCode className="w-3.5 h-3.5 text-[#00629B]" /> },
                  { label: "Efficiency & Latency (18%)", icon: <Zap className="w-3.5 h-3.5 text-[#12A8C4]" /> },
                  { label: "Testing & Validation (18%)", icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> },
                  { label: "Security & Secrets (12%)", icon: <Shield className="w-3.5 h-3.5 text-[#238B68]" /> },
                  { label: "Problem Alignment (12%)", icon: <Target className="w-3.5 h-3.5 text-emerald-700" /> },
                  { label: "Track Innovation (10%)", icon: <Sparkles className="w-3.5 h-3.5 text-[#772583]" /> },
                  { label: "Accessibility & Docs (10%)", icon: <Eye className="w-3.5 h-3.5 text-indigo-600" /> },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#D9E6EE] text-[11px] font-mono font-medium text-[#102A43] shadow-2xs"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 bg-white">

              {/* Status / Pre-filled Data Notification Banner */}
              {formNotice && (
                <div className="p-3.5 rounded-xl bg-[#00629B]/10 border border-[#00629B]/30 text-[#00629B] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00629B]" />
                    <span className="font-medium">{formNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormNotice(null)}
                    className="text-xs text-[#52606D] hover:text-[#102A43] ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Submissions Locked Pre-Event Banner */}
              {isSubmissionsLocked && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-sm flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Lock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-amber-900 font-display">
                        Submissions Locked Until Event Launch
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        OPENS: SEPT 30, 2026 · 09:00 AM IST
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed font-sans">
                      Your team credentials and registration are confirmed! Code submission and autonomous AI auditing will officially unlock tomorrow morning at 09:00 AM IST at Vardhaman College of Engineering. In the meantime, review your track specifications and prepare your GitHub repository.
                    </p>
                  </div>
                </div>
              )}

              {/* Sandbox Bypass Active Banner */}
              {isTestAccount && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="font-medium">
                      <strong>Sandbox Mode Active:</strong> You are logged into the test evaluation account with bypass privileges (unlimited attempts & dynamic track selection).
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-200/80 text-purple-900 font-mono text-[10px] font-bold shrink-0">
                    BYPASS ACTIVE
                  </span>
                </div>
              )}

              {submissions.length > 0 && !formNotice && !isSubmissionsLocked && (
                <div className="p-3.5 rounded-xl bg-[#00629B]/10 border border-[#00629B]/25 text-[#00629B] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-[#00629B]" />
                    <span>
                      Stored data from Attempt #{latestSub?.attemptNumber || submissions.length} is pre-filled. Edit your links, description, or code below and submit Attempt {(team?.attemptsUsed || 0) + 1} {isTestAccount ? "(Unlimited Sandbox)" : "of 3"}.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProblemTitle("");
                      setProblemDescription("");
                      setGithubUrl("");
                      setDeployedUrl("");
                      setMediaUrl("");
                      setCodeContent("");
                      setFileName("");
                      setWhatChangedNotes("");
                      setFormNotice("Editor fields cleared. You can start fresh.");
                      if (team?.id && typeof window !== "undefined") {
                        try {
                          localStorage.removeItem(`optiforge_submission_draft_${team.id}`);
                        } catch {}
                      }
                    }}
                    className="text-[11px] underline text-[#52606D] hover:text-[#102A43] shrink-0 ml-2"
                  >
                    Clear Fields
                  </button>
                </div>
              )}
              
              {/* Submission Instruction Card */}
              <div className="p-4 rounded-xl bg-[#F0F7FB] border border-[#D9E6EE] text-xs text-[#52606D] space-y-1.5">
                <div className="font-bold text-[#102A43] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#00629B]" />
                  Submission Guidelines:
                </div>
                <p className="leading-relaxed">
                  • Public GitHub repositories are scanned for source AST modularity, test fixtures, zero plain-text secrets, and commit history.<br />
                  • Deployed endpoints are probed live for TTFB latency (ms), HTTPS, and viewport accessibility.<br />
                  • Max 3 attempts allowed. Each submission produces a continuous 2-decimal precision audit score.
                </p>
              </div>

              {/* Form Input Fields (Disabled when submissions locked) */}
              <fieldset disabled={isSubmissionsLocked} className={isSubmissionsLocked ? "opacity-75 pointer-events-none select-none space-y-5" : "space-y-5"}>

                {/* 1. Challenge Track Selection: Locked for regular teams, selectable for test sandbox */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#102A43]">
                      Challenges / Domain Track <span className="text-[#00629B]">*</span>
                    </label>
                    {isTestAccount ? (
                      <span className="text-[10px] text-purple-700 font-mono font-bold flex items-center gap-1 bg-purple-100 px-2.5 py-0.5 rounded border border-purple-300">
                        <Sparkles className="w-3 h-3 text-purple-600" /> Test Sandbox Selector
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#00629B] font-mono font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#00629B]" /> Locked upon Registration
                      </span>
                    )}
                  </div>

                  {isTestAccount ? (
                    <>
                      <select
                        value={selectedTrackId}
                        onChange={handleTrackChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-purple-400 text-xs text-[#102A43] focus:outline-none focus:border-[#00629B] transition-colors font-mono cursor-pointer"
                      >
                        {INNOVATION_THEMES.map((theme) => (
                          <option key={theme.id} value={theme.id}>
                            {theme.label} ({theme.society})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-[#52606D] font-mono">
                        Sandbox privilege: Change track at any time to audit your code against different challenge ontologies.
                      </p>
                    </>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#F0F7FB] border border-[#D9E6EE] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00629B]/10 border border-[#00629B]/30 flex items-center justify-center text-[#00629B] shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#102A43]">
                            {INNOVATION_THEMES.find((t) => t.id === (team?.domainId || selectedTrackId))?.label || track?.name || "Biomedical Artificial Intelligence"}
                          </div>
                          <div className="text-[10px] text-[#52606D] font-mono">
                            {INNOVATION_THEMES.find((t) => t.id === (team?.domainId || selectedTrackId))?.society || track?.society || "IEEE EMBS × CIS"} · Registered Theme (Non-transferable)
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#00629B]/10 border border-[#00629B]/30 text-[#00629B] text-[10px] font-mono font-bold shrink-0">
                        LOCKED
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Problem Statement Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#102A43]">
                    Problem Statement Title <span className="text-[#00629B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={problemTitle}
                    onChange={(e) => setProblemTitle(e.target.value)}
                    placeholder="e.g., Real-time Arrhythmia Detection using Continuous Wavelet Neural Networks"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-[#00629B] focus:bg-white focus:ring-2 focus:ring-[#00629B]/10 transition-colors"
                  />
                </div>

                {/* 3. Problem Statement Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#102A43]">
                    Problem Description &amp; Methodology <span className="text-[#00629B]">*</span>
                  </label>
                  <textarea
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    rows={3}
                    placeholder="Summarize the core clinical or computational challenge, constraints addressed, optimization objectives, and algorithmic approach..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-[#00629B] focus:bg-white focus:ring-2 focus:ring-[#00629B]/10 transition-colors resize-none"
                  />
                </div>

                {/* 4. Public GitHub Repository Link */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#102A43] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GithubIcon className="w-3.5 h-3.5 text-[#00629B]" />
                      Public GitHub Repository Link
                    </span>
                    <span className="text-[10px] text-[#52606D] font-mono">AST, Tests &amp; Secrets Scanned</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repository"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-[#00629B] focus:bg-white focus:ring-2 focus:ring-[#00629B]/10 transition-colors font-mono"
                  />
                </div>

                {/* 5. Deployed Prototype URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#102A43] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-[#12A8C4]" />
                      Deployed Link - (Vercel / Cloud Run / Streamlit / Render URL)
                    </span>
                    <span className="text-[10px] text-[#52606D] font-mono">TTFB Latency &amp; Viewport Probed</span>
                  </label>
                  <input
                    type="url"
                    value={deployedUrl}
                    onChange={(e) => setDeployedUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app or cloud instance URL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-[#00629B] focus:bg-white focus:ring-2 focus:ring-[#00629B]/10 transition-colors font-mono"
                  />
                </div>

                {/* 6. LinkedIn / Demo Video / Presentation URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#102A43] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-[#772583]" />
                      Presentation / Demo Video / LinkedIn Post Link
                    </span>
                    <span className="text-[10px] text-[#52606D] font-mono">Optional Deliverable</span>
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/... or YouTube/Drive demo link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-[#00629B] focus:bg-white focus:ring-2 focus:ring-[#00629B]/10 transition-colors font-mono"
                  />
                </div>

                {/* 7. Solution Code / Jupyter Notebook Content */}
                <div className="space-y-2 pt-2 border-t border-[#D9E6EE]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-[#00629B]" />
                      Source Code / Jupyter Notebook (.py, .ipynb)
                    </label>
                    {fileName && (
                      <span className="text-[11px] font-mono text-[#00629B] font-bold">
                        Attached: {fileName}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder="# Paste executable Python code or Jupyter Notebook JSON here..."
                    rows={6}
                    className="w-full p-4 rounded-xl bg-[#0A192F] border border-slate-700 font-mono text-xs text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:border-[#00629B] focus:ring-2 focus:ring-[#00629B]/20 transition-all leading-relaxed"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0F7FB] border border-[#D9E6EE] text-xs font-mono font-medium text-[#102A43] hover:bg-[#E2EEF5] cursor-pointer transition-colors w-fit">
                      <Upload className="w-3.5 h-3.5 text-[#00629B]" />
                      <span>Upload Code / Notebook (.py, .ipynb, .zip)</span>
                      <input
                        type="file"
                        accept=".py,.ipynb,.zip,.js,.ts,.cpp,.java"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[11px] text-[#52606D] font-mono">
                      {codeContent.length > 0 ? `${codeContent.length} chars` : "Or submit via GitHub link"}
                    </span>
                  </div>
                </div>

                {/* 8. Mandatory 'What Changed and Why' Note for Attempt 2 and 3 */}
                {(team?.attemptsUsed || 0) >= 1 && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                    <label className="block text-xs font-bold text-orange-900 flex items-center justify-between">
                      <span>What Changed &amp; Why? {isTestAccount ? "(Optional in Sandbox)" : "(Mandatory Reflection)"}</span>
                      <span className="text-[10px] font-mono text-orange-800 font-semibold">
                        {isTestAccount ? "* Optional Sandbox Reflection" : `* Required for Attempt ${(team?.attemptsUsed || 0) + 1}`}
                      </span>
                    </label>
                    <textarea
                      value={whatChangedNotes}
                      onChange={(e) => setWhatChangedNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g., In response to validation set error on high-noise samples, incorporated Butterworth bandpass filtering and tuned learning rate..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-orange-300 text-xs text-[#102A43] placeholder:text-[#829AB1] focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>
                )}

              </fieldset>

              {/* Validation Warning */}
              {formValidation && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-medium">{formValidation}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isSubmissionsLocked || (!isTestAccount && (team?.attemptsUsed || 0) >= 3)}
                  className={`w-full py-4 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                    isSubmissionsLocked
                      ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
                      : (!isTestAccount && (team?.attemptsUsed || 0) >= 3)
                      ? "bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed shadow-none"
                      : "bg-[#00629B] hover:bg-[#005180] text-white shadow-[#00629B]/20 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Autonomous AI Auditor Inspecting Codebase &amp; Deployments...</span>
                    </>
                  ) : isSubmissionsLocked ? (
                    <>
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Submissions Locked Until Event Day (Tomorrow Sept 30, 2026 · 09:00 AM IST)</span>
                    </>
                  ) : (!isTestAccount && (team?.attemptsUsed || 0) >= 3) ? (
                    <span>All 3 Evaluation Attempts Utilized (Locked)</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        Submit Solution for AI Evaluation (Attempt {(team?.attemptsUsed || 0) + 1} {isTestAccount ? "· Unlimited Sandbox" : "of 3"})
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              LATEST AI EVALUATION SCORE CARD (Hack2Skill UI)
             ═══════════════════════════════════════════════════════════════ */}
          {latestSub && (
            <div className="p-6 rounded-2xl bg-white border border-[#D9E6EE] shadow-lg space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E6EE] pb-4">
                <div>
                  <div className="text-xs font-mono text-[#00629B] font-bold uppercase tracking-wider">
                    Latest Submission Results (Attempt #{latestSub.attemptNumber})
                  </div>
                  <h3 className="font-display font-black text-2xl text-[#102A43]">
                    AI Evaluation Score: {Number(latestSub.autoScore || 0).toFixed(2)} <span className="text-sm font-normal text-[#52606D]">/ 100</span>
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setActiveModalSubmission(latestSub);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#00629B]/10 hover:bg-[#00629B]/20 border border-[#00629B]/30 text-[#00629B] font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-xs"
                >
                  <Eye className="w-4 h-4 text-[#00629B]" />
                  <span>View Full AI Insights &amp; Audit Report</span>
                </button>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00629B] via-[#12A8C4] to-[#238B68] transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(0, latestSub.autoScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Detailed Score Breakdown Grid (7 Parameters) */}
              <div className="space-y-3 pt-2">
                <div className="text-xs text-[#52606D] font-mono uppercase tracking-wider font-semibold">
                  Multi-Dimensional Parameter Breakdown
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Code Quality", weight: "20%", score: latestSub.codeQualityScore ?? latestSub.solutionQuality ?? Number(latestSub.autoScore || 0), color: "bg-[#00629B]" },
                    { label: "Efficiency & Latency", weight: "18%", score: latestSub.efficiencyMetricScore ?? latestSub.efficiencyScore ?? Number(latestSub.autoScore || 0), color: "bg-[#12A8C4]" },
                    { label: "Testing & Validation", weight: "18%", score: latestSub.testingScore ?? latestSub.consistencyScore ?? Number(latestSub.autoScore || 0), color: "bg-sky-600" },
                    { label: "Security & Secrets", weight: "12%", score: latestSub.securityScore ?? Number(latestSub.autoScore || 0), color: "bg-[#238B68]" },
                    { label: "Problem Alignment", weight: "12%", score: latestSub.problemAlignmentScore ?? latestSub.designQuality ?? Number(latestSub.autoScore || 0), color: "bg-emerald-600" },
                    { label: "Track Innovation", weight: "10%", score: latestSub.domainTrackScore ?? Number(latestSub.autoScore || 0), color: "bg-[#772583]" },
                    { label: "Accessibility & Docs", weight: "10%", score: latestSub.accessibilityScore ?? Number(latestSub.autoScore || 0), color: "bg-indigo-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#102A43] font-bold flex items-center gap-1.5">
                          <span>{item.label}</span>
                          <span className="text-[10px] text-[#52606D] font-mono font-normal">({item.weight})</span>
                        </span>
                        <span className="font-mono font-bold text-[#00629B] text-xs">{Number(item.score).toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              ATTEMPT HISTORY (Matching Image 3)
             ═══════════════════════════════════════════════════════════════ */}
          <div className="p-6 rounded-2xl bg-white border border-[#D9E6EE] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-[#102A43] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#00629B]" /> Attempt History
              </h3>
              <span className="text-xs text-[#52606D] font-mono">
                {submissions.length} Recorded Attempts
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#F8FAFC] border border-[#D9E6EE] text-[#52606D] text-xs font-mono">
                No submissions recorded yet. Submissions open on event day (Sept 30, 2026 · 09:00 AM IST).
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any, idx: number) => {
                  const currentScore = Number(sub.autoScore || 0);
                  const prevSub = submissions[idx + 1];
                  const prevScore = prevSub ? Number(prevSub.autoScore || 0) : null;
                  const delta = prevScore !== null ? currentScore - prevScore : null;

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F0F7FB] border border-[#D9E6EE] flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#D9E6EE] flex items-center justify-center font-mono font-bold text-[#00629B] text-sm shadow-2xs">
                          #{sub.attemptNumber}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#102A43] flex items-center gap-2">
                            <span>Attempt {sub.attemptNumber}</span>
                            {delta !== null && delta !== 0 && (
                              <span
                                className={`text-[11px] font-mono flex items-center gap-0.5 font-bold ${
                                  delta > 0 ? "text-[#238B68]" : "text-[#D84A5A]"
                                }`}
                              >
                                {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#52606D] font-mono">
                            {new Date(sub.submittedAt).toLocaleString("en-IN")} · {sub.filename || "GitHub Submission"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <span className="font-display font-black text-lg text-[#00629B]">
                            {currentScore.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-[#52606D] block font-mono">/ 100</span>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmissionsLocked}
                          onClick={() => {
                            populateFormFromSubmission(sub, true, isTestAccount);
                            setFormNotice(`Loaded Attempt #${sub.attemptNumber} data into editor. Make changes and submit Attempt ${(team?.attemptsUsed || 0) + 1}.`);
                            formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#00629B]/10 hover:bg-[#00629B]/20 border border-[#00629B]/30 text-[#00629B] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Load this attempt's code and details into editor"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit &amp; Resubmit</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveModalSubmission(sub);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#772583]/10 hover:bg-[#772583]/20 border border-[#772583]/30 text-[#772583] text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Audit</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT SIDEBAR
           ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          
          {/* Total Score & View Leaderboard */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-bg-card to-navy-deep border border-teal-accent/30 text-center space-y-4">
            <div className="text-brand-dim text-xs font-mono uppercase tracking-wider">Total Score</div>
            <div className="text-5xl font-black text-brand-white font-display">
              {totalScore.toFixed(2)}
            </div>
            <div className="text-xs text-brand-muted font-mono">
              Auto Best: <strong className="text-teal-accent">{Number(team?.bestScore || 0).toFixed(2)}</strong> + Viva: <strong className="text-orange-accent">{Number(team?.vivaScore || 0)}</strong>
            </div>
            <Link
              href="/leaderboard"
              className="block w-full py-3 rounded-xl bg-bg-secondary border border-teal-accent/50 text-teal-accent font-bold text-sm hover:bg-teal-accent/10 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>

          {/* Judge / Viva Section */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-orange-accent" /> Judge / Viva
            </h3>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/50">
                <span className="text-brand-dim">Status</span>
                <span className={team?.vivaCompleted ? "text-status-green font-bold" : "text-orange-accent"}>
                  {team?.vivaCompleted ? "Evaluated" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-bg-secondary/50">
                <span className="text-brand-dim">Viva Score</span>
                <span className="text-brand-white font-bold">{team?.vivaScore || 0} / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-bg-secondary/50 space-y-1">
                <span className="text-brand-dim block">Feedback</span>
                <p className="text-brand-white text-xs font-sans italic">
                  {team?.vivaFeedback || "No feedback provided yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-accent" /> Team Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map((m: any, idx: number) => (
                <div key={m.id || idx} className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-white">{m.name}</span>
                    <span className="text-[10px] text-teal-accent px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/20">
                      {idx === 0 ? "Leader" : "Member"}
                    </span>
                  </div>
                  <div className="text-xs text-brand-muted mt-1">{m.rollNumber} • {m.branch}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-accent" /> Account Details
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-dim uppercase">Team ID</div>
                  <div className="font-bold text-brand-white">{team?.teamCode}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(team?.teamCode, "id")}
                  className="p-1.5 rounded-lg hover:bg-bg-card text-brand-muted hover:text-brand-white transition-colors"
                >
                  {copiedTeamId ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary/50 border border-navy-border/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-brand-dim uppercase">Password</div>
                  <div className="font-bold text-brand-white">
                    {showPassword ? defaultPass : "••••••••"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg hover:bg-bg-card text-brand-muted hover:text-brand-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(defaultPass, "pass")}
                    className="p-1.5 rounded-lg hover:bg-bg-card text-brand-muted hover:text-brand-white transition-colors"
                  >
                    {copiedPass ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Hack2Skill-Grade AI Evaluation Results Modal */}
      <AiEvaluationResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        submission={activeModalSubmission}
      />

      {/* LoopCode Progressive 1-Minute Evaluation Progress Modal */}
      <LoopCodeEvaluationProgressModal
        isOpen={isLoopCodeModalOpen}
        problemTitle={problemTitle || "OptiForge Technical Track Challenge"}
        filename={fileName || (codeContent.trim().startsWith('{"cells"') ? "notebook.ipynb" : "solution.py")}
        isBackendReady={isBackendReady}
        onComplete={handleLoopCodeComplete}
      />

      {/* Hack2Skill-Style Submission Instructions Modal */}
      <SubmissionInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
}
