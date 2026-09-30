"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  CreditCard,
  Layers,
  FileCode,
  Trophy,
  Bell,
  Award,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Download,
  Flame,
  FileCheck,
  Check,
  Sliders,
  Sparkles,
  Clock,
  ShieldAlert,
  Eye,
  Key,
  ClipboardList,
  UserCog,
  Copy,
  Lock,
  Mail,
} from "lucide-react";
import { downloadSingleCertificate, downloadAllTeamCertificates } from "@/lib/certificateGenerator";
import { generateAttendanceSheetPdf, generateCredentialsSheetPdf } from "@/lib/pdfReportGenerator";
import TeamManagementTab, { OFFICIAL_INNOVATION_DOMAINS, normalizeDomainId } from "@/components/admin/TeamManagementTab";
import AuditLogsTab from "@/components/admin/AuditLogsTab";

export default function AdminPortal() {
  const router = useRouter();

  const [isGeneratingAllCerts, setIsGeneratingAllCerts] = useState(false);
  const [certProgressStatus, setCertProgressStatus] = useState("");

  const [activeTab, setActiveTab] = useState<
    "TEAMS" | "TEAM_MGMT" | "SUBMISSIONS" | "STAGE_CTRL" | "CONFIDENTIAL_SHIFTS" | "LEADERBOARD_CTRL" | "ANNOUNCEMENTS" | "CERTIFICATES" | "AUDIT_LOGS"
  >("TEAMS");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [livePatchMins, setLivePatchMins] = useState<number>(20);

  // Announcement state
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annType, setAnnType] = useState("INFO");
  const [sendingAnn, setSendingAnn] = useState(false);

  // Score override state
  const [overrideModal, setOverrideModal] = useState<any>(null);
  const [overrideScore, setOverrideScore] = useState<number>(85);
  const [overrideReason, setOverrideReason] = useState("");

  // Payment override state
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [paymentTxId, setPaymentTxId] = useState("");
  const [paymentReason, setPaymentReason] = useState("");
  const [approvedCredentials, setApprovedCredentials] = useState<{ teamCode: string; password: string; email: string } | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [credentialModal, setCredentialModal] = useState<any>(null);
  const [credentialNote, setCredentialNote] = useState("");
  const [generatingCred, setGeneratingCred] = useState(false);
  const [generatedCred, setGeneratedCred] = useState<any>(null);
  const [sendingModalEmail, setSendingModalEmail] = useState(false);
  const [modalEmailNotice, setModalEmailNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const overview = await res.json();
      setData(overview);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAdminAction = async (action: string, payload: any) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });

      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || "Action failed.");
        return;
      }

      // Refresh overview
      fetchAdminData();
    } catch {
      alert("Error executing admin action.");
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingAnn(true);
    await handleAdminAction("BROADCAST_ANNOUNCEMENT", {
      title: annTitle,
      message: annMessage,
      type: annType,
    });
    setAnnTitle("");
    setAnnMessage("");
    setSendingAnn(false);
  };

  const executeScoreOverride = async () => {
    if (!overrideReason.trim()) {
      alert("A mandatory audit reason is required.");
      return;
    }
    await handleAdminAction("OVERRIDE_SCORE", {
      teamCode: overrideModal.teamCode,
      newScore: overrideScore,
      reason: overrideReason,
    });
    setOverrideModal(null);
  };

  const executePaymentOverride = async () => {
    await handleAdminAction("MARK_PAID", {
      teamCode: paymentModal.teamCode,
      transactionId: paymentTxId || paymentModal.razorpayPaymentId || `manual_upi_${Date.now()}`,
      reason: paymentReason || "Admin manual verification",
    });
    // Show generated credentials to admin so they can email them
    const codeNum = paymentModal.teamCode.split("-")[2] || "2026";
    setApprovedCredentials({
      teamCode: paymentModal.teamCode,
      password: `Forge#${codeNum}`,
      email: paymentModal.leaderEmail,
    });
    setPaymentModal(null);
  };

  const markPaymentFailed = async () => {
    await handleAdminAction("MARK_PAID", {
      teamCode: paymentModal.teamCode,
      transactionId: "PAYMENT_FAILED",
      reason: paymentReason || "Payment verification failed",
    });
    // Actually mark as FAILED via a direct call
    await handleAdminAction("TOGGLE_DISQUALIFY", {
      teamCode: paymentModal.teamCode,
      reason: "Payment failed - auto-disqualified",
    });
    setPaymentModal(null);
  };

  const exportTeamsCsv = () => {
    if (!data?.teams) return;
    const headers = "TeamCode,TeamName,Track,LeaderEmail,LeaderPhone,MembersCount,PaymentStatus,AttemptsUsed,BestScore\n";
    const rows = data.teams
      .map(
        (t: any) =>
          `"${t.teamCode}","${t.teamName}","${OFFICIAL_INNOVATION_DOMAINS.find(d => d.id === normalizeDomainId(t.domainId))?.shortName || t.track?.shortName || t.domainId}","${t.leaderEmail}","${t.leaderPhone}",${t.members?.length || 0},"${t.paymentStatus}",${t.attemptsUsed},${t.bestScore}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OptiForge_2026_Teams_${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Admin Operations Console...</p>
      </div>
    );
  }

  // Filter teams
  const filteredTeams = (data?.teams || []).filter((team: any) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.razorpayPaymentId && team.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && team.paymentStatus === statusFilter;
  });

  const isFrozen = data?.settings?.find((s: any) => s.key === "leaderboard_frozen")?.value === "true";
  const isVisible = data?.settings?.find((s: any) => s.key === "leaderboard_visible")?.value === "true";
  const activeStage = data?.settings?.find((s: any) => s.key === "active_stage")?.value || "STAGE_0_PRE_EVENT";
  const livePatchDeadline = data?.settings?.find((s: any) => s.key === "live_patch_deadline")?.value || "";

  const weightAuto = Number(data?.settings?.find((s: any) => s.key === "weight_auto")?.value || 60);
  const weightJudge = Number(data?.settings?.find((s: any) => s.key === "weight_judge")?.value || 40);

  const tournamentStages = [
    { key: "STAGE_1_ROUND_1", label: "Stage 1", time: "09:00 - 12:15", name: "1st Round" },
    { key: "STAGE_2_SUBMISSION_1", label: "Stage 2", time: "12:15 - 12:30", name: "Online Submission for AI Evaluation" },
    { key: "STAGE_3_LUNCH", label: "Stage 3", time: "12:30 - 13:15", name: "Lunch Break" },
    { key: "STAGE_4_ROUND_2", label: "Stage 4", time: "13:15 - 14:45", name: "2nd Round" },
    { key: "STAGE_5_SUBMISSION_2", label: "Stage 5", time: "14:45 - 15:00", name: "Online Submission for AI Evaluation" },
    { key: "STAGE_6_EXPERT_EVAL", label: "Stage 6", time: "15:00 - 16:00", name: "Expert Panel Evaluation" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Master Organizer Console · IEEE EMBS × IEEE CIS</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
            OptiForge Control Center
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time tournament oversight, stage triggers, financial reconciliation, and grading verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-xs font-mono transition-all flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4 text-teal-accent" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => generateAttendanceSheetPdf(data?.teams || [])}
            className="px-3.5 py-2.5 rounded-xl bg-[#00629B]/25 hover:bg-[#00629B]/40 border border-[#00629B]/60 text-white text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-sm"
            title="Generate Official Physical Desk Attendance Roster for verified UTR-submitted teams only (PDF)"
          >
            <FileCheck className="w-4 h-4 text-teal-accent" />
            <span>Attendance Sheet (PDF)</span>
          </button>

          <button
            onClick={() => generateCredentialsSheetPdf(data?.teams || [])}
            className="px-3.5 py-2.5 rounded-xl bg-[#772583]/25 hover:bg-[#772583]/40 border border-[#772583]/60 text-white text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-sm"
            title="Generate Master Credentials Directory with Team IDs, Names & Passwords (PDF)"
          >
            <Key className="w-4 h-4 text-orange-accent" />
            <span>Credentials (PDF)</span>
          </button>

          <button
            onClick={exportTeamsCsv}
            className="px-3.5 py-2.5 rounded-xl bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono font-semibold transition-all flex items-center gap-2"
            title="Export complete 3-sheet Excel/CSV master roster"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {(() => {
            const isLocked = data?.settings?.find((s: any) => s.key === "submissions_locked")?.value !== "false";
            return (
              <button
                onClick={async () => {
                  const targetState = !isLocked;
                  const confirmMsg = targetState
                    ? "Lock team code submissions? (Teams will be blocked from submitting code until unlocked or event day)"
                    : "Unlock team code submissions? (Teams will be able to submit code and receive autonomous AI scores)";
                  if (!window.confirm(confirmMsg)) return;
                  await handleAdminAction("SET_SUBMISSIONS_LOCK", { locked: targetState });
                  fetchAdminData();
                }}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-sm ${
                  isLocked
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                    : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                }`}
                title={isLocked ? "Submissions are currently LOCKED for participants. Click to unlock." : "Submissions are currently UNLOCKED. Click to lock."}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Submissions: LOCKED</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Submissions: UNLOCKED</span>
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* KPI Stats HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Total Teams Registered
          </span>
          <div className="font-display font-black text-2xl text-brand-white">
            {data?.stats?.totalTeams}
          </div>
          <p className="text-[10px] text-brand-dim">
            {data?.stats?.confirmedTeams} confirmed · {data?.stats?.pendingTeams} pending
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Total Collected (₹)
          </span>
          <div className="font-display font-black text-2xl text-status-green">
            ₹{data?.stats?.totalCollected}
          </div>
          <p className="text-[10px] text-brand-dim">
            {data?.stats?.totalParticipants} student seats verified
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Submissions Processed
          </span>
          <div className="font-display font-black text-2xl text-electric-violet">
            {data?.stats?.totalSubmissions}
          </div>
          <p className="text-[10px] text-brand-dim">
            {data?.stats?.flaggedSubmissions} similarity warnings
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Active Domain Judges
          </span>
          <div className="font-display font-black text-2xl text-orange-accent">
            {data?.stats?.judgesCount}
          </div>
          <p className="text-[10px] text-brand-dim">Across {data?.tracks?.length || 6} CI Domains</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono border-b border-navy-border/60">
        <button
          onClick={() => setActiveTab("TEAMS")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "TEAMS"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Teams & Payments ({data?.teams?.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "SUBMISSIONS"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Submissions Oversight ({data?.submissions?.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("STAGE_CTRL")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "STAGE_CTRL"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Clock className="w-4 h-4 text-orange-accent" />
          <span>Tournament Stages & Live Patch</span>
        </button>

        <button
          onClick={() => setActiveTab("CONFIDENTIAL_SHIFTS")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "CONFIDENTIAL_SHIFTS"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Key className="w-4 h-4 text-electric-violet" />
          <span>Confidential Shifts Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADERBOARD_CTRL")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "LEADERBOARD_CTRL"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Leaderboard & Weights</span>
        </button>

        <button
          onClick={() => setActiveTab("ANNOUNCEMENTS")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "ANNOUNCEMENTS"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Broadcast Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab("CERTIFICATES")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "CERTIFICATES"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("TEAM_MGMT")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "TEAM_MGMT"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Team Management</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDIT_LOGS")}
          className={`px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
            activeTab === "AUDIT_LOGS"
              ? "bg-navy-deep text-teal-accent border border-teal-accent/40"
              : "text-brand-muted hover:text-brand-white"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Audit Logs ({data?.auditLogs?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: TEAMS & PAYMENTS - Full Member Details & Credential Generation */}
      {activeTab === "TEAMS" && (
        <div className="space-y-4">
          {/* Pending Verification Banner */}
          {(() => {
            const pendingCount = (data?.teams || []).filter(
              (t: any) =>
                t.razorpaySignature !== "ADMIN_VERIFIED_APPROVED" &&
                (t.razorpayPaymentId || t.paymentStatus === "CONFIRMED" || t.razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL")
            ).length;
            if (pendingCount === 0) return null;
            return (
              <div className="p-4 rounded-2xl bg-orange-accent/10 border border-orange-accent/40 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-orange-accent">
                    {pendingCount} Team(s) Awaiting Payment Verification &amp; Credential Generation
                  </h4>
                  <p className="text-xs text-orange-accent/80">
                    Participants cannot log in until you verify their UPI UTR against bank records and generate their credentials. Click &ldquo;Generate Credentials&rdquo; on any team below to generate their login and copy the official credentials email template.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-navy-border/80">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by team name, code, leader email, or UTR..."
                className="w-full bg-transparent text-xs text-brand-white placeholder:text-brand-dim focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-brand-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED (Paid)</option>
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              </select>

              <button
                onClick={() => generateAttendanceSheetPdf(data?.teams || [])}
                className="px-2.5 py-1.5 rounded-lg bg-[#00629B]/20 hover:bg-[#00629B]/30 border border-[#00629B]/40 text-teal-accent font-semibold transition-all flex items-center gap-1.5"
                title="Download official physical desk attendance sheet for verified teams with submitted UTR (PDF)"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Attendance (PDF)</span>
              </button>

              <button
                onClick={() => generateCredentialsSheetPdf(data?.teams || [])}
                className="px-2.5 py-1.5 rounded-lg bg-[#772583]/20 hover:bg-[#772583]/30 border border-[#772583]/40 text-orange-accent font-semibold transition-all flex items-center gap-1.5"
                title="Download official team login IDs and passwords master directory (PDF)"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Credentials (PDF)</span>
              </button>
            </div>
          </div>

          {/* Team Cards / List */}
          <div className="space-y-3">
            {filteredTeams.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bg-card border border-navy-border/80 text-brand-muted text-xs font-mono">
                No teams found matching your query.
              </div>
            ) : (
              filteredTeams.map((t: any) => {
                const isExpanded = expandedTeam === t.teamCode;
                const isApproved = t.razorpaySignature === "ADMIN_VERIFIED_APPROVED";
                const hasUtr = !!t.razorpayPaymentId;
                const isPendingApproval = !isApproved && (hasUtr || t.paymentStatus === "CONFIRMED" || t.razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL");

                return (
                  <div
                    key={t.id}
                    className={`rounded-2xl bg-bg-card border transition-all overflow-hidden ${
                      isPendingApproval
                        ? "border-orange-accent/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                        : isApproved
                        ? "border-status-green/40"
                        : t.isDisqualified
                        ? "border-status-red/40"
                        : "border-navy-border/80"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Code, Name, Badges */}
                      <div className="space-y-1.5 min-w-[220px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-teal-accent text-sm">
                            {t.teamCode}
                          </span>
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-green/15 text-status-green border border-status-green/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              CREDENTIALS SENT
                            </span>
                          )}
                          {isPendingApproval && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-accent/20 text-orange-accent border border-orange-accent/40 animate-pulse flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              UTR AWAITING VERIFICATION
                            </span>
                          )}
                          {!isApproved && !isPendingApproval && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-deep text-brand-dim border border-navy-border">
                              PAYMENT PENDING
                            </span>
                          )}
                          {t.isDisqualified && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-red/20 text-status-red border border-status-red/40">
                              DISQUALIFIED
                            </span>
                          )}
                        </div>
                        <div className="font-display font-bold text-base text-brand-white">
                          {t.teamName}
                        </div>
                        <div className="text-xs text-brand-muted font-mono">
                          Theme: <span className="text-teal-300 font-semibold">{OFFICIAL_INNOVATION_DOMAINS.find(d => d.id === normalizeDomainId(t.domainId))?.shortName || t.track?.shortName || t.domainId || "Unassigned"}</span>
                        </div>
                      </div>

                      {/* Middle 1: Leader & Members count */}
                      <div className="text-xs space-y-1 min-w-[180px]">
                        <span className="text-[10px] uppercase font-mono text-brand-dim block">Team Leader</span>
                        <div className="font-medium text-brand-white">{t.members?.[0]?.name || t.leaderEmail}</div>
                        <div className="text-teal-accent font-mono text-[11px]">{t.leaderEmail}</div>
                        <div className="text-brand-dim font-mono text-[11px]">{t.leaderPhone}</div>
                      </div>

                      {/* Middle 2: Payment details */}
                      <div className="text-xs space-y-1 min-w-[160px] font-mono">
                        <span className="text-[10px] uppercase text-brand-dim block">Payment</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${t.paymentStatus === "CONFIRMED" ? "text-status-green" : "text-orange-accent"}`}>
                            {t.paymentStatus === "CONFIRMED" ? "CONFIRMED" : "PENDING"} (₹{t.paymentAmount || 100})
                          </span>
                        </div>
                        {t.razorpayPaymentId ? (
                          <div className="text-[11px] text-teal-accent bg-bg-secondary px-2 py-0.5 rounded border border-navy-border inline-block">
                            UTR: <span className="font-bold">{t.razorpayPaymentId}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPaymentModal(t)}
                            className="text-[10px] text-orange-accent hover:underline block"
                          >
                            + Add Offline Payment
                          </button>
                        )}
                      </div>

                      {/* Middle 3: Score & Attempts */}
                      <div className="text-xs text-center min-w-[70px] font-mono">
                        <span className="text-[10px] uppercase text-brand-dim block">Score</span>
                        <div className="font-bold text-base text-teal-accent">
                          {t.bestScore > 0 ? t.bestScore.toFixed(1) : "--"}
                        </div>
                        <div className="text-[10px] text-brand-dim">{t.attemptsUsed || 0}/3 tries</div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {/* 1. Generate / View Credentials button */}
                        <button
                          onClick={() => {
                            setCredentialModal(t);
                            setGeneratedCred(null);
                            setCredentialNote("");
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                            isPendingApproval
                              ? "bg-gradient-to-r from-teal-accent to-status-green text-bg-primary hover:brightness-110 shadow-[0_0_12px_rgba(47,230,214,0.3)] animate-pulse"
                              : isApproved
                              ? "bg-bg-secondary hover:bg-navy-deep border border-status-green/50 text-status-green"
                              : "bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white"
                          }`}
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>{isApproved ? "View Credentials" : "Generate Credentials"}</span>
                        </button>

                        {isApproved && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch("/api/admin/email/send-credentials", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ teamCode: t.teamCode }),
                                });
                                const r = await res.json();
                                if (res.ok && r.success) {
                                  alert(`Credentials email sent to ${r.count} member(s) of ${t.teamName}: ${r.sentTo.join(", ")}`);
                                } else {
                                  alert(r.error || "Failed to send email.");
                                }
                              } catch {
                                alert("Network error sending email.");
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-teal-accent/15 hover:bg-teal-accent/25 border border-teal-accent/30 text-teal-accent text-xs font-mono transition-colors flex items-center gap-1.5"
                            title="Dispatch official credentials email to all team members"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                        )}

                        {/* 2. Expand/Collapse Members button */}
                        <button
                          onClick={() => setExpandedTeam(isExpanded ? null : t.teamCode)}
                          className="px-3 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-xs font-mono transition-colors flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5 text-teal-accent" />
                          <span>{isExpanded ? "Hide Details" : `Members (${t.members?.length || 0})`}</span>
                        </button>

                        {/* 3. Override score */}
                        <button
                          onClick={() => {
                            setOverrideModal(t);
                            setOverrideScore(t.bestScore || 85);
                            setOverrideReason("");
                          }}
                          className="px-2.5 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-muted hover:text-brand-white text-xs transition-colors"
                          title="Override Score"
                        >
                          Score
                        </button>

                        {/* 4. Disqualify / Reinstate */}
                        <button
                          onClick={() =>
                            handleAdminAction("TOGGLE_DISQUALIFY", {
                              teamCode: t.teamCode,
                              reason: "Admin manual toggle",
                            })
                          }
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                            t.isDisqualified
                              ? "bg-status-red text-white hover:bg-red-600"
                              : "bg-bg-secondary text-brand-muted hover:text-status-red border border-navy-border"
                          }`}
                          title={t.isDisqualified ? "Reinstate Team" : "Disqualify Team"}
                        >
                          {t.isDisqualified ? "Disqualified" : "Disqualify"}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED SECTION: Complete Member Roster & Verification Details */}
                    {isExpanded && (
                      <div className="border-t border-navy-border/60 bg-bg-secondary/40 p-5 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-navy-border/40">
                          <span className="text-xs font-mono uppercase tracking-wider text-teal-accent font-bold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Registered Team Members ({t.members?.length || 0})
                          </span>
                          <span className="text-xs font-mono text-brand-dim">
                            Registered: {new Date(t.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Members Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(t.members && t.members.length > 0 ? t.members : [
                            { name: t.teamName, email: t.leaderEmail, phone: t.leaderPhone, collegeName: "N/A", rollNumber: "N/A", branch: "N/A", year: "N/A" }
                          ]).map((m: any, mIdx: number) => (
                            <div
                              key={mIdx}
                              className="p-4 rounded-xl bg-bg-primary border border-navy-border/80 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between pb-1.5 border-b border-navy-border/40">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    mIdx === 0
                                      ? "bg-teal-accent/20 text-teal-accent border border-teal-accent/30"
                                      : "bg-navy-deep text-brand-muted border border-navy-border"
                                  }`}>
                                    {mIdx === 0 ? "TEAM LEADER" : `MEMBER ${mIdx + 1}`}
                                  </span>
                                  <span className="font-bold text-brand-white text-sm">{m.name}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-[11px]">
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">College</span>
                                  <span className="text-brand-white font-sans">{m.collegeName || "Vardhaman College of Eng."}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">Roll Number</span>
                                  <span className="text-teal-accent font-bold">{m.rollNumber || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">Department / Branch</span>
                                  <span className="text-brand-white">{m.branch || "CSE"}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">Academic Year</span>
                                  <span className="text-brand-white">{m.year || "3rd Year"}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">Email</span>
                                  <span className="text-brand-white break-all">{m.email}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dim block text-[10px] uppercase">Phone</span>
                                  <span className="text-brand-white">{m.phone}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Payment & Security Audit Box */}
                        <div className="p-4 rounded-xl bg-bg-primary border border-navy-border/80 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                          <div className="space-y-1">
                            <span className="text-brand-dim block text-[10px] uppercase">UTR / Payment Verification Status</span>
                            <div className="flex items-center gap-2">
                              <span className="text-brand-white font-bold">UTR Reference:</span>
                              <span className="text-teal-accent font-bold text-sm">{t.razorpayPaymentId || "None"}</span>
                              <span className="text-brand-dim">|</span>
                              <span className="text-brand-white">Fee: ₹{t.paymentAmount || 100}</span>
                              <span className="text-brand-dim">|</span>
                              <span className="text-brand-white">Status:</span>
                              <span className={t.paymentStatus === "CONFIRMED" ? "text-status-green font-bold" : "text-orange-accent"}>
                                {t.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCredentialModal(t);
                                setGeneratedCred(null);
                                setCredentialNote("");
                              }}
                              className="px-4 py-2 rounded-xl bg-teal-accent text-bg-primary font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>{isApproved ? "Re-open Credentials Email" : "Approve & Generate Credentials"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMISSIONS OVERSIGHT */}
      {activeTab === "SUBMISSIONS" && (
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-navy-border/60 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Live Submissions Queue ({data?.submissions?.length})
              </h3>
              <p className="text-xs text-brand-muted">
                Audit sandbox test logs, AST design scores, similarity flags, and written reflections.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-navy-border/60 text-brand-dim uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Team</th>
                  <th className="py-3 px-3">Attempt</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">AST Design</th>
                  <th className="py-3 px-3">Plagiarism Flag</th>
                  <th className="py-3 px-3">Reflection Note</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-border/40">
                {(data?.submissions || []).map((sub: any) => {
                  const subTeam = data?.teams?.find((t: any) => t.id === sub.teamId);
                  return (
                    <tr key={sub.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 text-brand-dim">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-brand-white">
                        {subTeam?.teamName || sub.teamId}
                      </td>
                      <td className="py-3 px-3">
                        {sub.isLivePatch ? (
                          <span className="text-orange-accent font-bold">Stage 7 Live Patch</span>
                        ) : (
                          `#${sub.attemptNumber}`
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-teal-accent">{sub.autoScore.toFixed(1)}</td>
                      <td className="py-3 px-3 text-brand-muted">{sub.designQuality}/100</td>
                      <td className="py-3 px-3">
                        {sub.similarityFlag ? (
                          <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                            FLAGGED ({sub.similarityScore}%)
                          </span>
                        ) : (
                          <span className="text-brand-dim">{sub.similarityScore || 0}%</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-brand-muted max-w-[200px] truncate font-sans">
                        {sub.whatChangedNotes || sub.approachNotes || "--"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            handleAdminAction("RESCORE_SUBMISSION", { submissionId: sub.id })
                          }
                          className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-[11px]"
                        >
                          Re-run Benchmark
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOURNAMENT STAGES & LIVE PATCH CONTROLLER */}
      {activeTab === "STAGE_CTRL" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-bg-card border border-navy-border/80 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-accent/15 border border-orange-accent/30 text-orange-accent text-xs font-mono font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Master Stage Advancement Controller</span>
                </div>
                <h2 className="font-display font-bold text-xl text-brand-white">
                  Event Lifecycle Progression
                </h2>
                <p className="text-xs text-brand-muted">
                  Advance tournament stages to dynamically trigger scenario shifts, freeze rankings, and start the live patch countdown.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bg-secondary border border-navy-border font-mono text-xs">
                <span className="text-brand-dim block text-[10px]">CURRENT ACTIVE STAGE</span>
                <span className="text-teal-accent font-bold text-sm">{activeStage}</span>
              </div>
            </div>

            {/* Stage Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tournamentStages.map((stg) => {
                const isActive = stg.key === activeStage;
                return (
                  <div
                    key={stg.key}
                    className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#00629B] to-[#004A75] border-[#00629B] text-white shadow-xl"
                        : "bg-bg-secondary/60 border-navy-border/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-teal-accent font-bold">{stg.label}</span>
                        <span className="text-brand-dim text-[11px]">{stg.time}</span>
                      </div>
                      <h4 className="font-display font-semibold text-brand-white text-xs leading-snug">
                        {stg.name}
                      </h4>
                    </div>

                    <button
                      onClick={() =>
                        handleAdminAction("ADVANCE_STAGE", { stage: stg.key, livePatchMins })
                      }
                      disabled={isActive}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                        isActive
                          ? "bg-teal-accent text-bg-primary font-bold cursor-default"
                          : "bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent"
                      }`}
                    >
                      {isActive ? "✓ CURRENT STAGE" : "Trigger This Stage"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage 7 Live Patch Countdown Launcher */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-accent/15 via-bg-card to-bg-card border border-orange-accent/40 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-navy-border/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-accent/20 border border-orange-accent/40 flex items-center justify-center text-orange-accent">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-brand-white">
                  Stage 7 Live Patch Round Launcher
                </h3>
                <p className="text-xs text-brand-muted">
                  Triggers the surprise constraint across all 6 problem tracks with an automatic countdown clock.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-brand-muted block">Live Patch Duration (Minutes):</label>
                <select
                  value={livePatchMins}
                  onChange={(e) => setLivePatchMins(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-bg-secondary border border-navy-border text-brand-white"
                >
                  <option value={15}>15 Minutes (Fast Pace)</option>
                  <option value={20}>20 Minutes (Standard Spec)</option>
                  <option value={25}>25 Minutes (Extended)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-brand-muted block">Active Deadline:</label>
                <div className="px-3 py-2 rounded-xl bg-bg-secondary border border-navy-border text-brand-white">
                  {livePatchDeadline ? new Date(livePatchDeadline).toLocaleTimeString() : "No Active Timer"}
                </div>
              </div>

              <div className="pt-5">
                <button
                  onClick={() =>
                    handleAdminAction("ADVANCE_STAGE", {
                      stage: "STAGE_7_LIVE_PATCH",
                      livePatchMins,
                    })
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-accent to-red-500 text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Start Live Patch Round ({livePatchMins}m Countdown)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIDENTIAL SHIFTS INSPECTOR */}
      {activeTab === "CONFIDENTIAL_SHIFTS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-bg-card border border-navy-border/80 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-navy-border/60 pb-3">
              <Key className="w-5 h-5 text-electric-violet" />
              <div>
                <h3 className="font-display font-bold text-base text-brand-white">
                  Confidential Scenario Shifts & Surprise Constraints (Admin Only)
                </h3>
                <p className="text-xs text-brand-muted">
                  Strictly hidden from public and team views until unlocked dynamically by tournament stage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data?.tracks || []).map((tr: any) => (
                <div
                  key={tr.id}
                  className="p-5 rounded-2xl bg-bg-secondary/60 border border-navy-border/80 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-navy-border/40 pb-2">
                    <span className="font-display font-bold text-sm text-brand-white">
                      {tr.shortName || tr.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-accent/10 text-teal-accent border border-teal-accent/30">
                      {tr.technique}
                    </span>
                  </div>

                  {/* Hidden Shift 1 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-orange-accent font-bold block">
                      Attempt 2 Shift (Shift #1):
                    </span>
                    <p className="text-xs text-brand-white leading-relaxed font-sans">
                      {tr.hiddenShiftAttempt2 || "Staff reduction / Energy surge"}
                    </p>
                  </div>

                  {/* Hidden Shift 2 */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-electric-violet font-bold block">
                      Attempt 3 Shift (Shift #2):
                    </span>
                    <p className="text-xs text-brand-white leading-relaxed font-sans">
                      {tr.hiddenShiftAttempt3 || "Demand spike / Corridor blockage"}
                    </p>
                  </div>

                  {/* Live Patch Surprise */}
                  <div className="space-y-1 p-3 rounded-xl bg-bg-primary border border-orange-accent/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-orange-accent font-bold block">
                      Stage 7 Live Patch Surprise Constraint:
                    </span>
                    <p className="text-xs text-brand-white leading-relaxed font-sans">
                      {tr.livePatchSurprise || "Emergency operational constraint"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LEADERBOARD & FORMULA WEIGHTS */}
      {activeTab === "LEADERBOARD_CTRL" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border/80 space-y-6 shadow-xl">
            <h3 className="font-display font-bold text-base text-brand-white">
              Leaderboard Display Controls
            </h3>

            <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-brand-white text-xs">Freeze Leaderboard Updates</h4>
                <p className="text-[11px] text-brand-muted">
                  Locks the public leaderboard at 14:15 while secret scoring continues.
                </p>
              </div>
              <button
                onClick={() =>
                  handleAdminAction("TOGGLE_SETTING", {
                    key: "leaderboard_frozen",
                    value: isFrozen ? "false" : "true",
                  })
                }
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isFrozen
                    ? "bg-orange-accent text-white shadow-glow-orange"
                    : "bg-navy-deep text-brand-muted hover:text-brand-white"
                }`}
              >
                {isFrozen ? "FROZEN (Click to Unfreeze)" : "UNFROZEN"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-brand-white text-xs">Public Leaderboard Visibility</h4>
                <p className="text-[11px] text-brand-muted">
                  Show or hide the leaderboard completely before event begins.
                </p>
              </div>
              <button
                onClick={() =>
                  handleAdminAction("TOGGLE_SETTING", {
                    key: "leaderboard_visible",
                    value: isVisible ? "false" : "true",
                  })
                }
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isVisible
                    ? "bg-teal-accent text-bg-primary shadow-glow"
                    : "bg-navy-deep text-brand-muted"
                }`}
              >
                {isVisible ? "VISIBLE" : "HIDDEN"}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border/80 space-y-6 shadow-xl">
            <h3 className="font-display font-bold text-base text-brand-white">
              Formula Weights Configuration
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Auto-Benchmark Weight:</span>
                  <span className="font-bold text-teal-accent">{weightAuto}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weightAuto}
                  onChange={(e) => {
                    const autoW = Number(e.target.value);
                    const judgeW = 100 - autoW;
                    handleAdminAction("TOGGLE_SETTING", { key: "weight_auto", value: String(autoW) });
                    handleAdminAction("TOGGLE_SETTING", { key: "weight_judge", value: String(judgeW) });
                  }}
                  className="w-full accent-teal-accent cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Judge Rubric Weight:</span>
                  <span className="font-bold text-electric-violet">{weightJudge}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weightJudge}
                  disabled
                  className="w-full accent-electric-violet opacity-60"
                />
              </div>

              <p className="text-[11px] text-brand-dim font-sans">
                Official Spec: 60% Auto-Score + 40% Average Manual Judge Score.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
      {activeTab === "ANNOUNCEMENTS" && (
        <div className="max-w-xl mx-auto rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-navy-border/60 pb-4">
            <Bell className="w-5 h-5 text-teal-accent" />
            <h3 className="font-display font-bold text-base text-brand-white">
              Push Broadcast Alert to Teams
            </h3>
          </div>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-brand-muted mb-1">Alert Headline / Title</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. 15 Minutes Remaining in Submission Window"
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
              />
            </div>

            <div>
              <label className="block text-brand-muted mb-1">Message Content</label>
              <textarea
                required
                rows={3}
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Message displayed in prominent neon banner on all team dashboards..."
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
              />
            </div>

            <div>
              <label className="block text-brand-muted mb-1">Alert Severity</label>
              <select
                value={annType}
                onChange={(e) => setAnnType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white focus:outline-none focus:border-teal-accent"
              >
                <option value="INFO">Information (Teal)</option>
                <option value="WARNING">Warning (Orange)</option>
                <option value="URGENT">Urgent (Red Alert)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sendingAnn}
              className="w-full py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>{sendingAnn ? "Broadcasting Alert..." : "Broadcast Alert to All Teams"}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: CERTIFICATES STUDIO */}
      {activeTab === "CERTIFICATES" && (
        <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-brand-white">
                Official E-Certificate Generation Studio
              </h3>
              <p className="text-xs text-brand-muted">
                Authenticated E-Certificates generated separately per participant under IEEE EMBS & IEEE CIS.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isGeneratingAllCerts}
                onClick={async () => {
                  setIsGeneratingAllCerts(true);
                  setCertProgressStatus("Starting batch certificate download...");
                  await downloadAllTeamCertificates(data?.teams || [], (curr, total, name) => {
                    setCertProgressStatus(`Downloading ${curr}/${total}: ${name}`);
                  });
                  setCertProgressStatus("Completed downloading all participant certificates!");
                  setTimeout(() => {
                    setIsGeneratingAllCerts(false);
                    setCertProgressStatus("");
                  }, 3000);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-mono font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingAllCerts ? "Generating & Downloading..." : "Download All Certificates"}</span>
              </button>
            </div>
          </div>

          {certProgressStatus && (
            <div className="p-3.5 rounded-xl bg-teal-accent/10 border border-teal-accent/30 text-teal-accent text-xs font-mono flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{certProgressStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data?.teams || [])
              .filter(
                (team: any) =>
                  !["OPT-26-1904", "OPT-26-3340", "OPT-26-7902"].includes((team.teamCode || "").toUpperCase()) &&
                  !["TEAM 1904", "I'M GAME", "TEST"].includes((team.teamName || "").trim().toUpperCase())
              )
              .map((team: any) => {
                const trackName = team.track?.name || team.track?.shortName || "Computational Intelligence Track";

                return (
                  <div
                    key={team.id}
                    className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-4 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono text-brand-muted mb-1">
                        <span className="text-teal-accent font-bold">{team.teamCode}</span>
                        <span>Best Score: {team.bestScore > 0 ? team.bestScore.toFixed(1) : "0.0"}</span>
                      </div>
                      <h4 className="font-display font-bold text-brand-white text-base">{team.teamName}</h4>
                      <p className="text-xs text-brand-muted mt-0.5 font-mono">
                        Track: {team.track?.shortName || "CI Track"} · {team.members?.length || 0} Participants
                      </p>
                    </div>

                    {/* Member List with Individual Download Buttons */}
                    <div className="space-y-2 border-t border-navy-border/60 pt-3">
                      <span className="text-[11px] font-mono text-brand-dim uppercase tracking-wider block">
                        Participant Certificates ({team.members?.length || 0}):
                      </span>
                      <div className="space-y-2">
                        {(team.members || []).map((m: any, idx: number) => (
                          <div
                            key={m.id || idx}
                            className="p-2.5 rounded-xl bg-bg-secondary/70 border border-navy-border/40 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-semibold text-brand-white">{m.name}</div>
                              <div className="text-[10px] font-mono text-brand-dim">
                                {m.rollNumber ? `${m.rollNumber} · ` : ""}{m.branch || "Participant"}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                downloadSingleCertificate(
                                  m,
                                  { id: team.id, teamCode: team.teamCode, teamName: team.teamName, rank: team.rank || null },
                                  trackName,
                                  team.rank || null
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Certificate</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-navy-border/40 flex justify-end">
                      <Link
                        href={`/certificate?teamCode=${team.teamCode}`}
                        target="_blank"
                        className="text-xs font-mono text-brand-muted hover:text-teal-accent flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Web Certificate</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 8: TEAM MANAGEMENT */}
      {activeTab === "TEAM_MGMT" && (
        <TeamManagementTab
          teams={data?.teams || []}
          tracks={data?.tracks || []}
          judges={data?.judges || []}
          onAdminAction={handleAdminAction}
          onRefresh={fetchAdminData}
        />
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === "AUDIT_LOGS" && (
        <AuditLogsTab auditLogs={data?.auditLogs || []} />
      )}

      {/* MODAL: MANUAL PAYMENT OVERRIDE */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-navy-border p-6 space-y-4">
            <h4 className="font-display font-bold text-brand-white text-base">
              Verify Payment: {paymentModal.teamName}
            </h4>
            <p className="text-xs text-brand-muted">
              Amount: ₹{paymentModal.paymentAmount} · Team ID: {paymentModal.teamCode}
            </p>

            {/* Show submitted UTR if available */}
            {paymentModal.razorpayPaymentId && paymentModal.razorpayPaymentId !== "PAYMENT_FAILED" && (
              <div className="p-3 rounded-xl bg-teal-accent/10 border border-teal-accent/30">
                <span className="text-[10px] uppercase text-teal-accent font-semibold block">Submitted UTR</span>
                <span className="text-sm font-mono font-bold text-teal-accent">{paymentModal.razorpayPaymentId}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-bg-secondary/60 border border-navy-border/40 text-xs text-brand-muted">
              <p className="font-semibold text-brand-white mb-1">Leader Email:</p>
              <p className="font-mono text-teal-accent">{paymentModal.leaderEmail}</p>
              {paymentModal.leaderPhone && (
                <>
                  <p className="font-semibold text-brand-white mt-2 mb-1">Leader Phone:</p>
                  <p className="font-mono text-brand-white">{paymentModal.leaderPhone}</p>
                </>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1">Transaction ID / Reference (UPI/Cash)</label>
                <input
                  type="text"
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder={paymentModal.razorpayPaymentId || "e.g. UPI-REF-984512"}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={paymentReason}
                  onChange={(e) => setPaymentReason(e.target.value)}
                  placeholder="Offline registration fee received"
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={markPaymentFailed}
                className="px-3 py-1.5 text-xs rounded-lg bg-status-red/15 text-status-red border border-status-red/30 hover:bg-status-red/25 font-bold"
              >
                ✕ Mark Failed
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="px-3 py-1.5 text-xs text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={executePaymentOverride}
                  className="px-4 py-2 rounded-lg bg-status-green text-bg-primary font-bold text-xs"
                >
                  ✓ Approve & Generate Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVED CREDENTIALS (shown after payment confirmation) */}
      {approvedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-teal-accent/40 p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-status-green/15 text-status-green flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-status-green text-base">
                Payment Approved — Credentials Generated
              </h4>
              <p className="text-xs text-brand-muted">
                Send these credentials to the team leader via email.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black border border-navy-border space-y-3 font-mono text-sm">
              <div>
                <span className="text-[10px] uppercase text-brand-dim block">Team ID (Login Username)</span>
                <span className="text-lg font-bold text-teal-accent">{approvedCredentials.teamCode}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-brand-dim block">Default Password</span>
                <span className="text-lg font-bold text-orange-accent">{approvedCredentials.password}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-brand-dim block">Send Credentials To</span>
                <span className="text-sm font-bold text-brand-white">{approvedCredentials.email}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-accent/10 border border-orange-accent/30 text-xs text-orange-accent">
              <strong>Action Required:</strong> Email the above Team ID and Password to {approvedCredentials.email}. The team can now log in at the Login page.
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => { setApprovedCredentials(null); fetchAdminData(); }}
                className="px-6 py-2 rounded-lg bg-teal-accent text-bg-primary font-bold text-xs"
              >
                Done — Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCORE OVERRIDE */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-navy-border p-6 space-y-4">
            <h4 className="font-display font-bold text-brand-white text-base">
              Override Score: {overrideModal.teamName}
            </h4>
            <p className="text-xs text-brand-muted">Current Best Score: {overrideModal.bestScore}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1">New Score (0 - 100)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white"
                />
              </div>

              <div>
                <label className="block text-brand-muted mb-1">
                  Mandatory Audit Reason (Required for transparency) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Re-scored after sandbox timeout dispute verified by jury"
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-navy-border text-brand-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModal(null)}
                className="px-3 py-1.5 text-xs text-brand-muted"
              >
                Cancel
              </button>
              <button
                onClick={executeScoreOverride}
                className="px-4 py-2 rounded-lg bg-gradient-signature text-bg-primary font-bold text-xs"
              >
                Commit Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREDENTIAL GENERATION & EMAIL DELIVERY */}
      {credentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-bg-card border border-teal-accent/40 p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            {!generatedCred ? (
              <>
                <div className="flex items-center gap-3 pb-4 border-b border-navy-border/60">
                  <div className="w-12 h-12 rounded-2xl bg-teal-accent/20 border border-teal-accent/40 flex items-center justify-center text-teal-accent shrink-0">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-brand-white">
                      Verify Payment &amp; Generate Credentials
                    </h3>
                    <p className="text-xs text-brand-muted font-mono">
                      {credentialModal.teamCode} · {credentialModal.teamName}
                    </p>
                  </div>
                </div>

                {/* Team & Payment Summary to verify */}
                <div className="p-4 rounded-2xl bg-bg-secondary border border-orange-accent/30 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-orange-accent font-bold">
                    <span>Payment Verification Checklist</span>
                    <span>Amount: ₹{credentialModal.paymentAmount || 100}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-brand-dim block text-[10px]">Leader Email</span>
                      <span className="text-brand-white font-bold">{credentialModal.leaderEmail}</span>
                    </div>
                    <div>
                      <span className="text-brand-dim block text-[10px]">Leader Phone</span>
                      <span className="text-brand-white">{credentialModal.leaderPhone}</span>
                    </div>
                    <div>
                      <span className="text-brand-dim block text-[10px]">Submitted UTR</span>
                      <span className="text-teal-accent font-bold text-sm">{credentialModal.razorpayPaymentId || "Manual Verification"}</span>
                    </div>
                    <div>
                      <span className="text-brand-dim block text-[10px]">Domain Track</span>
                      <span className="text-brand-white">{credentialModal.domainId || "theme-1-biomedical-ai"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-accent/10 border border-orange-accent/30 text-xs text-orange-accent space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Organizer Security Protocol:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    1. Verify the 12-digit UTR against your UPI/bank statement.<br />
                    2. Confirm the payment of ₹{credentialModal.paymentAmount || 100} was credited.<br />
                    3. Clicking generate will activate their login and generate their official credentials.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-brand-muted font-mono block">
                    Admin Verification Note (saved to audit trail):
                  </label>
                  <input
                    type="text"
                    value={credentialNote}
                    onChange={(e) => setCredentialNote(e.target.value)}
                    placeholder="e.g. Verified on PhonePe statement at 12:45 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white focus:outline-none focus:border-teal-accent"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setCredentialModal(null)}
                    className="px-4 py-3 rounded-xl bg-bg-secondary border border-navy-border text-brand-muted hover:text-brand-white text-xs font-mono transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setGeneratingCred(true);
                      try {
                        const res = await fetch("/api/admin/actions", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "APPROVE_AND_GENERATE_CREDENTIALS",
                            payload: {
                              teamCode: credentialModal.teamCode,
                              adminNote: credentialNote || "Payment verified by admin",
                            },
                          }),
                        });
                        const resData = await res.json();
                        setGeneratingCred(false);
                        if (!res.ok) {
                          alert(resData.error || "Failed to generate credentials.");
                          return;
                        }
                        setGeneratedCred(resData);
                        fetchAdminData();
                      } catch {
                        setGeneratingCred(false);
                        alert("Network error generating credentials.");
                      }
                    }}
                    disabled={generatingCred}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-accent to-status-green text-bg-primary font-bold text-xs font-mono shadow-glow hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generatingCred ? (
                      <>
                        <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                        <span>Generating &amp; Activating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Payment &amp; Generate Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success view with credentials and email template */
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-status-green/20 border border-status-green/40 flex items-center justify-center text-status-green mx-auto shadow-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-xl text-brand-white">
                    Credentials Generated &amp; Activated!
                  </h3>
                  <p className="text-xs text-brand-muted">
                    Account is now active. Send the official confirmation email to the team leader below.
                  </p>
                </div>

                {/* Credentials Display Card */}
                <div className="p-5 rounded-2xl bg-bg-secondary border border-teal-accent/30 space-y-3 text-left font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-navy-border/40">
                    <span className="text-brand-dim uppercase text-[10px]">Team Name</span>
                    <span className="font-bold text-brand-white">{generatedCred.teamName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-navy-border/40">
                    <span className="text-brand-dim uppercase text-[10px]">Login ID / Team Code</span>
                    <span className="font-bold text-teal-accent text-sm">{generatedCred.loginUsername}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-navy-border/40">
                    <span className="text-brand-dim uppercase text-[10px]">Secure Password</span>
                    <span className="font-bold text-status-green text-sm">{generatedCred.loginPassword}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-dim uppercase text-[10px]">Send To (Leader Email)</span>
                    <span className="font-bold text-brand-white text-xs">{generatedCred.leaderEmail}</span>
                  </div>
                </div>

                {/* Dispatch Email Button */}
                <button
                  onClick={async () => {
                    setSendingModalEmail(true);
                    setModalEmailNotice(null);
                    try {
                      const res = await fetch("/api/admin/email/send-credentials", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ teamCode: generatedCred.loginUsername }),
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setModalEmailNotice(`✓ Credentials email dispatched successfully to ${data.count} member(s): ${data.sentTo.join(", ")}`);
                      } else {
                        setModalEmailNotice(`✕ ${data.error || "Failed to send email."}`);
                      }
                    } catch {
                      setModalEmailNotice("✕ Network error sending credentials email.");
                    }
                    setSendingModalEmail(false);
                  }}
                  disabled={sendingModalEmail}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-accent to-status-green text-bg-primary font-bold text-xs font-mono shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingModalEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                      <span>Sending Email via SMTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Dispatch Official IEEE Credentials Email to All Members</span>
                    </>
                  )}
                </button>

                {modalEmailNotice && (
                  <div className={`p-3 rounded-xl text-xs font-mono ${modalEmailNotice.startsWith("✓") ? "bg-status-green/15 text-status-green border border-status-green/30" : "bg-status-red/15 text-status-red border border-status-red/30"}`}>
                    {modalEmailNotice}
                  </div>
                )}

                {/* Email Template Action */}
                <button
                  onClick={() => {
                    const emailBody = `Subject: OptiForge 2026 — Registration Confirmed & Login Credentials

Dear Team ${credentialModal.teamName},

Congratulations! Your registration and payment for OptiForge 2026 have been verified by the IEEE EMBS × IEEE CIS organizing committee.

Here are your official team login credentials:
• Portal Login URL: https://optiforge-2026.vercel.app/login
• Team Code (Username): ${generatedCred.loginUsername}
• Password: ${generatedCred.loginPassword}
• Innovation Domain: ${credentialModal.track?.shortName || credentialModal.domainId || "Biomedical AI"}
• Event Date: 30 September 2026 (10:00 AM IST)
• Venue: Vardhaman College of Engineering

IMPORTANT:
- Keep this password secure within your team.
- Bring your college ID cards on event day for verification at the registration desk.

Best regards,
Organizing Committee · OptiForge 2026
IEEE EMBS × IEEE CIS Student Branches
Vardhaman College of Engineering`;

                    navigator.clipboard.writeText(emailBody);
                    alert("Complete email template copied to clipboard! You can paste and send it to " + generatedCred.leaderEmail);
                  }}
                  className="w-full py-3 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white font-bold text-xs font-mono shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Credentials Template to Clipboard</span>
                </button>

                <button
                  onClick={() => {
                    setCredentialModal(null);
                    setGeneratedCred(null);
                    setModalEmailNotice(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-muted hover:text-brand-white text-xs font-mono transition-colors"
                >
                  Done — Close Modal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
