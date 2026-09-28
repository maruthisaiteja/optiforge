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

  const loadDashboardData = async () => {
    try {
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

        // 1. Try restoring in-progress draft from localStorage
        if (loadedTeam?.id && typeof window !== "undefined") {
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
        if (!populated && subList.length > 0) {
          const latest = subList[0];
          populateFormFromSubmission(latest, false, isTest);
          if (isTest && latest.trackId) {
            setSelectedTrackId(latest.trackId);
          } else if (loadedTeam?.domainId) {
            setSelectedTrackId(loadedTeam.domainId);
          }
        } else if (!populated && loadedTeam?.domainId) {
          setSelectedTrackId(loadedTeam.domainId);
        }
      }

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
  }, []);

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
        setFormValidation(data.error || "Submission evaluation failed.");
        setIsSubmitting(false);
        return;
      }

      // Open AI results modal immediately on success
      if (data.submission) {
        setActiveModalSubmission(data.submission);
        setIsModalOpen(true);
      }

      // Preserve all submitted fields in the editor so teams can easily edit and resubmit
      // Clear only the reflection note so they can write what changed for the next attempt
      setWhatChangedNotes("");
      setIsSubmitting(false);
      setFormNotice(
        `✓ Attempt ${data.submission?.attemptNumber || (team?.attemptsUsed || 0) + 1} evaluated successfully and stored. You can edit any fields below to submit Attempt ${(team?.attemptsUsed || 0) + 2 > 3 && !isTestAccount ? "3" : (team?.attemptsUsed || 0) + 2}.`
      );

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

      loadDashboardData();
    } catch {
      setFormValidation("Network error during evaluation. Please try again.");
      setIsSubmitting(false);
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
  const defaultPass = isTestAccount ? "Test#Forge2026" : (team?.defaultPassword || `Forge#${team?.teamCode?.split("-")[2] || "2026"}`);
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
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
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

          {/* Event Information & Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-bg-card border border-navy-border space-y-3">
              <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-accent" /> Event Info
              </h3>
              <div className="text-sm text-brand-muted font-mono space-y-2">
                <p>Date: <span className="text-brand-white">30-09-2026</span></p>
                <p>Location: <span className="text-brand-white">Vardhaman College of Eng.</span></p>
                <p>Evaluation: <span className="text-teal-accent">Autonomous AI Multi-Dimensional Auditor</span></p>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-bg-card border border-navy-border space-y-3">
              <h3 className="font-display font-bold text-brand-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-accent" /> Checklist
              </h3>
              <ul className="text-xs text-brand-muted font-sans space-y-1">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Download Starter Kit</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Setup Environment & Dependencies</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-status-green" /> Prepare GitHub Repo & Deployed Link</li>
              </ul>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              HACK2SKILL-GRADE AI CODE SUBMISSION CONSOLE
             ═══════════════════════════════════════════════════════════════ */}
          <div ref={formSectionRef} className="rounded-2xl bg-bg-card border border-navy-border shadow-xl overflow-hidden scroll-mt-24">
            
            {/* Header Strip with Attempt Counter */}
            <div className="p-5 border-b border-navy-border bg-[#0C192E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-accent/15 border border-teal-accent/30 flex items-center justify-center text-teal-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-brand-white flex items-center gap-2">
                    [Submission] Challenge Evaluation
                  </h2>
                  <p className="text-xs text-brand-muted">
                    Autonomous multi-dimensional audit for OptiForge 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-bg-secondary border border-navy-border text-xs font-mono text-brand-white">
                  Submission Attempts: <strong className="text-teal-accent">{team?.attemptsUsed || 0} {isTestAccount ? "(Unlimited Sandbox)" : "/ 3"}</strong>
                </span>
              </div>
            </div>

            {/* Criteria Evaluation Badges (Hack2Skill parameters) */}
            <div className="p-5 border-b border-navy-border/60 bg-[#091424] space-y-2.5">
              <div className="text-xs text-brand-dim font-mono">
                Your code submission is evaluated by AI on the following criteria:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Code Quality", icon: <FileCode className="w-3.5 h-3.5 text-teal-accent" /> },
                  { label: "Security", icon: <Shield className="w-3.5 h-3.5 text-emerald-400" /> },
                  { label: "Efficiency", icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
                  { label: "Testing", icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> },
                  { label: "Accessibility", icon: <Eye className="w-3.5 h-3.5 text-purple-400" /> },
                  { label: "Problem Statement Alignment", icon: <Target className="w-3.5 h-3.5 text-emerald-300" /> },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-secondary/70 border border-navy-border text-[11px] font-mono text-brand-white"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">

              {/* Status / Pre-filled Data Notification Banner */}
              {formNotice && (
                <div className="p-3.5 rounded-xl bg-teal-accent/15 border border-teal-accent/40 text-teal-accent text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-accent" />
                    <span>{formNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormNotice(null)}
                    className="text-xs text-brand-muted hover:text-brand-white ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {submissions.length > 0 && !formNotice && (
                <div className="p-3.5 rounded-xl bg-teal-accent/10 border border-teal-accent/25 text-teal-accent text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-teal-accent" />
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
                    className="text-[11px] underline text-brand-muted hover:text-brand-white shrink-0 ml-2"
                  >
                    Clear Fields
                  </button>
                </div>
              )}
              
              {/* Submission Instruction Card */}
              <div className="p-4 rounded-xl bg-bg-secondary/60 border border-navy-border/60 text-xs text-brand-muted space-y-1">
                <div className="font-semibold text-brand-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-accent" />
                  Submission Guidelines:
                </div>
                <p className="leading-relaxed">
                  • Public GitHub repositories are scanned for source AST modularity, test fixtures, zero plain-text secrets, and commit history.<br />
                  • Deployed endpoints are probed live for TTFB latency (ms), HTTPS, and viewport accessibility.<br />
                  • Max 3 attempts allowed. Each submission produces a continuous 2-decimal precision audit score.
                </p>
              </div>

              {/* 1. Challenge Track Selection: Locked for regular teams, selectable for test sandbox */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-white">
                    Challenges / Domain Track <span className="text-teal-accent">*</span>
                  </label>
                  {isTestAccount ? (
                    <span className="text-[10px] text-purple-300 font-mono font-semibold flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                      <Sparkles className="w-3 h-3 text-purple-400" /> Test Sandbox Selector
                    </span>
                  ) : (
                    <span className="text-[10px] text-teal-accent font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-teal-accent" /> Locked upon Registration
                    </span>
                  )}
                </div>

                {isTestAccount ? (
                  <>
                    <select
                      value={selectedTrackId}
                      onChange={handleTrackChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-purple-500/40 text-xs text-brand-white focus:outline-none focus:border-teal-accent transition-colors font-mono cursor-pointer"
                    >
                      {INNOVATION_THEMES.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.label} ({theme.society})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-brand-muted font-mono">
                      Sandbox privilege: Change track at any time to audit your code against different challenge ontologies.
                    </p>
                  </>
                ) : (
                  <div className="p-3.5 rounded-xl bg-bg-secondary/70 border border-navy-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-center text-teal-accent shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand-white">
                          {INNOVATION_THEMES.find((t) => t.id === (team?.domainId || selectedTrackId))?.label || track?.name || "Biomedical Artificial Intelligence"}
                        </div>
                        <div className="text-[10px] text-brand-muted font-mono">
                          {INNOVATION_THEMES.find((t) => t.id === (team?.domainId || selectedTrackId))?.society || track?.society || "IEEE EMBS × CIS"} · Registered Theme (Non-transferable)
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-[10px] font-mono font-bold shrink-0">
                      LOCKED
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Problem Statement Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-white">
                  Problem Statement Title <span className="text-teal-accent">*</span>
                </label>
                <input
                  type="text"
                  value={problemTitle}
                  onChange={(e) => setProblemTitle(e.target.value)}
                  placeholder="e.g., Real-time Arrhythmia Detection using Continuous Wavelet Neural Networks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors"
                />
              </div>

              {/* 3. Problem Statement Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-white">
                  Problem Description & Methodology <span className="text-teal-accent">*</span>
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={3}
                  placeholder="Summarize the core clinical or computational challenge, constraints addressed, optimization objectives, and algorithmic approach..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors resize-none"
                />
              </div>

              {/* 4. Public GitHub Repository Link */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GithubIcon className="w-3.5 h-3.5 text-teal-accent" />
                    Public GitHub Repository Link
                  </span>
                  <span className="text-[10px] text-brand-muted font-mono">AST, Tests & Secrets Scanned</span>
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username/your-repository"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors font-mono"
                />
              </div>

              {/* 5. Deployed Prototype URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    Deployed Link - (Vercel / Cloud Run / Streamlit / Render URL)
                  </span>
                  <span className="text-[10px] text-brand-muted font-mono">TTFB Latency & Viewport Probed</span>
                </label>
                <input
                  type="url"
                  value={deployedUrl}
                  onChange={(e) => setDeployedUrl(e.target.value)}
                  placeholder="https://your-app.vercel.app or cloud instance URL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors font-mono"
                />
              </div>

              {/* 6. LinkedIn / Demo Video / Presentation URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    Presentation / Demo Video / LinkedIn Post Link
                  </span>
                  <span className="text-[10px] text-brand-muted font-mono">Optional Deliverable</span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/... or YouTube/Drive demo link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors font-mono"
                />
              </div>

              {/* 7. Solution Code / Jupyter Notebook Content */}
              <div className="space-y-2 pt-2 border-t border-navy-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-brand-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-teal-accent" />
                    Source Code / Jupyter Notebook (.py, .ipynb)
                  </label>
                  {fileName && (
                    <span className="text-[11px] font-mono text-teal-accent font-semibold">
                      Attached: {fileName}
                    </span>
                  )}
                </div>

                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="# Paste executable Python code or Jupyter Notebook JSON here..."
                  rows={6}
                  className="w-full p-3.5 rounded-xl bg-bg-secondary border border-navy-border font-mono text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent transition-colors"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-secondary border border-navy-border text-xs font-mono text-brand-white hover:bg-navy-deep cursor-pointer transition-colors w-fit">
                    <Upload className="w-3.5 h-3.5 text-teal-accent" />
                    <span>Upload Code / Notebook (.py, .ipynb, .zip)</span>
                    <input
                      type="file"
                      accept=".py,.ipynb,.zip,.js,.ts,.cpp,.java"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[11px] text-brand-muted font-mono">
                    {codeContent.length > 0 ? `${codeContent.length} chars` : "Or submit via GitHub link"}
                  </span>
                </div>
              </div>

              {/* 8. Mandatory 'What Changed and Why' Note for Attempt 2 and 3 */}
              {(team?.attemptsUsed || 0) >= 1 && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                  <label className="block text-xs font-semibold text-orange-400 flex items-center justify-between">
                    <span>What Changed & Why? {isTestAccount ? "(Optional in Sandbox)" : "(Mandatory Reflection)"}</span>
                    <span className="text-[10px] font-mono">
                      {isTestAccount ? "* Optional Sandbox Reflection" : `* Required for Attempt ${(team?.attemptsUsed || 0) + 1}`}
                    </span>
                  </label>
                  <textarea
                    value={whatChangedNotes}
                    onChange={(e) => setWhatChangedNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g., In response to validation set error on high-noise samples, incorporated Butterworth bandpass filtering and tuned learning rate..."
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-orange-400 transition-colors resize-none"
                  />
                </div>
              )}

              {/* Validation Warning */}
              {formValidation && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formValidation}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || (!isTestAccount && (team?.attemptsUsed || 0) >= 3)}
                  className="w-full py-3.5 rounded-xl bg-teal-accent hover:bg-teal-accent/90 disabled:bg-navy-deep disabled:text-brand-muted text-slate-950 font-display font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-accent/10"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Autonomous AI Auditor Inspecting Codebase & Deployments...</span>
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
            <div className="p-6 rounded-2xl bg-bg-card border border-navy-border space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border/50 pb-4">
                <div>
                  <div className="text-xs font-mono text-teal-accent uppercase tracking-wider">
                    Latest Submission Results
                  </div>
                  <h3 className="font-display font-black text-2xl text-brand-white">
                    AI Evaluation Score: {Number(latestSub.autoScore || 0).toFixed(2)} <span className="text-sm font-normal text-brand-muted">/ 100</span>
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setActiveModalSubmission(latestSub);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-accent/15 hover:bg-teal-accent/25 border border-teal-accent/30 text-teal-accent text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full AI Insights & Audit Report</span>
                </button>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-accent to-emerald-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, latestSub.autoScore || 0))}%` }}
                  />
                </div>
              </div>

              {/* Detailed Score Breakdown Grid (7 Parameters) */}
              <div className="space-y-3 pt-2">
                <div className="text-xs text-brand-muted font-mono uppercase tracking-wider">
                  Detailed Score Breakdown
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Code Quality", weight: "20%", score: latestSub.codeQualityScore ?? latestSub.solutionQuality ?? Number(latestSub.autoScore || 0), color: "bg-teal-400" },
                    { label: "Efficiency & Latency", weight: "18%", score: latestSub.efficiencyMetricScore ?? latestSub.efficiencyScore ?? Number(latestSub.autoScore || 0), color: "bg-cyan-400" },
                    { label: "Testing & Validation", weight: "18%", score: latestSub.testingScore ?? latestSub.consistencyScore ?? Number(latestSub.autoScore || 0), color: "bg-sky-400" },
                    { label: "Security & Secrets", weight: "12%", score: latestSub.securityScore ?? Number(latestSub.autoScore || 0), color: "bg-emerald-400" },
                    { label: "Problem Alignment", weight: "12%", score: latestSub.problemAlignmentScore ?? latestSub.designQuality ?? Number(latestSub.autoScore || 0), color: "bg-teal-300" },
                    { label: "Track Innovation", weight: "10%", score: latestSub.domainTrackScore ?? Number(latestSub.autoScore || 0), color: "bg-indigo-400" },
                    { label: "Accessibility & Docs", weight: "10%", score: latestSub.accessibilityScore ?? Number(latestSub.autoScore || 0), color: "bg-purple-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-brand-white font-medium flex items-center gap-1.5">
                          <span>{item.label}</span>
                          <span className="text-[10px] text-brand-muted font-mono">({item.weight})</span>
                        </span>
                        <span className="font-mono font-bold text-teal-accent">{Number(item.score).toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-brand-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-teal-accent" /> Attempt History
              </h3>
              <span className="text-xs text-brand-muted font-mono">
                {submissions.length} Recorded Attempts
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-bg-secondary/40 border border-navy-border/50 text-brand-muted text-xs font-mono">
                No submissions recorded yet. Fill out the form above to run your first evaluation.
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
                      className="p-4 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary border border-navy-border/60 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-bg-card border border-navy-border flex items-center justify-center font-mono font-bold text-teal-accent text-sm">
                          #{sub.attemptNumber}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-brand-white flex items-center gap-2">
                            <span>Attempt {sub.attemptNumber}</span>
                            {delta !== null && delta !== 0 && (
                              <span
                                className={`text-[11px] font-mono flex items-center gap-0.5 ${
                                  delta > 0 ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-brand-muted font-mono">
                            {new Date(sub.submittedAt).toLocaleString("en-IN")} · {sub.filename}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-1">
                          <span className="font-display font-black text-lg text-teal-accent">
                            {currentScore.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-brand-muted block font-mono">/ 100</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            populateFormFromSubmission(sub, true, isTestAccount);
                            setFormNotice(`Loaded Attempt #${sub.attemptNumber} data into editor. Make changes and submit Attempt ${(team?.attemptsUsed || 0) + 1}.`);
                            formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-accent/10 hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Load this attempt's code and details into editor"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit & Resubmit</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveModalSubmission(sub);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-accent/15 hover:bg-teal-accent/25 border border-teal-accent/30 text-teal-accent text-xs font-semibold flex items-center gap-1 transition-colors"
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
    </div>
  );
}
