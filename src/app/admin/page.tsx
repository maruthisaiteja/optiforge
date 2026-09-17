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
} from "lucide-react";

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
      transactionId: paymentTxId || `manual_upi_${Date.now()}`,
      reason: paymentReason || "Admin manual verification",
    });
    setPaymentModal(null);
  };

  const exportTeamsCsv = () => {
    if (!data?.teams) return;
    const headers = "TeamCode,TeamName,Track,LeaderEmail,LeaderPhone,MembersCount,PaymentStatus,AttemptsUsed,BestScore\n";
    const rows = data.teams
      .map(
        (t: any) =>
          `"${t.teamCode}","${t.teamName}","${t.track?.shortName || t.domainId}","${t.leaderEmail}","${t.leaderPhone}",${t.members?.length || 0},"${t.paymentStatus}",${t.attemptsUsed},${t.bestScore}`
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
  const activeStage = data?.settings?.find((s: any) => s.key === "active_stage")?.value || "STAGE_3_ATTEMPT_1";
  const livePatchDeadline = data?.settings?.find((s: any) => s.key === "live_patch_deadline")?.value || "";

  const weightAuto = Number(data?.settings?.find((s: any) => s.key === "weight_auto")?.value || 60);
  const weightJudge = Number(data?.settings?.find((s: any) => s.key === "weight_judge")?.value || 40);

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

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-teal-accent" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={exportTeamsCsv}
            className="px-4 py-2.5 rounded-xl bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-xs font-mono font-semibold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster CSV</span>
          </button>
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
      </div>

      {/* TAB 1: TEAMS & PAYMENTS */}
      {activeTab === "TEAMS" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-navy-border/80">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by team name, code, or leader email..."
                className="w-full bg-transparent text-xs text-brand-white placeholder:text-brand-dim focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
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
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-navy-border/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-navy-border/60 text-brand-dim uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Team Code</th>
                    <th className="py-3.5 px-4">Team Name</th>
                    <th className="py-3.5 px-4">Leader Contact</th>
                    <th className="py-3.5 px-4">Domain Track</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Attempts</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-border/40">
                  {filteredTeams.map((t: any) => (
                    <tr key={t.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-teal-accent">{t.teamCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-brand-white">{t.teamName}</td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        <div>{t.leaderEmail}</div>
                        <div className="text-[10px] text-brand-dim">{t.leaderPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-white">
                        {t.track?.shortName || t.domainId || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.paymentStatus === "CONFIRMED" ? (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-status-green/15 text-status-green border border-status-green/30 inline-block font-semibold">
                              CONFIRMED (₹{t.paymentAmount})
                            </span>
                            {t.razorpayPaymentId && (
                              <div className="text-[10px] text-teal-accent font-mono" title="12-Digit UPI Transaction UTR">
                                UTR: <span className="font-bold">{t.razorpayPaymentId}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setPaymentModal(t)}
                            className="px-2 py-0.5 rounded text-[10px] bg-orange-accent/15 text-orange-accent border border-orange-accent/30 hover:bg-orange-accent/25 transition-colors"
                          >
                            PENDING (Mark Paid)
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">{t.attemptsUsed} / 3</td>
                      <td className="py-3.5 px-4 font-bold text-teal-accent">
                        {t.bestScore > 0 ? t.bestScore.toFixed(1) : "--"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setOverrideModal(t);
                            setOverrideScore(t.bestScore || 85);
                            setOverrideReason("");
                          }}
                          className="px-2.5 py-1 rounded bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-white text-[11px]"
                        >
                          Override Score
                        </button>
                        <button
                          onClick={() =>
                            handleAdminAction("TOGGLE_DISQUALIFY", {
                              teamCode: t.teamCode,
                              reason: "Admin manual toggle",
                            })
                          }
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            t.isDisqualified
                              ? "bg-red-500 text-white"
                              : "bg-navy-deep text-brand-muted hover:text-red-400 border border-navy-border"
                          }`}
                        >
                          {t.isDisqualified ? "DISQUALIFIED" : "Disqualify"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                        ? "bg-teal-accent/15 border-teal-accent shadow-glow"
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
                Authenticated E-Certificates issued jointly by IEEE EMBS Student Chapter & IEEE CIS Local Chapter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.teams || []).map((team: any) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl bg-bg-card border border-navy-border space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-brand-muted mb-1">
                    <span>{team.teamCode}</span>
                    <span className="text-teal-accent">Score: {team.bestScore.toFixed(1)}</span>
                  </div>
                  <h4 className="font-display font-bold text-brand-white text-base">{team.teamName}</h4>
                  <p className="text-xs text-brand-muted mt-1">
                    {team.members?.length || 0} participants registered
                  </p>
                </div>

                <Link
                  href={`/certificate?teamCode=${team.teamCode}`}
                  target="_blank"
                  className="w-full py-2 rounded-xl bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-center text-xs font-mono transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Preview & Print Certificates</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PAYMENT OVERRIDE */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-navy-border p-6 space-y-4">
            <h4 className="font-display font-bold text-brand-white text-base">
              Confirm Payment for Team: {paymentModal.teamName}
            </h4>
            <p className="text-xs text-brand-muted">
              Amount: ₹{paymentModal.paymentAmount} · Team ID: {paymentModal.teamCode}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-brand-muted mb-1">Transaction ID / Reference (UPI/Cash)</label>
                <input
                  type="text"
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  placeholder="e.g. UPI-REF-984512"
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

            <div className="flex justify-end gap-2 pt-2">
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
                Confirm Payment
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
    </div>
  );
}
