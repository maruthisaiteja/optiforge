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
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  User,
  GraduationCap,
  BookOpen,
  Copy,
  CheckCheck,
  XCircle,
  UserCheck,
  Send,
  Lock,
  Unlock,
} from "lucide-react";

// IEEE EMBS Light Theme Colors
const $ = {
  bg: "#F8FAFC",
  white: "#FFFFFF",
  softBlue: "#F0F7FB",
  softPurple: "#F6F1F8",
  ieeeBlue: "#00629B",
  embsPurple: "#772583",
  cyan: "#12A8C4",
  navy: "#102A43",
  slate: "#52606D",
  border: "#D9E6EE",
  success: "#238B68",
  warning: "#D58A19",
  medRed: "#D84A5A",
  aiPurple: "#7657D9",
};

export default function AdminPortal() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "TEAMS" | "SUBMISSIONS" | "STAGE_CTRL" | "CONFIDENTIAL_SHIFTS" | "LEADERBOARD_CTRL" | "ANNOUNCEMENTS" | "CERTIFICATES"
  >("TEAMS");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [livePatchMins, setLivePatchMins] = useState<number>(20);

  // Expanded team row (for full member details)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Credential generation modal
  const [credentialModal, setCredentialModal] = useState<any>(null);
  const [credentialNote, setCredentialNote] = useState("");
  const [generatedCred, setGeneratedCred] = useState<any>(null);
  const [credGenerating, setCredGenerating] = useState(false);

  // Copy to clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
        return resData;
      }

      fetchAdminData();
      return resData;
    } catch {
      alert("Error executing admin action.");
    }
  };

  const handleGenerateCredentials = async () => {
    if (!credentialModal) return;
    setCredGenerating(true);
    const result = await handleAdminAction("APPROVE_AND_GENERATE_CREDENTIALS", {
      teamCode: credentialModal.teamCode,
      verifiedTransactionId: credentialModal.razorpayPaymentId || "",
      adminNote: credentialNote,
    });
    setCredGenerating(false);
    if (result?.success) {
      setGeneratedCred(result);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
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
      transactionId: paymentTxId || `manual_upi_${Date.now()}`,
      reason: paymentReason || "Admin manual verification",
    });
    setPaymentModal(null);
  };

  const exportTeamsCsv = () => {
    if (!data?.teams) return;
    const rows: string[] = [];
    rows.push("TeamCode,TeamName,Track,LeaderEmail,LeaderPhone,MembersCount,PaymentStatus,UTR,AttemptsUsed,BestScore,MemberName,MemberEmail,MemberPhone,MemberCollege,MemberRoll,MemberBranch,MemberYear");
    (data.teams || []).forEach((t: any) => {
      const members = t.members || [];
      if (members.length === 0) {
        rows.push(`"${t.teamCode}","${t.teamName}","${t.track?.shortName || t.domainId}","${t.leaderEmail}","${t.leaderPhone}",0,"${t.paymentStatus}","${t.razorpayPaymentId || ""}",${t.attemptsUsed},${t.bestScore},"","","","","","",""`);
      } else {
        members.forEach((m: any, idx: number) => {
          if (idx === 0) {
            rows.push(`"${t.teamCode}","${t.teamName}","${t.track?.shortName || t.domainId}","${t.leaderEmail}","${t.leaderPhone}",${members.length},"${t.paymentStatus}","${t.razorpayPaymentId || ""}",${t.attemptsUsed},${t.bestScore},"${m.name}","${m.email}","${m.phone}","${m.collegeName || ""}","${m.rollNumber}","${m.branch}","${m.year}"`);
          } else {
            rows.push(`"${t.teamCode}","","","","","","","","","","${m.name}","${m.email}","${m.phone}","${m.collegeName || ""}","${m.rollNumber}","${m.branch}","${m.year}"`);
          }
        });
      }
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OptiForge_2026_Full_Roster_${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center space-y-4 px-4"
        style={{ backgroundColor: $.bg }}
      >
        <div
          className="w-12 h-12 border-3 rounded-full animate-spin"
          style={{ borderColor: $.border, borderTopColor: $.ieeeBlue }}
        />
        <p className="text-sm font-medium" style={{ color: $.slate }}>
          Loading Admin Control Center...
        </p>
      </div>
    );
  }

  // Filter teams
  const filteredTeams = (data?.teams || []).filter((team: any) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.razorpayPaymentId && team.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.members || []).some(
        (m: any) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && team.paymentStatus === statusFilter;
  });

  const isFrozen = data?.settings?.find((s: any) => s.key === "leaderboard_frozen")?.value === "true";
  const isVisible = data?.settings?.find((s: any) => s.key === "leaderboard_visible")?.value === "true";
  const activeStage = data?.settings?.find((s: any) => s.key === "active_stage")?.value || "PRE_EVENT";
  const livePatchDeadline = data?.settings?.find((s: any) => s.key === "live_patch_deadline")?.value || "";
  const weightAuto = Number(data?.settings?.find((s: any) => s.key === "weight_auto")?.value || 60);
  const weightJudge = Number(data?.settings?.find((s: any) => s.key === "weight_judge")?.value || 40);

  const pendingApprovalTeams = (data?.teams || []).filter(
    (t: any) =>
      t.paymentStatus === "CONFIRMED" &&
      t.razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL"
  );

  const tournamentStages = [
    { key: "STAGE_1_STRATEGY", label: "Stage 1", time: "09:00 - 09:30", name: "Problem Selection & Strategy" },
    { key: "STAGE_2_DISTRIBUTION", label: "Stage 2", time: "09:30 - 10:00", name: "Starter Code & Test Suite Distribution" },
    { key: "STAGE_3_ATTEMPT_1", label: "Stage 3", time: "10:00 - 11:15", name: "Attempt 1 — Baseline Implementation" },
    { key: "STAGE_4_ATTEMPT_2", label: "Stage 4", time: "11:30 - 12:45", name: "Hidden Shift #1 Injected & Attempt 2" },
    { key: "STAGE_5_ATTEMPT_3", label: "Stage 5", time: "13:15 - 14:15", name: "Hidden Shift #2 Injected & Attempt 3" },
    { key: "STAGE_6_FREEZE", label: "Stage 6", time: "14:15", name: "Leaderboard Freeze & Final Submissions Locked" },
    { key: "STAGE_7_LIVE_PATCH", label: "Stage 7", time: "14:30 - 15:00", name: "The Live Patch Round (Surprise Constraint)" },
    { key: "STAGE_8_VIVA", label: "Stage 8", time: "15:00 - 16:00", name: "Judges' Viva Q&A & Final Results" },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: $.bg, color: $.navy }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ─── Top Header ─── */}
        <div
          className="p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{ backgroundColor: `${$.ieeeBlue}12`, color: $.ieeeBlue }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Master Organizer Console · IEEE EMBS × IEEE CIS</span>
            </div>
            <h1 className="font-black text-2xl sm:text-3xl" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
              OptiForge Control Center
            </h1>
            <p className="text-xs mt-1" style={{ color: $.slate }}>
              Real-time tournament oversight, payment verification, credential management, and stage control.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
              style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
            >
              <RefreshCw className="w-4 h-4" style={{ color: $.cyan }} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={exportTeamsCsv}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-sm text-white"
              style={{ backgroundColor: $.ieeeBlue }}
            >
              <Download className="w-4 h-4" />
              <span>Export Full Roster CSV</span>
            </button>
          </div>
        </div>

        {/* ─── Pending Approval Alert ─── */}
        {pendingApprovalTeams.length > 0 && (
          <div
            className="p-4 rounded-2xl flex items-center justify-between gap-4"
            style={{ backgroundColor: "#FEF3C7", border: "1.5px solid #F59E0B" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 font-black text-lg shrink-0">
                {pendingApprovalTeams.length}
              </div>
              <div>
                <span className="font-bold text-amber-900 block text-sm">
                  {pendingApprovalTeams.length} Team{pendingApprovalTeams.length > 1 ? "s" : ""} Awaiting Credential Generation
                </span>
                <span className="text-xs text-amber-700">
                  Payment UTR submitted. Verify & click "Generate Credentials" to issue login access.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("TEAMS")}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-colors shrink-0"
            >
              Review Teams →
            </button>
          </div>
        )}

        {/* ─── KPI Stats ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Teams",
              value: data?.stats?.totalTeams,
              sub: `${data?.stats?.confirmedTeams} confirmed · ${data?.stats?.pendingTeams} pending`,
              color: $.ieeeBlue,
            },
            {
              label: "Total Collected",
              value: `₹${data?.stats?.totalCollected || 0}`,
              sub: `${data?.stats?.totalParticipants || 0} participants registered`,
              color: $.success,
            },
            {
              label: "Submissions",
              value: data?.stats?.totalSubmissions,
              sub: `${data?.stats?.flaggedSubmissions || 0} similarity warnings`,
              color: $.embsPurple,
            },
            {
              label: "Domain Judges",
              value: data?.stats?.judgesCount,
              sub: `Across ${data?.tracks?.length || 6} CI Domains`,
              color: $.warning,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl space-y-1 shadow-sm"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider block" style={{ color: $.slate }}>
                {stat.label}
              </span>
              <div className="font-black text-2xl" style={{ fontFamily: "Sora, sans-serif", color: stat.color }}>
                {stat.value}
              </div>
              <p className="text-[11px]" style={{ color: $.slate }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── Navigation Tabs ─── */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono border-b"
          style={{ borderColor: $.border }}
        >
          {[
            { key: "TEAMS", label: `Teams & Payments (${data?.teams?.length || 0})`, icon: <Users className="w-4 h-4" /> },
            { key: "SUBMISSIONS", label: `Submissions (${data?.submissions?.length || 0})`, icon: <FileCode className="w-4 h-4" /> },
            { key: "STAGE_CTRL", label: "Tournament Stages", icon: <Clock className="w-4 h-4" style={{ color: $.warning }} /> },
            { key: "CONFIDENTIAL_SHIFTS", label: "Confidential Shifts", icon: <Key className="w-4 h-4" style={{ color: $.embsPurple }} /> },
            { key: "LEADERBOARD_CTRL", label: "Leaderboard Controls", icon: <Sliders className="w-4 h-4" /> },
            { key: "ANNOUNCEMENTS", label: "Broadcast Alerts", icon: <Bell className="w-4 h-4" /> },
            { key: "CERTIFICATES", label: "Certificate Studio", icon: <Award className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-4 py-2.5 rounded-t-lg transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.key ? $.white : "transparent",
                color: activeTab === tab.key ? $.ieeeBlue : $.slate,
                borderBottom: activeTab === tab.key ? `2px solid ${$.ieeeBlue}` : "none",
                fontWeight: activeTab === tab.key ? 700 : 500,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 1: TEAMS & PAYMENTS — Full member detail view
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === "TEAMS" && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl shadow-sm"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 shrink-0" style={{ color: $.slate }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team, code, email, roll number, member name..."
                  className="w-full bg-transparent text-xs focus:outline-none"
                  style={{ color: $.navy }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span style={{ color: $.slate }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
                  style={{
                    backgroundColor: $.softBlue,
                    border: `1px solid ${$.border}`,
                    color: $.navy,
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED (Paid)</option>
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                </select>
              </div>
            </div>

            {/* Teams List */}
            <div className="space-y-4">
              {filteredTeams.map((t: any) => {
                const isPendingApproval =
                  t.paymentStatus === "CONFIRMED" &&
                  t.razorpaySignature === "UTR_SUBMITTED_PENDING_ADMIN_APPROVAL";
                const isAdminApproved =
                  t.paymentStatus === "CONFIRMED" &&
                  t.razorpaySignature === "ADMIN_VERIFIED_APPROVED";
                const isExpanded = expandedTeam === t.id;
                const members = t.members || [];

                return (
                  <div
                    key={t.id}
                    className="rounded-2xl shadow-sm overflow-hidden transition-all"
                    style={{
                      backgroundColor: $.white,
                      border: isPendingApproval
                        ? `1.5px solid ${$.warning}`
                        : `1px solid ${$.border}`,
                    }}
                  >
                    {/* ─ Team Header Row ─ */}
                    <div className="p-5 flex flex-wrap items-start gap-4">
                      {/* Team Code & Name */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm font-black font-mono"
                            style={{ color: $.ieeeBlue }}
                          >
                            {t.teamCode}
                          </span>
                          {isPendingApproval && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                            >
                              ⏳ Awaiting Credential Generation
                            </span>
                          )}
                          {isAdminApproved && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                            >
                              ✓ Approved & Credentials Sent
                            </span>
                          )}
                          {t.isDisqualified && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                            >
                              DISQUALIFIED
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base" style={{ color: $.navy }}>
                          {t.teamName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: $.slate }}>
                          <Mail className="w-3.5 h-3.5" />
                          <span>{t.leaderEmail}</span>
                          <span className="mx-1">·</span>
                          <Phone className="w-3.5 h-3.5" />
                          <span>{t.leaderPhone}</span>
                        </div>
                      </div>

                      {/* Track */}
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: $.slate }}>
                          Theme
                        </span>
                        <div className="font-semibold" style={{ color: $.navy }}>
                          {t.track?.shortName || t.domainId || "Unassigned"}
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: $.slate }}>
                          Payment
                        </span>
                        {t.paymentStatus === "CONFIRMED" ? (
                          <div className="space-y-0.5">
                            <span
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold block"
                              style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                            >
                              ₹{t.paymentAmount} CONFIRMED
                            </span>
                            {t.razorpayPaymentId && (
                              <span className="text-[10px] font-mono" style={{ color: $.cyan }}>
                                UTR: {t.razorpayPaymentId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setPaymentModal(t)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            PENDING — Mark Paid
                          </button>
                        )}
                      </div>

                      {/* Score & Attempts */}
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: $.slate }}>
                          Score
                        </span>
                        <div className="font-black text-lg" style={{ color: $.ieeeBlue }}>
                          {t.bestScore > 0 ? t.bestScore.toFixed(1) : "—"}
                        </div>
                        <div className="text-[10px]" style={{ color: $.slate }}>
                          {t.attemptsUsed}/3 attempts
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 text-xs">
                        {/* Expand/collapse members */}
                        <button
                          onClick={() => setExpandedTeam(isExpanded ? null : t.id)}
                          className="px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                          style={{
                            backgroundColor: $.softBlue,
                            border: `1px solid ${$.border}`,
                            color: $.navy,
                          }}
                        >
                          <Users className="w-3.5 h-3.5" style={{ color: $.cyan }} />
                          <span>{members.length} Members</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Generate Credentials Button — Only for pending approval */}
                        {isPendingApproval && (
                          <button
                            onClick={() => {
                              setCredentialModal(t);
                              setCredentialNote("");
                              setGeneratedCred(null);
                            }}
                            className="px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all hover:scale-105 text-white"
                            style={{ backgroundColor: $.success }}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Generate Credentials</span>
                          </button>
                        )}

                        {/* Override Score */}
                        <button
                          onClick={() => {
                            setOverrideModal(t);
                            setOverrideScore(t.bestScore || 85);
                            setOverrideReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
                          style={{
                            backgroundColor: $.softBlue,
                            border: `1px solid ${$.border}`,
                            color: $.navy,
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Override Score</span>
                        </button>

                        {/* Disqualify */}
                        <button
                          onClick={() =>
                            handleAdminAction("TOGGLE_DISQUALIFY", {
                              teamCode: t.teamCode,
                              reason: "Admin manual toggle",
                            })
                          }
                          className="px-3 py-1.5 rounded-xl font-semibold text-[10px] flex items-center gap-1.5"
                          style={{
                            backgroundColor: t.isDisqualified ? "#FEE2E2" : $.softBlue,
                            border: `1px solid ${t.isDisqualified ? "#FECACA" : $.border}`,
                            color: t.isDisqualified ? "#991B1B" : $.slate,
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.isDisqualified ? "Reinstate" : "Disqualify"}</span>
                        </button>
                      </div>
                    </div>

                    {/* ─ Expanded: Full Team Member Details ─ */}
                    {isExpanded && (
                      <div
                        className="border-t p-5 space-y-4"
                        style={{ borderColor: $.border, backgroundColor: $.softBlue }}
                      >
                        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: $.navy }}>
                          <GraduationCap className="w-4 h-4" style={{ color: $.embsPurple }} />
                          <span>Complete Team Roster — {members.length} Registered Participants</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {members.map((m: any, idx: number) => (
                            <div
                              key={m.id || idx}
                              className="p-4 rounded-2xl space-y-3 shadow-sm"
                              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
                            >
                              {/* Member Badge */}
                              <div className="flex items-center justify-between">
                                <div
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"
                                  style={{
                                    backgroundColor: idx === 0 ? `${$.ieeeBlue}15` : `${$.embsPurple}10`,
                                    color: idx === 0 ? $.ieeeBlue : $.embsPurple,
                                  }}
                                >
                                  {idx === 0 ? "Team Leader" : `Member ${idx + 1}`}
                                </div>
                              </div>

                              {/* Name */}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 shrink-0" style={{ color: $.slate }} />
                                  <span className="font-bold text-sm" style={{ color: $.navy }}>
                                    {m.name}
                                  </span>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 shrink-0" style={{ color: $.slate }} />
                                  <span style={{ color: $.navy }}>{m.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 shrink-0" style={{ color: $.slate }} />
                                  <span style={{ color: $.navy }}>{m.phone}</span>
                                </div>
                                <div
                                  className="pt-2 mt-1 border-t space-y-1.5"
                                  style={{ borderColor: $.border }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-3 h-3 shrink-0" style={{ color: $.slate }} />
                                    <span style={{ color: $.navy }}>{m.collegeName || "—"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3 h-3 shrink-0" style={{ color: $.slate }} />
                                    <span style={{ color: $.navy }}>
                                      {m.rollNumber} · {m.branch} · {m.year}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Payment Details Summary */}
                        <div
                          className="p-4 rounded-2xl space-y-2 text-xs"
                          style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
                        >
                          <div className="font-bold text-sm flex items-center gap-2" style={{ color: $.navy }}>
                            <CreditCard className="w-4 h-4" style={{ color: $.success }} />
                            Payment & Registration Summary
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>
                                Fee Amount
                              </span>
                              <span className="font-bold" style={{ color: $.navy }}>₹{t.paymentAmount}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>
                                UTR / Ref
                              </span>
                              <span className="font-mono font-bold" style={{ color: $.cyan }}>
                                {t.razorpayPaymentId || "Not Submitted"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>
                                Approval Status
                              </span>
                              <span
                                className="font-bold"
                                style={{
                                  color: isAdminApproved
                                    ? $.success
                                    : isPendingApproval
                                    ? $.warning
                                    : $.slate,
                                }}
                              >
                                {isAdminApproved
                                  ? "✓ Admin Approved"
                                  : isPendingApproval
                                  ? "⏳ Pending Approval"
                                  : "Not Paid"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>
                                Registered
                              </span>
                              <span style={{ color: $.navy }}>
                                {new Date(t.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredTeams.length === 0 && (
                <div className="py-16 text-center" style={{ color: $.slate }}>
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No teams match your search criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SUBMISSIONS OVERSIGHT */}
        {activeTab === "SUBMISSIONS" && (
          <div
            className="rounded-2xl p-6 space-y-4 shadow-sm"
            style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
          >
            <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: $.border }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: $.navy }}>
                  Live Submissions Queue ({data?.submissions?.length})
                </h3>
                <p className="text-xs mt-1" style={{ color: $.slate }}>
                  Audit sandbox test logs, AST design scores, similarity flags, and written reflections.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className="border-b uppercase tracking-wider text-[10px]"
                    style={{ borderColor: $.border, color: $.slate }}
                  >
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
                <tbody>
                  {(data?.submissions || []).map((sub: any) => {
                    const subTeam = data?.teams?.find((t: any) => t.id === sub.teamId);
                    return (
                      <tr
                        key={sub.id}
                        className="border-b transition-colors hover:bg-slate-50"
                        style={{ borderColor: $.border }}
                      >
                        <td className="py-3 px-3" style={{ color: $.slate }}>
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 font-semibold" style={{ color: $.navy }}>
                          {subTeam?.teamName || sub.teamId}
                        </td>
                        <td className="py-3 px-3">
                          {sub.isLivePatch ? (
                            <span className="font-bold" style={{ color: $.warning }}>Stage 7 Live Patch</span>
                          ) : (
                            `#${sub.attemptNumber}`
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold" style={{ color: $.ieeeBlue }}>
                          {sub.autoScore.toFixed(1)}
                        </td>
                        <td className="py-3 px-3" style={{ color: $.slate }}>{sub.designQuality}/100</td>
                        <td className="py-3 px-3">
                          {sub.similarityFlag ? (
                            <span
                              className="font-bold px-2 py-0.5 rounded"
                              style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                            >
                              FLAGGED ({sub.similarityScore}%)
                            </span>
                          ) : (
                            <span style={{ color: $.slate }}>{sub.similarityScore || 0}%</span>
                          )}
                        </td>
                        <td
                          className="py-3 px-3 max-w-[200px] truncate"
                          style={{ color: $.slate }}
                        >
                          {sub.whatChangedNotes || sub.approachNotes || "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() =>
                              handleAdminAction("RESCORE_SUBMISSION", { submissionId: sub.id })
                            }
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
                            style={{
                              backgroundColor: $.softBlue,
                              border: `1px solid ${$.border}`,
                              color: $.navy,
                            }}
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

        {/* TAB 3: TOURNAMENT STAGES */}
        {activeTab === "STAGE_CTRL" && (
          <div className="space-y-6">
            <div
              className="p-6 rounded-3xl shadow-sm space-y-6"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: $.border }}>
                <div>
                  <h2 className="font-black text-xl" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
                    Event Lifecycle Progression
                  </h2>
                  <p className="text-xs mt-1" style={{ color: $.slate }}>
                    Advance stages to trigger scenario shifts, freeze rankings, and start live patch countdown.
                  </p>
                </div>
                <div
                  className="p-3 rounded-xl text-xs font-mono"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                >
                  <span className="block text-[10px] mb-0.5" style={{ color: $.slate }}>CURRENT ACTIVE STAGE</span>
                  <span className="font-bold" style={{ color: $.ieeeBlue }}>{activeStage}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tournamentStages.map((stg) => {
                  const isActive = stg.key === activeStage;
                  return (
                    <div
                      key={stg.key}
                      className="p-4 rounded-2xl space-y-3 flex flex-col justify-between transition-all"
                      style={{
                        backgroundColor: isActive ? `${$.ieeeBlue}10` : $.softBlue,
                        border: isActive ? `1.5px solid ${$.ieeeBlue}` : `1px solid ${$.border}`,
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold" style={{ color: $.ieeeBlue }}>{stg.label}</span>
                          <span className="text-[11px]" style={{ color: $.slate }}>{stg.time}</span>
                        </div>
                        <h4 className="font-bold text-xs leading-snug" style={{ color: $.navy }}>
                          {stg.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleAdminAction("ADVANCE_STAGE", { stage: stg.key, livePatchMins })}
                        disabled={isActive}
                        className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          backgroundColor: isActive ? $.ieeeBlue : $.white,
                          color: isActive ? "#FFFFFF" : $.ieeeBlue,
                          border: `1px solid ${$.ieeeBlue}`,
                          cursor: isActive ? "default" : "pointer",
                        }}
                      >
                        {isActive ? "✓ CURRENT STAGE" : "Trigger This Stage"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIDENTIAL SHIFTS */}
        {activeTab === "CONFIDENTIAL_SHIFTS" && (
          <div className="space-y-6">
            <div
              className="p-6 rounded-3xl shadow-sm space-y-4"
              style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
            >
              <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: $.border }}>
                <Key className="w-5 h-5" style={{ color: $.embsPurple }} />
                <div>
                  <h3 className="font-bold text-base" style={{ color: $.navy }}>
                    Confidential Scenario Shifts & Surprise Constraints (Admin Only)
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: $.slate }}>
                    Strictly hidden from public and team views until unlocked dynamically by tournament stage.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data?.tracks || []).map((tr: any) => (
                  <div
                    key={tr.id}
                    className="p-5 rounded-2xl space-y-4"
                    style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                  >
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: $.border }}>
                      <span className="font-bold text-sm" style={{ color: $.navy }}>{tr.shortName || tr.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${$.cyan}15`, color: $.cyan }}>
                        {tr.technique}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold block" style={{ color: $.warning }}>
                        Attempt 2 Shift (Shift #1):
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: $.navy }}>
                        {tr.hiddenShiftAttempt2 || "Staff reduction / Energy surge"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold block" style={{ color: $.embsPurple }}>
                        Attempt 3 Shift (Shift #2):
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: $.navy }}>
                        {tr.hiddenShiftAttempt3 || "Demand spike / Corridor blockage"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl space-y-1" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold block" style={{ color: $.warning }}>
                        Stage 7 Live Patch Surprise Constraint:
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: $.navy }}>
                        {tr.livePatchSurprise || "Emergency operational constraint"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LEADERBOARD CONTROLS */}
        {activeTab === "LEADERBOARD_CTRL" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl space-y-6 shadow-sm" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
              <h3 className="font-bold text-base" style={{ color: $.navy }}>Leaderboard Display Controls</h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Freeze Leaderboard Updates",
                    desc: "Locks the public leaderboard while secret scoring continues.",
                    key: "leaderboard_frozen",
                    value: isFrozen,
                    onLabel: "FROZEN",
                    offLabel: "UNFROZEN",
                  },
                  {
                    label: "Public Leaderboard Visibility",
                    desc: "Show or hide the leaderboard before event begins.",
                    key: "leaderboard_visible",
                    value: isVisible,
                    onLabel: "VISIBLE",
                    offLabel: "HIDDEN",
                  },
                ].map((ctrl) => (
                  <div
                    key={ctrl.key}
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                  >
                    <div>
                      <h4 className="font-semibold text-xs" style={{ color: $.navy }}>{ctrl.label}</h4>
                      <p className="text-[11px] mt-0.5" style={{ color: $.slate }}>{ctrl.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        handleAdminAction("TOGGLE_SETTING", {
                          key: ctrl.key,
                          value: ctrl.value ? "false" : "true",
                        })
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: ctrl.value ? $.ieeeBlue : $.white,
                        color: ctrl.value ? "#FFFFFF" : $.slate,
                        border: `1px solid ${$.border}`,
                      }}
                    >
                      {ctrl.value ? ctrl.onLabel : ctrl.offLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl space-y-6 shadow-sm" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
              <h3 className="font-bold text-base" style={{ color: $.navy }}>Formula Weights Configuration</h3>
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ color: $.slate }}>Auto-Benchmark Weight:</span>
                    <span className="font-bold" style={{ color: $.ieeeBlue }}>{weightAuto}%</span>
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
                    className="w-full cursor-pointer"
                    style={{ accentColor: $.ieeeBlue }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span style={{ color: $.slate }}>Judge Rubric Weight:</span>
                    <span className="font-bold" style={{ color: $.embsPurple }}>{weightJudge}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={weightJudge} disabled className="w-full opacity-50" />
                </div>
                <p className="text-[11px]" style={{ color: $.slate }}>
                  Official: 60% Auto-Score + 40% Judge Score.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ANNOUNCEMENTS */}
        {activeTab === "ANNOUNCEMENTS" && (
          <div className="max-w-xl mx-auto rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
            <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: $.border }}>
              <Bell className="w-5 h-5" style={{ color: $.ieeeBlue }} />
              <h3 className="font-bold text-base" style={{ color: $.navy }}>Push Broadcast Alert to Teams</h3>
            </div>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
              {["Alert Headline / Title", "Message Content", "Alert Severity"].map((_, idx) => (
                idx === 0 ? (
                  <div key={idx}>
                    <label className="block mb-1 font-medium" style={{ color: $.slate }}>Alert Headline / Title</label>
                    <input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="e.g. 15 Minutes Remaining in Submission Window"
                      className="w-full px-3 py-2 rounded-lg focus:outline-none"
                      style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                    />
                  </div>
                ) : idx === 1 ? (
                  <div key={idx}>
                    <label className="block mb-1 font-medium" style={{ color: $.slate }}>Message Content</label>
                    <textarea required rows={3} value={annMessage} onChange={(e) => setAnnMessage(e.target.value)}
                      placeholder="Message displayed on all team dashboards..."
                      className="w-full px-3 py-2 rounded-lg focus:outline-none"
                      style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                    />
                  </div>
                ) : (
                  <div key={idx}>
                    <label className="block mb-1 font-medium" style={{ color: $.slate }}>Alert Severity</label>
                    <select value={annType} onChange={(e) => setAnnType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none"
                      style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                    >
                      <option value="INFO">Information</option>
                      <option value="WARNING">Warning</option>
                      <option value="URGENT">Urgent (Red Alert)</option>
                    </select>
                  </div>
                )
              ))}
              <button type="submit" disabled={sendingAnn}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:scale-105"
                style={{ backgroundColor: $.ieeeBlue }}
              >
                <Bell className="w-4 h-4" />
                <span>{sendingAnn ? "Broadcasting..." : "Broadcast Alert to All Teams"}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: CERTIFICATE STUDIO */}
        {activeTab === "CERTIFICATES" && (
          <div className="rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: $.border }}>
              <div>
                <h3 className="font-bold text-lg" style={{ color: $.navy }}>Official E-Certificate Generation Studio</h3>
                <p className="text-xs mt-1" style={{ color: $.slate }}>
                  Authenticated E-Certificates issued jointly by IEEE EMBS Student Chapter & IEEE CIS Local Chapter.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.teams || []).filter((t: any) => t.paymentStatus === "CONFIRMED").map((team: any) => (
                <div
                  key={team.id}
                  className="p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                >
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono mb-1" style={{ color: $.slate }}>
                      <span>{team.teamCode}</span>
                      <span style={{ color: $.ieeeBlue }}>Score: {team.bestScore.toFixed(1)}</span>
                    </div>
                    <h4 className="font-bold text-base" style={{ color: $.navy }}>{team.teamName}</h4>
                    <p className="text-xs mt-1" style={{ color: $.slate }}>
                      {team.members?.length || 0} participants · {team.track?.shortName || team.domainId}
                    </p>
                  </div>
                  <Link
                    href={`/certificate?teamCode=${team.teamCode}`}
                    target="_blank"
                    className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-all hover:scale-105"
                    style={{ backgroundColor: $.ieeeBlue }}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Preview & Print Certificates</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: GENERATE CREDENTIALS (Admin Approval Flow)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {credentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl"
            style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}
          >
            {!generatedCred ? (
              <>
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3"
                    style={{ backgroundColor: `${$.success}15`, color: $.success }}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Generate & Approve Registration
                  </div>
                  <h3 className="font-black text-xl" style={{ fontFamily: "Sora, sans-serif", color: $.navy }}>
                    {credentialModal.teamName}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: $.slate }}>
                    Team Code: {credentialModal.teamCode} · {credentialModal.members?.length || 0} members
                  </p>
                </div>

                {/* Payment Confirmation Info */}
                <div
                  className="p-4 rounded-2xl space-y-2 text-xs"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                >
                  <h4 className="font-bold text-sm" style={{ color: $.navy }}>Payment Details to Verify</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>Amount</span>
                      <span className="font-bold" style={{ color: $.success }}>₹{credentialModal.paymentAmount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>UTR Ref</span>
                      <span className="font-mono font-bold" style={{ color: $.cyan }}>
                        {credentialModal.razorpayPaymentId || "Not available"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>Leader Email</span>
                      <span style={{ color: $.navy }}>{credentialModal.leaderEmail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block" style={{ color: $.slate }}>Leader Phone</span>
                      <span style={{ color: $.navy }}>{credentialModal.leaderPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Warning about credentials */}
                <div
                  className="p-4 rounded-2xl text-xs space-y-1"
                  style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B" }}
                >
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4" />
                    Important: Before generating credentials
                  </div>
                  <ul className="space-y-1 text-amber-800 ml-6 list-disc">
                    <li>Verify the UTR number matches your bank statement</li>
                    <li>Confirm the payment amount is correct (₹{credentialModal.paymentAmount})</li>
                    <li>Credentials will be: <strong>Username: {credentialModal.teamCode}</strong></li>
                    <li>Password will follow pattern: <strong>Forge#XXXX</strong> (last 4 digits of team code)</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: $.slate }}>
                    Admin Verification Note (will be logged in audit trail)
                  </label>
                  <input
                    type="text"
                    value={credentialNote}
                    onChange={(e) => setCredentialNote(e.target.value)}
                    placeholder="e.g. UTR verified against HDFC bank statement — 26 Sept 2026"
                    className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                    style={{
                      backgroundColor: $.softBlue,
                      border: `1px solid ${$.border}`,
                      color: $.navy,
                    }}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCredentialModal(null)}
                    className="px-4 py-2 text-xs rounded-xl"
                    style={{ color: $.slate }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateCredentials}
                    disabled={credGenerating}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all hover:scale-105"
                    style={{ backgroundColor: $.success }}
                  >
                    {credGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Approve & Generate Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Credentials Generated — Show to admin */
              <>
                <div className="text-center space-y-2">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl"
                    style={{ backgroundColor: `${$.success}15` }}
                  >
                    ✓
                  </div>
                  <h3 className="font-black text-xl" style={{ fontFamily: "Sora, sans-serif", color: $.success }}>
                    Credentials Generated!
                  </h3>
                  <p className="text-sm" style={{ color: $.slate }}>
                    Send these credentials to the team leader via email or WhatsApp.
                  </p>
                </div>

                <div
                  className="p-5 rounded-2xl space-y-4"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}` }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: $.slate }}>
                    Official Login Credentials — {generatedCred.teamName}
                  </div>

                  {[
                    { label: "Portal URL", value: "https://optiforge-2026.vercel.app/login", field: "url" },
                    { label: "Username / Team Code", value: generatedCred.loginUsername, field: "username" },
                    { label: "Password", value: generatedCred.loginPassword, field: "password" },
                    { label: "Leader Email", value: generatedCred.leaderEmail, field: "email" },
                  ].map((cred) => (
                    <div key={cred.field}>
                      <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: $.slate }}>
                        {cred.label}
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <code
                          className="flex-1 px-3 py-2 rounded-xl text-sm font-mono font-bold"
                          style={{ backgroundColor: $.white, border: `1px solid ${$.border}`, color: $.navy }}
                        >
                          {cred.value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(cred.value, cred.field)}
                          className="p-2 rounded-xl transition-all hover:scale-105"
                          style={{ backgroundColor: $.white, border: `1px solid ${$.border}`, color: $.ieeeBlue }}
                        >
                          {copiedField === cred.field ? (
                            <CheckCheck className="w-4 h-4" style={{ color: $.success }} />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Copy all for email */}
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Dear ${generatedCred.teamName} Team,\n\nCongratulations! Your registration for OptiForge 2026 has been verified and approved by the IEEE EMBS organizing team.\n\nYour official portal login credentials:\n—————————————————\nPortal URL: https://optiforge-2026.vercel.app/login\nUsername (Team Code): ${generatedCred.loginUsername}\nPassword: ${generatedCred.loginPassword}\n—————————————————\n\nPlease keep these credentials secure and do not share them with other teams.\n\nBest Regards,\nIEEE EMBS × IEEE CIS, Vardhaman College of Engineering\nOptiForge 2026 Organizing Committee`,
                        "all"
                      )
                    }
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all hover:scale-105"
                    style={{ backgroundColor: $.ieeeBlue }}
                  >
                    {copiedField === "all" ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        <span>Full Email Template Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Full Email Template</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  className="p-3 rounded-xl text-xs"
                  style={{ backgroundColor: "#D1FAE5", border: "1px solid #6EE7B7", color: "#065F46" }}
                >
                  ✓ Credentials have been logged in the audit trail. These credentials are now active — the team can log in to the portal immediately.
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setCredentialModal(null);
                      setGeneratedCred(null);
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                    style={{ backgroundColor: $.ieeeBlue }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PAYMENT OVERRIDE */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
            <h4 className="font-bold text-base" style={{ color: $.navy }}>
              Confirm Payment for: {paymentModal.teamName}
            </h4>
            <p className="text-xs" style={{ color: $.slate }}>
              Amount: ₹{paymentModal.paymentAmount} · Team Code: {paymentModal.teamCode}
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium" style={{ color: $.slate }}>Transaction ID / Reference</label>
                <input type="text" value={paymentTxId} onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder="e.g. UPI-REF-984512"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium" style={{ color: $.slate }}>Reason / Note</label>
                <input type="text" value={paymentReason} onChange={(e) => setPaymentReason(e.target.value)}
                  placeholder="Offline registration fee received"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPaymentModal(null)} className="px-3 py-1.5 text-xs" style={{ color: $.slate }}>
                Cancel
              </button>
              <button onClick={executePaymentOverride} className="px-4 py-2 rounded-lg font-bold text-xs text-white" style={{ backgroundColor: $.success }}>
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCORE OVERRIDE */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl" style={{ backgroundColor: $.white, border: `1px solid ${$.border}` }}>
            <h4 className="font-bold text-base" style={{ color: $.navy }}>Override Score: {overrideModal.teamName}</h4>
            <p className="text-xs" style={{ color: $.slate }}>Current Best Score: {overrideModal.bestScore}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium" style={{ color: $.slate }}>New Score (0 - 100)</label>
                <input type="number" step="0.1" min="0" max="100" value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium" style={{ color: $.slate }}>Mandatory Audit Reason *</label>
                <textarea required rows={2} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Re-scored after sandbox timeout dispute verified by jury"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: $.softBlue, border: `1px solid ${$.border}`, color: $.navy }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setOverrideModal(null)} className="px-3 py-1.5 text-xs" style={{ color: $.slate }}>Cancel</button>
              <button onClick={executeScoreOverride} className="px-4 py-2 rounded-lg font-bold text-xs text-white" style={{ backgroundColor: $.ieeeBlue }}>
                Commit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
