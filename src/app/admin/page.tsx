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
} from "lucide-react";

export default function AdminPortal() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "TEAMS" | "SUBMISSIONS" | "LEADERBOARD_CTRL" | "ANNOUNCEMENTS" | "CERTIFICATES"
  >("TEAMS");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
    if (!annTitle.trim() || !annMessage.trim()) return;

    setSendingAnn(true);
    await handleAdminAction("BROADCAST_ANNOUNCEMENT", {
      title: annTitle,
      message: annMessage,
      type: annType,
    });
    setAnnTitle("");
    setAnnMessage("");
    setSendingAnn(false);
    alert("Announcement successfully published to all active dashboards!");
  };

  const executeScoreOverride = async () => {
    if (!overrideReason.trim()) {
      alert("A mandatory audit reason is required for score changes.");
      return;
    }

    await handleAdminAction("OVERRIDE_SCORE", {
      teamCode: overrideModal.teamCode,
      newScore: overrideScore,
      reason: overrideReason,
    });

    setOverrideModal(null);
    setOverrideReason("");
  };

  const executePaymentOverride = async () => {
    await handleAdminAction("MARK_PAID", {
      teamCode: paymentModal.teamCode,
      transactionId: paymentTxId || `manual_pay_${Date.now()}`,
      reason: paymentReason || "Direct Cash / UPI Verification by Organizers",
    });

    setPaymentModal(null);
    setPaymentTxId("");
    setPaymentReason("");
  };

  const exportTeamsToCSV = () => {
    if (!data?.teams) return;

    const headers = ["Team Code", "Team Name", "Leader Email", "Phone", "Domain Track", "Payment Status", "Amount (INR)", "Attempts", "Best Score"];
    const rows = data.teams.map((t: any) => [
      t.teamCode,
      `"${t.teamName}"`,
      t.leaderEmail,
      t.leaderPhone,
      t.domainId || "Unassigned",
      t.paymentStatus,
      t.paymentAmount,
      t.attemptsUsed,
      t.bestScore,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OptiForge_2026_Teams_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-orange-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Admin Control Center...</p>
      </div>
    );
  }

  const isFrozen = data?.settings?.find((s: any) => s.key === "leaderboard_frozen")?.value === "true";
  const isVisible = data?.settings?.find((s: any) => s.key === "leaderboard_visible")?.value === "true";
  const weightAuto = data?.settings?.find((s: any) => s.key === "weight_auto")?.value || "60";
  const weightJudge = data?.settings?.find((s: any) => s.key === "weight_judge")?.value || "40";

  const filteredTeams = (data?.teams || []).filter((t: any) => {
    const matchesSearch =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teamCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leaderEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-accent/10 border border-orange-accent/30 text-orange-accent text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>OptiForge 2026 Organizer Command Center</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
            Admin Oversight & Controls
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            IEEE EMBS Student Chapter × IEEE CIS Local Chapter, Vardhaman College of Engineering
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-xs font-mono text-brand-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Financial & Event Reconciliation Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Total Revenue
          </span>
          <div className="font-display font-black text-2xl text-status-green">
            ₹{data?.stats?.totalCollected}
          </div>
          <p className="text-[10px] text-brand-dim">Razorpay Verified Entity</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Confirmed Teams
          </span>
          <div className="font-display font-black text-2xl text-teal-accent">
            {data?.stats?.confirmedTeams}{" "}
            <span className="text-xs text-brand-muted font-normal">/ {data?.stats?.totalTeams}</span>
          </div>
          <p className="text-[10px] text-brand-dim">{data?.stats?.totalParticipants} total students</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-card border border-navy-border/80 space-y-1">
          <span className="text-[11px] font-mono text-brand-muted block uppercase">
            Submissions
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
            Active Judges
          </span>
          <div className="font-display font-black text-2xl text-orange-accent">
            {data?.stats?.judgesCount}
          </div>
          <p className="text-[10px] text-brand-dim">Across 4 CI Domains</p>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-brand-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team, code, or email..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-card border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-bg-card border border-navy-border text-xs text-brand-white focus:outline-none focus:border-teal-accent"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING_PAYMENT">Pending Payment</option>
              </select>
            </div>

            <button
              onClick={exportTeamsToCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-signature text-bg-primary font-semibold text-xs transition-all shadow-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="rounded-2xl border border-navy-border/80 bg-bg-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-navy-border bg-bg-secondary/70 text-brand-muted">
                    <th className="py-3 px-4">Team Code</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Domain Track</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-center">Attempts</th>
                    <th className="py-3 px-4 text-right">Best Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-border/40">
                  {filteredTeams.map((team: any) => (
                    <tr
                      key={team.id}
                      className={`hover:bg-navy-deep/20 transition-colors ${
                        team.isDisqualified ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-teal-accent">{team.teamCode}</td>
                      <td className="py-3.5 px-4 font-sans font-medium text-brand-white">
                        {team.teamName}
                        <span className="block text-[11px] font-mono text-brand-muted">
                          {team.leaderEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        <span className="px-2 py-0.5 rounded bg-bg-secondary border border-navy-border text-brand-white text-[11px]">
                          {team.domainId || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {team.paymentStatus === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-status-green font-semibold">
                            <Check className="w-3 h-3" /> Paid (₹{team.paymentAmount})
                          </span>
                        ) : (
                          <span className="text-[11px] text-orange-accent">Pending (₹{team.paymentAmount})</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">{team.attemptsUsed} / 3</td>
                      <td className="py-3.5 px-4 text-right font-display font-bold text-brand-white">
                        {team.bestScore.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {team.paymentStatus !== "CONFIRMED" && (
                          <button
                            onClick={() => setPaymentModal(team)}
                            className="px-2 py-1 rounded bg-status-green/20 hover:bg-status-green/30 text-status-green text-[10px] font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setOverrideModal(team);
                            setOverrideScore(team.bestScore);
                          }}
                          className="px-2 py-1 rounded bg-navy-deep hover:bg-teal-accent/20 text-teal-accent text-[10px]"
                        >
                          Override Score
                        </button>
                        <button
                          onClick={() =>
                            handleAdminAction("TOGGLE_DISQUALIFY", { teamCode: team.teamCode })
                          }
                          className="px-2 py-1 rounded bg-status-red/10 hover:bg-status-red/20 text-status-red text-[10px]"
                        >
                          {team.isDisqualified ? "Reinstate" : "Disqualify"}
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
        <div className="space-y-4">
          <div className="rounded-2xl border border-navy-border/80 bg-bg-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-navy-border bg-bg-secondary/70 text-brand-muted">
                    <th className="py-3 px-4">Attempt</th>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Similarity Check</th>
                    <th className="py-3 px-4">Runtime</th>
                    <th className="py-3 px-4 text-right">Auto-Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-border/40">
                  {(data?.submissions || []).map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-navy-deep/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-accent">
                        Attempt #{sub.attemptNumber}
                      </td>
                      <td className="py-3 px-4 text-brand-white">{sub.filename}</td>
                      <td className="py-3 px-4">
                        {sub.similarityFlag ? (
                          <span className="px-2 py-0.5 rounded bg-status-red/20 text-status-red font-bold text-[10px]">
                            FLAGGED ({sub.similarityScore}%)
                          </span>
                        ) : (
                          <span className="text-[11px] text-brand-muted">
                            Clean ({sub.similarityScore || 0}%)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-brand-white">{sub.runtimeMs} ms</td>
                      <td className="py-3 px-4 text-right font-display font-bold text-brand-white">
                        {sub.autoScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            handleAdminAction("RESCORE_SUBMISSION", { submissionId: sub.id })
                          }
                          className="px-2.5 py-1 rounded bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent text-[11px]"
                        >
                          Re-trigger Benchmark
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

      {/* TAB 3: LEADERBOARD CONTROLS & WEIGHTS */}
      {activeTab === "LEADERBOARD_CTRL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls Card */}
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border/80 space-y-6 shadow-xl">
            <h3 className="font-display font-bold text-base text-brand-white">
              Leaderboard Visibility & Freeze Status
            </h3>

            <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-brand-white text-xs">Freeze Live Leaderboard</h4>
                <p className="text-[11px] text-brand-muted">
                  Locks public rank changes while expert judges score final attempts.
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

          {/* Scoring Formula Weights Card */}
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
                Default: 60% Auto-Score + 40% Average Manual Judge Score. Changes apply dynamically across the leaderboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST ANNOUNCEMENTS */}
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
                <option value="URGENT">Urgent (Red)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sendingAnn}
              className="w-full py-3 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Now</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: CERTIFICATE STUDIO */}
      {activeTab === "CERTIFICATES" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-bg-card border border-navy-border/80 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-brand-white">
                Official E-Certificate Generation Studio
              </h3>
              <p className="text-xs text-brand-muted">
                Official E-Certificates of Participation & Excellence issued under IEEE Vardhaman Student Branch.
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
