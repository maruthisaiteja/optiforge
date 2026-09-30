"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  KeyRound,
  X,
  Shield,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Eye,
  ArrowUpDown,
  Filter,
  Download,
  FileCheck,
  UserPlus,
  Building2,
  Gavel,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
} from "lucide-react";
import { generateAttendanceSheetPdf, generateCredentialsSheetPdf } from "@/lib/pdfReportGenerator";

interface TeamManagementTabProps {
  teams: any[];
  tracks?: any[];
  judges?: any[];
  onAdminAction: (action: string, payload: any) => Promise<void>;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 10;

export const OFFICIAL_INNOVATION_DOMAINS = [
  { id: "theme-1-biomedical-ai", code: "01", name: "Biomedical Artificial Intelligence", shortName: "01: Biomedical AI", society: "IEEE EMBS × CIS" },
  { id: "theme-2-signals", code: "02", name: "Biomedical Signals & Intelligent Systems", shortName: "02: Biomedical Signals", society: "IEEE EMBS" },
  { id: "theme-3-imaging", code: "03", name: "Medical Imaging & Computer Vision", shortName: "03: Medical Imaging", society: "IEEE EMBS" },
  { id: "theme-4-ml-ai", code: "04", name: "Machine Learning & Artificial Intelligence", shortName: "04: ML & Artificial Intelligence", society: "IEEE CIS" },
  { id: "theme-5-autonomous", code: "05", name: "Intelligent Systems & Autonomous Computing", shortName: "05: Autonomous Systems", society: "IEEE CIS" },
  { id: "theme-6-open-innovation", code: "06", name: "Open Innovation: CIS × EMBS", shortName: "06: Open Innovation", society: "IEEE EMBS × CIS" },
];

export const normalizeDomainId = (domainId?: string | null): string => {
  if (!domainId) return "theme-1-biomedical-ai";
  const legacyMap: Record<string, string> = {
    "p1-hospital-scheduling": "theme-1-biomedical-ai",
    "p2-drone-delivery": "theme-2-signals",
    "p3-emergency-hospital": "theme-3-imaging",
    "p4-blood-inventory": "theme-4-ml-ai",
    "p5-search-and-rescue": "theme-5-autonomous",
    "p6-fuzzy-triage": "theme-6-open-innovation",
  };
  return legacyMap[domainId] || domainId;
};

type SortField = "teamCode" | "teamName" | "createdAt" | "paymentStatus" | "venue";
type SortDirection = "asc" | "desc";

export default function TeamManagementTab({ teams: initialTeams, tracks = [], judges = [], onAdminAction, onRefresh }: TeamManagementTabProps) {
  // Local state to support optimistic updates for immediate UI feedback
  const [teams, setTeams] = useState<any[]>(initialTeams);
  const [updatingDomainCode, setUpdatingDomainCode] = useState<string | null>(null);

  React.useEffect(() => {
    setTeams(initialTeams);
  }, [initialTeams]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Password reset state
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [resetReason, setResetReason] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  // Add Team Modal State
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    teamName: "",
    domainId: (tracks && tracks[0]?.id) || "theme-1-biomedical-ai",
    venue: "1011",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    collegeName: "Vardhaman College of Engineering",
    members: [] as any[],
    customTeamCode: "",
    customPassword: "",
  });
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [addTeamError, setAddTeamError] = useState<string | null>(null);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<any>(null);

  // Judge Allocation & Venue Assignment State
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [isAutoAssigningJudges, setIsAutoAssigningJudges] = useState(false);
  const [isAutoAssigningVenues, setIsAutoAssigningVenues] = useState(false);
  const [judgeCopiedSuccess, setJudgeCopiedSuccess] = useState(false);

  // Handlers for dynamic member adding
  const handleAddMemberSlot = () => {
    if (newTeamData.members.length >= 3) return; // max 4 total including leader
    setNewTeamData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: "",
          rollNumber: "",
          branch: "CSE",
          year: "3rd Year",
          email: "",
          phone: "",
          collegeName: prev.collegeName || "Vardhaman College of Engineering",
        },
      ],
    }));
  };

  const handleRemoveMemberSlot = (index: number) => {
    setNewTeamData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setNewTeamData((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  // Submit manual team onboarding
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamData.teamName.trim()) {
      setAddTeamError("Team Name is required.");
      return;
    }
    if (!newTeamData.leaderEmail.trim()) {
      setAddTeamError("Leader Email is required.");
      return;
    }
    if (!newTeamData.leaderPhone.trim()) {
      setAddTeamError("Leader Phone is required.");
      return;
    }

    setIsAddingTeam(true);
    setAddTeamError(null);

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_TEAM",
          payload: {
            ...newTeamData,
            domainId: newTeamData.domainId || (tracks && tracks[0]?.id) || "theme-1-biomedical-ai",
            venue: newTeamData.venue || "1011",
            members: [
              {
                name: newTeamData.leaderName || "Team Leader",
                rollNumber: "ROLL01",
                branch: "CSE",
                year: "3rd Year",
                email: newTeamData.leaderEmail.trim().toLowerCase(),
                phone: newTeamData.leaderPhone.trim(),
                collegeName: newTeamData.collegeName || "Vardhaman College of Engineering",
              },
              ...newTeamData.members.filter((m) => m.name && m.name.trim()),
            ],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddTeamError(data.error || "Failed to create team.");
        setIsAddingTeam(false);
        return;
      }

      setShowAddTeamModal(false);
      setCreatedCredentialsModal(data.team);
      setNewTeamData({
        teamName: "",
        domainId: (tracks && tracks[0]?.id) || "theme-1-biomedical-ai",
        venue: "1011",
        leaderName: "",
        leaderEmail: "",
        leaderPhone: "",
        collegeName: "Vardhaman College of Engineering",
        members: [],
        customTeamCode: "",
        customPassword: "",
      });
      onRefresh();
    } catch {
      setAddTeamError("Network error while onboarding team.");
    } finally {
      setIsAddingTeam(false);
    }
  };

  // Reassign Venue Handler
  const handleAssignVenue = async (teamCode: string, venue: string) => {
    setTeams((prev) =>
      prev.map((tm) => (tm.teamCode === teamCode ? { ...tm, venue } : tm))
    );
    try {
      await onAdminAction("ASSIGN_VENUE", { teamCode, venue });
      onRefresh();
    } catch {
      alert("Failed to reassign venue.");
      onRefresh();
    }
  };

  // Reassign Domain Handler with optimistic update
  const handleAssignDomain = async (teamCode: string, domainId: string) => {
    setTeams((prev) =>
      prev.map((tm) => (tm.teamCode === teamCode ? { ...tm, domainId } : tm))
    );
    setUpdatingDomainCode(teamCode);
    try {
      await onAdminAction("ASSIGN_DOMAIN", { teamCode, domainId });
      onRefresh();
    } catch {
      alert("Failed to reassign domain.");
      onRefresh();
    } finally {
      setUpdatingDomainCode(null);
    }
  };

  // Assign Judge Handler
  const handleAssignJudge = async (teamCode: string, judgeId: string) => {
    setTeams((prev) =>
      prev.map((tm) => (tm.teamCode === teamCode ? { ...tm, assignedJudgeId: judgeId } : tm))
    );
    try {
      await onAdminAction("ASSIGN_JUDGE", { teamCode, judgeId });
      onRefresh();
    } catch {
      alert("Failed to assign judge.");
      onRefresh();
    }
  };

  // Auto-Assign Venues
  const handleAutoAssignVenues = async () => {
    if (!confirm("Auto-distribute all teams evenly across Venues 1011, 1019, and 1020?")) return;
    setIsAutoAssigningVenues(true);
    try {
      await onAdminAction("AUTO_ASSIGN_VENUES", {});
      onRefresh();
    } catch {
      alert("Failed to auto-distribute venues.");
    } finally {
      setIsAutoAssigningVenues(false);
    }
  };

  // Auto-Assign Judges
  const handleAutoAssignJudges = async () => {
    if (!confirm("Auto-distribute all teams evenly across the 10 Judges?")) return;
    setIsAutoAssigningJudges(true);
    try {
      await onAdminAction("AUTO_ASSIGN_JUDGES", {});
      onRefresh();
    } catch {
      alert("Failed to auto-distribute judges.");
    } finally {
      setIsAutoAssigningJudges(false);
    }
  };

  // Copy All Judge Credentials
  const handleCopyJudgeCredentials = () => {
    const list = (judges && judges.length > 0 ? judges : []).map((j: any, idx: number) => {
      const raw = j.rawPassword || `OptiForge#Judge0${idx + 1}!`;
      return `Judge ${idx + 1}:\nUsername: ${j.username}\nPassword: ${raw}\nVenue: ${j.assignedVenue || "1011"}\nName: ${j.name}`;
    }).join("\n\n---\n\n");

    navigator.clipboard.writeText(list);
    setJudgeCopiedSuccess(true);
    setTimeout(() => setJudgeCopiedSuccess(false), 3000);
  };

  // Export Complete Team Details modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const executeCompleteTeamDetailsExport = async () => {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const res = await fetch("/api/admin/export/teams");
      if (!res.ok) {
        alert("Export failed. Ensure you are logged in as an authorized ADMIN.");
        setIsExporting(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OptiForge_2026_Complete_Team_Details_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      const validCount = (teams || []).length;

      setExportNotice(
        `Successfully generated master export for ${validCount} registered teams (${(teams || []).reduce((acc: number, t: any) => acc + (t.members?.length || 0), 0)} members). Plaintext passwords included where default initial credentials were retained.`
      );
    } catch {
      alert("Network error exporting team details.");
    }
    setIsExporting(false);
  };

  // Email dispatch & password regeneration states
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [isBroadcastingEmails, setIsBroadcastingEmails] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isRegeneratingPasswords, setIsRegeneratingPasswords] = useState(false);

  // Send credentials email to a single team
  const handleSendTeamEmail = async (team: any) => {
    setSendingEmailFor(team.teamCode);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/email/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: team.teamCode }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setEmailStatus({
          type: "success",
          message: `Official credentials email dispatched successfully to ${result.count} member(s) of ${team.teamName} (${team.teamCode}): ${result.sentTo.join(", ")}`,
        });
      } else {
        setEmailStatus({
          type: "error",
          message: result.error || "Failed to send credentials email.",
        });
      }
    } catch {
      setEmailStatus({
        type: "error",
        message: "Network error sending credentials email.",
      });
    }
    setSendingEmailFor(null);
  };

  // Broadcast credentials to all teams
  const handleBroadcastAllEmails = async () => {
    const confirmed = window.confirm(
      `Broadcast Registration Confirmation & Login Credentials to all ${teams.length} teams via SMTP?\n\nThis will send the official IEEE email template with individual team passwords to every registered member.`
    );
    if (!confirmed) return;

    setIsBroadcastingEmails(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/email/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broadcastAll: true }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setEmailStatus({
          type: "success",
          message: `Broadcast complete! Credentials dispatched to ${result.totalTeams} teams (${result.count} total recipients).`,
        });
      } else {
        setEmailStatus({
          type: "error",
          message: result.error || "Failed to broadcast credentials.",
        });
      }
    } catch {
      setEmailStatus({
        type: "error",
        message: "Network error broadcasting emails.",
      });
    }
    setIsBroadcastingEmails(false);
  };

  // Bulk password regeneration (zero data loss)
  const handleRegenerateAllPasswords = async () => {
    const confirmed = window.confirm(
      "Regenerate new secure, non-predictable passwords for all teams?\n\n• Cryptographically generated tokens (e.g. Forge#KLM$849)\n• 100% preservation of all live teams, submissions, UTRs, and attempt history\n• New passwords will be immediately active."
    );
    if (!confirmed) return;

    setIsRegeneratingPasswords(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REGENERATE_ALL_PASSWORDS", payload: {} }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setEmailStatus({
          type: "success",
          message: `Successfully regenerated secure passwords for all ${result.count} teams! Live database updated. Zero data loss.`,
        });
        onRefresh();
      } else {
        setEmailStatus({
          type: "error",
          message: result.error || "Failed to regenerate passwords.",
        });
      }
    } catch {
      setEmailStatus({
        type: "error",
        message: "Network error regenerating passwords.",
      });
    }
    setIsRegeneratingPasswords(false);
  };

  // Team Credentials View Mode & Password Toggles
  const [showCredentialsMode, setShowCredentialsMode] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (teamId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  // Download Team Credentials CSV File (Admin Only)
  const downloadTeamCredentialsCsv = () => {
    const validTeams = teams || [];
    
    const headers = "Team ID,Team Name,Team Leader Name,Team Leader Email,Password,Login URL,Registration Status\n";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://optiforge-2026.vercel.app";
    const loginUrl = `${origin}/login`;

    const rows = validTeams
      .map((t: any) => {
        const leaderName = (t.members && t.members.length > 0 && t.members[0].name) ? t.members[0].name : t.teamName;
        const isApproved = t.razorpaySignature === "ADMIN_VERIFIED_APPROVED";
        const password = isApproved ? (t.rawPassword || `Forge#${t.teamCode?.split("-")[2] || "2026"}`) : "PENDING_ADMIN_APPROVAL";
        return `"${t.teamCode}","${t.teamName.replace(/"/g, '""')}","${leaderName.replace(/"/g, '""')}","${t.leaderEmail}","${password}","${loginUrl}","${t.paymentStatus}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OptiForge_Team_Credentials_${Date.now()}.csv`;
    a.click();
  };

  // Copy helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered and sorted teams
  const processedTeams = useMemo(() => {
    let filtered = teams || [];

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t: any) => {
        const matchTeam =
          t.teamCode?.toLowerCase().includes(q) ||
          t.teamName?.toLowerCase().includes(q) ||
          t.leaderEmail?.toLowerCase().includes(q) ||
          t.leaderPhone?.includes(q);
        const matchMembers = (t.members || []).some(
          (m: any) =>
            m.name?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.collegeName?.toLowerCase().includes(q)
        );
        return matchTeam || matchMembers;
      });
    }

    // Apply status filter
    if (statusFilter === "CONFIRMED") {
      filtered = filtered.filter((t: any) => t.paymentStatus === "CONFIRMED");
    } else if (statusFilter === "PENDING") {
      filtered = filtered.filter((t: any) => t.paymentStatus === "PENDING_PAYMENT");
    } else if (statusFilter === "COMPLETE") {
      filtered = filtered.filter(
        (t: any) => t.paymentStatus === "CONFIRMED" && (t.members?.length || 0) >= 2
      );
    } else if (statusFilter === "INCOMPLETE") {
      filtered = filtered.filter(
        (t: any) => t.paymentStatus !== "CONFIRMED" || (t.members?.length || 0) < 2
      );
    }

    // Apply venue filter
    if (venueFilter !== "ALL") {
      filtered = filtered.filter((t: any) => t.venue === venueFilter);
    }

    // Apply sort
    filtered.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortField) {
        case "teamCode":
          cmp = (a.teamCode || "").localeCompare(b.teamCode || "");
          break;
        case "teamName":
          cmp = (a.teamName || "").localeCompare(b.teamName || "");
          break;
        case "venue":
          cmp = (a.venue || "").localeCompare(b.venue || "");
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "paymentStatus":
          cmp = (a.paymentStatus || "").localeCompare(b.paymentStatus || "");
          break;
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });

    return filtered;
  }, [teams, searchQuery, statusFilter, venueFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedTeams.length / ITEMS_PER_PAGE));
  const paginatedTeams = processedTeams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Team deletion handler
  const handleDeleteTeam = async () => {
    if (!deleteTarget || deleteConfirmCode !== deleteTarget.teamCode) return;
    setIsDeleting(true);
    try {
      await onAdminAction("DELETE_TEAM", {
        teamCode: deleteTarget.teamCode,
        confirmCode: deleteConfirmCode,
        reason: deleteReason,
      });
      setDeleteTarget(null);
      setDeleteConfirmCode("");
      setDeleteReason("");
      onRefresh();
    } catch {
      alert("Deletion failed. Please try again.");
    }
    setIsDeleting(false);
  };

  // Password reset handler
  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    setResetResult(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_TEAM_PASSWORD",
          payload: { teamCode: resetTarget.teamCode, reason: resetReason },
        }),
      });
      const data = await res.json();
      if (res.ok && data.temporaryPassword) {
        setResetResult(data.temporaryPassword);
      } else {
        alert(data.error || "Password reset failed.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setIsResetting(false);
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 hover:text-teal-accent transition-colors group"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`w-3 h-3 transition-colors ${
          sortField === field ? "text-teal-accent" : "text-brand-dim group-hover:text-brand-muted"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search + Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-navy-border/80">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by Team ID, name, email, member name, or college..."
            className="w-full bg-transparent text-xs text-brand-white placeholder:text-brand-dim focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-white text-xs"
            >
              <option value="ALL">All Statuses ({teams?.length || 0})</option>
              <option value="CONFIRMED">Registered (Paid)</option>
              <option value="PENDING">Pending Payment</option>
              <option value="COMPLETE">Complete Teams</option>
              <option value="INCOMPLETE">Incomplete Teams</option>
            </select>
          </div>

          {/* Venue Filter (1011, 1019, 1020) */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={venueFilter}
              onChange={(e) => {
                setVenueFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-emerald-400 font-bold text-xs"
            >
              <option value="ALL">All Venues</option>
              <option value="1011">Venue 1011</option>
              <option value="1019">Venue 1019</option>
              <option value="1020">Venue 1020</option>
            </select>
          </div>

          {/* + Add Team Button */}
          <button
            onClick={() => {
              setShowAddTeamModal(true);
              setAddTeamError(null);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
            title="Manually register an unregistered team with immediate login access"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Team</span>
          </button>

          {/* Auto-Assign Venues */}
          <button
            onClick={handleAutoAssignVenues}
            disabled={isAutoAssigningVenues}
            className="px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-navy-deep border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Auto-distribute all teams evenly across Venues 1011, 1019, 1020"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isAutoAssigningVenues ? "Distributing..." : "Auto-Distribute Venues"}</span>
          </button>

          {/* 10 Judges Matrix */}
          <button
            onClick={() => setShowJudgeModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#772583]/30 hover:bg-[#772583]/50 border border-purple-500/60 text-purple-300 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Open 10 Judges evaluation allocation matrix & credential directory"
          >
            <Gavel className="w-3.5 h-3.5 text-purple-400" />
            <span>10 Judges Matrix</span>
          </button>

          <button
            onClick={() => setShowCredentialsMode(!showCredentialsMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showCredentialsMode
                ? "bg-teal-accent/20 border-teal-accent text-teal-accent"
                : "bg-bg-secondary border-navy-border text-brand-white hover:bg-navy-deep"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{showCredentialsMode ? "Hide Credentials View" : "Team Credentials View"}</span>
          </button>

          <button
            onClick={() => generateAttendanceSheetPdf(teams || [])}
            className="px-3.5 py-1.5 rounded-lg bg-[#00629B]/25 hover:bg-[#00629B]/40 border border-[#00629B]/60 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Download official physical desk attendance sheet for verified teams with submitted UTR (PDF)"
          >
            <FileCheck className="w-3.5 h-3.5 text-teal-accent" />
            <span>Attendance Sheet (PDF)</span>
          </button>

          <button
            onClick={() => generateCredentialsSheetPdf(teams || [])}
            className="px-3.5 py-1.5 rounded-lg bg-[#772583]/25 hover:bg-[#772583]/40 border border-[#772583]/60 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Download official team login IDs and passwords master directory (PDF)"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-accent" />
            <span>Credentials (PDF)</span>
          </button>

          <button
            onClick={() => window.open("/registered_teams.pdf", "_blank")}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/60 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Download official registered teams directory formatted with 5 teams per page in large font (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teams Roster (PDF · 5/Page)</span>
          </button>

          <button
            onClick={handleBroadcastAllEmails}
            disabled={isBroadcastingEmails}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00629B] to-[#238B68] hover:brightness-110 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Dispatch official IEEE Registration Confirmation & Login Credentials email to all teams"
          >
            {isBroadcastingEmails ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>Broadcast All Emails</span>
              </>
            )}
          </button>

          <button
            onClick={handleRegenerateAllPasswords}
            disabled={isRegeneratingPasswords}
            className="px-3.5 py-1.5 rounded-lg bg-[#772583]/20 hover:bg-[#772583]/30 border border-[#772583]/50 text-white font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Regenerate secure, non-predictable passwords for all teams (preserves all data)"
          >
            {isRegeneratingPasswords ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-orange-accent" />
                <span>Regenerate Passwords</span>
              </>
            )}
          </button>

          <button
            onClick={downloadTeamCredentialsCsv}
            className="px-3.5 py-1.5 rounded-lg bg-bg-secondary border border-teal-accent/40 text-teal-accent hover:bg-navy-deep font-semibold text-xs transition-all flex items-center gap-1.5"
            title="Download Team Credentials CSV (XLSX/CSV compatible)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Team Credentials</span>
          </button>

          <button
            onClick={() => {
              setShowExportModal(true);
              setExportNotice(null);
            }}
            className="px-4 py-1.5 rounded-lg bg-gradient-signature text-bg-primary font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-1.5"
            title="Export consolidated master file with Team Overview, Members, and Credentials"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Team Details</span>
          </button>
        </div>
      </div>

      {/* Email / Action Feedback Toast / Banner */}
      {emailStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono animate-fade-in ${
            emailStatus.type === "success"
              ? "bg-[#238B68]/15 border-[#238B68]/40 text-[#238B68]"
              : "bg-red-500/15 border-red-500/40 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {emailStatus.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{emailStatus.message}</span>
          </div>
          <button
            onClick={() => setEmailStatus(null)}
            className="text-xs text-brand-muted hover:text-brand-white ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Team Table */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-navy-border/60 text-brand-dim uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-8"></th>
                <th className="py-3.5 px-4">
                  <SortButton field="teamCode" label="Team ID" />
                </th>
                <th className="py-3.5 px-4">
                  <SortButton field="teamName" label="Team Name" />
                </th>
                <th className="py-3.5 px-4">Leader / Email</th>
                {showCredentialsMode && <th className="py-3.5 px-4">Password</th>}
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Domain (Editable)</th>
                <th className="py-3.5 px-4">
                  <SortButton field="venue" label="Venue" />
                </th>
                <th className="py-3.5 px-4">Assigned Judge</th>
                <th className="py-3.5 px-4">
                  <SortButton field="paymentStatus" label="Status" />
                </th>
                <th className="py-3.5 px-4">
                  <SortButton field="createdAt" label="Registered" />
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-border/40">
              {paginatedTeams.map((t: any) => (
                <React.Fragment key={t.id}>
                  {/* Main Row */}
                  <tr
                    className={`hover:bg-bg-secondary/40 transition-colors cursor-pointer ${
                      expandedTeamId === t.id ? "bg-bg-secondary/30" : ""
                    }`}
                    onClick={() => setExpandedTeamId(expandedTeamId === t.id ? null : t.id)}
                  >
                    <td className="py-3.5 px-4">
                      {expandedTeamId === t.id ? (
                        <ChevronUp className="w-4 h-4 text-teal-accent" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-brand-dim" />
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-teal-accent">{t.teamCode}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(t.teamCode, `code-${t.id}`);
                          }}
                          className="p-0.5 rounded hover:bg-teal-accent/10 transition-colors"
                          title="Copy Team ID"
                        >
                          {copiedField === `code-${t.id}` ? (
                            <Check className="w-3 h-3 text-status-green" />
                          ) : (
                            <Copy className="w-3 h-3 text-brand-dim" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-white">{t.teamName}</td>
                    <td className="py-3.5 px-4 text-brand-muted">
                      <div className="text-brand-white text-[11px] font-bold">{t.members?.[0]?.name || t.teamName}</div>
                      <div className="text-[10px] text-teal-accent">{t.leaderEmail}</div>
                      <div className="text-[10px] text-brand-dim">{t.leaderPhone}</div>
                    </td>
                    {showCredentialsMode && (
                      <td className="py-3.5 px-4 font-mono" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const isApproved = t.razorpaySignature === "ADMIN_VERIFIED_APPROVED";
                          const passVal = isApproved
                            ? (t.rawPassword || `Forge#${t.teamCode?.split("-")[2] || "2026"}`)
                            : "PENDING_APPROVAL";
                          const isVisible = !!visiblePasswords[t.id];
                          return (
                            <div className="flex items-center gap-1.5">
                              <span className="text-teal-accent font-bold bg-bg-secondary px-2 py-0.5 rounded border border-navy-border/80 inline-block text-[11px]">
                                {isVisible ? passVal : "••••••••"}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(t.id)}
                                className="p-1 rounded hover:bg-navy-deep text-brand-muted hover:text-brand-white transition-colors"
                                title={isVisible ? "Hide Password" : "Show Password"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => copyToClipboard(`Team ID: ${t.teamCode}\nPassword: ${passVal}`, `pass-${t.id}`)}
                                className="p-1 rounded hover:bg-navy-deep text-brand-muted hover:text-teal-accent transition-colors"
                                title="Copy Credentials"
                              >
                                {copiedField === `pass-${t.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-status-green" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-bg-secondary border border-navy-border text-brand-white text-[11px] font-semibold">
                        {t.members?.length || 0}
                      </span>
                    </td>
                    {/* Domain Track Dropdown (Admin can change on the fly) */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={normalizeDomainId(t.domainId)}
                          onChange={(e) => handleAssignDomain(t.teamCode, e.target.value)}
                          disabled={updatingDomainCode === t.teamCode}
                          className="bg-[#0b1728] border border-teal-500/50 hover:border-teal-400 text-teal-300 font-semibold rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-400 focus:outline-none min-w-[200px] max-w-[250px] cursor-pointer shadow-xs disabled:opacity-50"
                          title="Change Innovation Domain Track for this specific team"
                        >
                          {OFFICIAL_INNOVATION_DOMAINS.map((domain) => (
                            <option
                              key={domain.id}
                              value={domain.id}
                              className="bg-[#0b1728] text-white py-1 font-sans"
                            >
                              {domain.shortName}
                            </option>
                          ))}
                        </select>
                        {updatingDomainCode === t.teamCode && (
                          <div className="w-3.5 h-3.5 border-2 border-teal-accent border-t-transparent rounded-full animate-spin shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Venue Dropdown (1011, 1019, 1020) */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.venue || "1011"}
                        onChange={(e) => handleAssignVenue(t.teamCode, e.target.value)}
                        className="bg-bg-secondary border border-emerald-500/40 text-emerald-400 font-bold rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        title="Assign to Laboratory Room (1011, 1019, 1020)"
                      >
                        <option value="1011" className="bg-bg-primary text-white">1011</option>
                        <option value="1019" className="bg-bg-primary text-white">1019</option>
                        <option value="1020" className="bg-bg-primary text-white">1020</option>
                      </select>
                    </td>

                    {/* Assigned Judge Dropdown */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.assignedJudgeId || ""}
                        onChange={(e) => handleAssignJudge(t.teamCode, e.target.value)}
                        className="bg-bg-secondary border border-purple-500/40 text-purple-300 font-medium rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none max-w-[125px] truncate"
                        title="Assign Specific Evaluator Judge"
                      >
                        <option value="" className="bg-bg-primary text-brand-dim">Unassigned</option>
                        {judges && judges.map((j: any) => (
                          <option key={j.id} value={j.id} className="bg-bg-primary text-white">
                            {j.username}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.paymentStatus === "CONFIRMED" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-status-green/15 text-status-green border border-status-green/30 font-semibold">
                          CONFIRMED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-orange-accent/15 text-orange-accent border border-orange-accent/30 font-semibold">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-brand-dim text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendTeamEmail(t)}
                          disabled={sendingEmailFor === t.teamCode}
                          className="p-1.5 rounded-lg bg-bg-secondary hover:bg-teal-accent/20 border border-navy-border text-brand-muted hover:text-teal-accent transition-colors disabled:opacity-50"
                          title={`Send Credentials Email to ${t.teamName} (${t.members?.length || 1} recipients)`}
                        >
                          {sendingEmailFor === t.teamCode ? (
                            <div className="w-3.5 h-3.5 border-2 border-teal-accent border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedTeam(t)}
                          className="p-1.5 rounded-lg bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-muted hover:text-brand-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setResetTarget(t);
                            setResetResult(null);
                            setResetReason("");
                          }}
                          className="p-1.5 rounded-lg bg-bg-secondary hover:bg-navy-deep border border-navy-border text-brand-muted hover:text-teal-accent transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(t);
                            setDeleteConfirmCode("");
                            setDeleteReason("");
                          }}
                          className="p-1.5 rounded-lg bg-bg-secondary hover:bg-red-950/60 border border-navy-border hover:border-red-800 text-brand-muted hover:text-red-400 transition-colors"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Members Row */}
                  {expandedTeamId === t.id && (
                    <tr>
                      <td colSpan={9} className="bg-bg-secondary/20 px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-brand-white">
                            <Users className="w-4 h-4 text-teal-accent" />
                            <span>Team Members ({t.members?.length || 0})</span>
                          </div>
                          {t.members && t.members.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {t.members.map((m: any, idx: number) => (
                                <div
                                  key={m.id || idx}
                                  className="p-3 rounded-xl bg-bg-card border border-navy-border/60 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-brand-white text-[12px]">
                                      {idx === 0 && (
                                        <span className="text-[9px] bg-teal-accent/15 text-teal-accent px-1.5 py-0.5 rounded border border-teal-accent/30 mr-1.5 uppercase font-mono">
                                          Leader
                                        </span>
                                      )}
                                      {m.name}
                                    </span>
                                    <span className="text-[10px] text-brand-dim font-mono">
                                      {m.branch} · {m.year}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-brand-muted">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {m.email}
                                      <button
                                        onClick={() => copyToClipboard(m.email, `email-${m.id}`)}
                                        className="p-0.5 rounded hover:bg-teal-accent/10"
                                      >
                                        {copiedField === `email-${m.id}` ? (
                                          <Check className="w-2.5 h-2.5 text-status-green" />
                                        ) : (
                                          <Copy className="w-2.5 h-2.5 text-brand-dim" />
                                        )}
                                      </button>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {m.phone}
                                    </span>
                                  </div>
                                  {m.collegeName && (
                                    <div className="flex items-center gap-1 text-[11px] text-brand-dim">
                                      <GraduationCap className="w-3 h-3" />
                                      {m.collegeName}
                                    </div>
                                  )}
                                  {m.rollNumber && (
                                    <div className="text-[10px] text-brand-dim font-mono">
                                      Roll: {m.rollNumber}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-brand-dim italic">No members data available.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {paginatedTeams.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-brand-muted text-xs">
                    No teams match the current search/filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-navy-border/60">
            <span className="text-[11px] text-brand-dim font-mono">
              Page {currentPage} of {totalPages} · {processedTeams.length} teams
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-muted hover:text-brand-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                const pageNum = start + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-mono transition-colors ${
                      pageNum === currentPage
                        ? "bg-teal-accent/20 text-teal-accent border border-teal-accent/40 font-bold"
                        : "bg-bg-secondary border border-navy-border text-brand-muted hover:text-brand-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-muted hover:text-brand-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== TEAM DETAIL MODAL ===== */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-bg-card border border-navy-border/80 shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-accent/15 border border-teal-accent/30 text-teal-accent shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white">
                  {selectedTeam.teamName}
                </h3>
                <p className="text-xs text-teal-accent font-mono font-bold">{selectedTeam.teamCode}</p>
              </div>
            </div>

            {/* Team Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <DetailField label="Team ID" value={selectedTeam.teamCode} copyable />
              <DetailField label="Leader Email" value={selectedTeam.leaderEmail} copyable />
              <DetailField label="Leader Phone" value={selectedTeam.leaderPhone} />
              <DetailField label="Domain" value={OFFICIAL_INNOVATION_DOMAINS.find(d => d.id === normalizeDomainId(selectedTeam.domainId))?.name || selectedTeam.track?.name || selectedTeam.domainId || "—"} />
              <DetailField label="Payment Status" value={selectedTeam.paymentStatus} />
              <DetailField label="Payment Amount" value={`₹${selectedTeam.paymentAmount}`} />
              <DetailField label="Attempts Used" value={`${selectedTeam.attemptsUsed} / 3`} />
              <DetailField label="Best Score" value={selectedTeam.bestScore > 0 ? selectedTeam.bestScore.toFixed(1) : "—"} />
              <DetailField label="Disqualified" value={selectedTeam.isDisqualified ? "Yes" : "No"} />
              <DetailField
                label="Registered"
                value={new Date(selectedTeam.createdAt).toLocaleString("en-IN")}
              />
              {selectedTeam.razorpayPaymentId && (
                <DetailField label="UTR/Transaction" value={selectedTeam.razorpayPaymentId} copyable />
              )}
              <DetailField label="Members Count" value={String(selectedTeam.members?.length || 0)} />
            </div>

            {/* Members Section */}
            <div className="space-y-3 pt-2 border-t border-navy-border/60">
              <h4 className="text-xs font-semibold text-brand-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-accent" />
                Team Members
              </h4>
              {selectedTeam.members?.map((m: any, idx: number) => (
                <div
                  key={m.id || idx}
                  className="p-3 rounded-xl bg-bg-secondary border border-navy-border/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-brand-white font-semibold text-[12px]">
                      {idx === 0 && (
                        <span className="text-[9px] bg-teal-accent/15 text-teal-accent px-1.5 py-0.5 rounded border border-teal-accent/30 mr-1.5 uppercase font-mono">
                          Leader
                        </span>
                      )}
                      {m.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-brand-muted">
                    <span>📧 {m.email}</span>
                    <span>📱 {m.phone}</span>
                    {m.collegeName && <span>🏫 {m.collegeName}</span>}
                    {m.rollNumber && <span>🆔 {m.rollNumber}</span>}
                    {m.branch && <span>📚 {m.branch}</span>}
                    {m.year && <span>📅 {m.year}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Credentials & Email Dispatch */}
            <div className="p-4 rounded-xl bg-bg-secondary border border-teal-accent/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-dim uppercase text-[10px]">Team Password</span>
                <span className="font-bold text-teal-accent">
                  {selectedTeam.rawPassword || `Forge#${selectedTeam.teamCode?.split("-")[2] || "2026"}`}
                </span>
              </div>
              <button
                onClick={() => handleSendTeamEmail(selectedTeam)}
                disabled={sendingEmailFor === selectedTeam.teamCode}
                className="w-full py-2.5 rounded-lg bg-teal-accent hover:bg-teal-accent/90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {sendingEmailFor === selectedTeam.teamCode ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching Credentials Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Official Credentials Email to All Members</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE TEAM CONFIRMATION DIALOG ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-red-800/60 shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-red-400">
                  Permanently Delete Team
                </h3>
                <p className="text-xs text-brand-muted mt-1">
                  This action <strong className="text-red-300">cannot be undone</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 space-y-1.5">
              <p className="font-semibold">The following will be permanently deleted:</p>
              <ul className="space-y-0.5 ml-4 list-disc text-[11px]">
                <li>Team record: <strong>{deleteTarget.teamName}</strong> ({deleteTarget.teamCode})</li>
                <li>{deleteTarget.members?.length || 0} team member records</li>
                <li>All submission records and code</li>
                <li>All judge evaluation records</li>
                <li>Registration and payment records</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-white mb-1">
                  Type <span className="text-teal-accent font-mono">{deleteTarget.teamCode}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmCode}
                  onChange={(e) => setDeleteConfirmCode(e.target.value)}
                  placeholder={deleteTarget.teamCode}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-white mb-1">
                  Deletion Reason (Required):
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={2}
                  placeholder="e.g., Duplicate registration, team request, test data cleanup..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs text-brand-muted hover:text-brand-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={
                  isDeleting ||
                  deleteConfirmCode !== deleteTarget.teamCode ||
                  !deleteReason.trim()
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESET PASSWORD DIALOG ===== */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-navy-border/80 shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => {
                setResetTarget(null);
                setResetResult(null);
              }}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-accent/15 border border-teal-accent/30 text-teal-accent shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white">
                  Reset Team Password
                </h3>
                <p className="text-xs text-brand-muted mt-1">
                  {resetTarget.teamName} ({resetTarget.teamCode})
                </p>
              </div>
            </div>

            {resetResult ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-status-green/10 border border-status-green/30 text-xs space-y-2">
                  <p className="text-status-green font-semibold">Password reset successful!</p>
                  <p className="text-brand-muted">Share the temporary password below securely with the team leader:</p>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-secondary border border-navy-border font-mono text-brand-white">
                    <span className="font-bold flex-1">{resetResult}</span>
                    <button
                      onClick={() => copyToClipboard(resetResult, "reset-pw")}
                      className="p-1 rounded hover:bg-teal-accent/10 transition-colors"
                    >
                      {copiedField === "reset-pw" ? (
                        <Check className="w-4 h-4 text-status-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-teal-accent" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-orange-accent">
                    ⚠️ This password will not be shown again. Copy it now.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResetTarget(null);
                    setResetResult(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-brand-white text-xs font-semibold hover:bg-navy-deep transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-brand-white mb-1">
                    Reason (Optional):
                  </label>
                  <input
                    type="text"
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    placeholder="e.g., Team leader forgot password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setResetTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs text-brand-muted hover:text-brand-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={isResetting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isResetting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Generate New Password
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== EXPORT COMPLETE TEAM DETAILS CONFIRMATION MODAL ===== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-teal-accent/50 shadow-2xl p-6 sm:p-8 space-y-5 relative">
            <button
              onClick={() => {
                setShowExportModal(false);
                setExportNotice(null);
              }}
              className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-accent/15 border border-teal-accent/30 text-teal-accent shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-brand-white">
                  Export Complete Team Details
                </h3>
                <p className="text-xs text-brand-muted mt-1">
                  OptiForge 2026 Master Consolidated Export (Admin Restricted)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2 font-mono">
              <p className="font-bold flex items-center gap-1.5 text-amber-200">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Confidential Administrator Export Notice</span>
              </p>
              <p className="font-sans leading-relaxed text-brand-muted">
                This export contains sensitive participant and credential information. It is restricted to authorized administrators. Continue?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-bg-secondary border border-navy-border text-xs space-y-1 font-mono text-brand-muted">
              <span className="text-[10px] text-brand-dim uppercase block">Export Contents:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-brand-white">
                <li><strong>Sheet 1 — Team Overview:</strong> Status, Payment UTR, Scores, Stage</li>
                <li><strong>Sheet 2 — Team Members:</strong> Roster, Rolls, Email, Phone, College</li>
                <li><strong>Sheet 3 — Credentials:</strong> Login URLs, Reset Status, Retained Passwords</li>
              </ul>
            </div>

            {exportNotice && (
              <div className="p-3.5 rounded-xl bg-status-green/10 border border-status-green/30 text-xs text-status-green font-mono">
                ✔ {exportNotice}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportNotice(null);
                }}
                className="px-4 py-2 rounded-xl text-xs text-brand-muted hover:text-brand-white transition-colors"
              >
                {exportNotice ? "Close" : "Cancel"}
              </button>
              {!exportNotice && (
                <button
                  onClick={executeCompleteTeamDetailsExport}
                  disabled={isExporting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Confirm & Download Master Export
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: MANUAL TEAM ONBOARDING (+ Add Team) ===== */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-bg-card border border-teal-accent/50 p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-accent/20 border border-teal-accent/40 flex items-center justify-center text-teal-accent">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-white">
                    Onboard Unregistered Team
                  </h3>
                  <p className="text-xs text-brand-muted font-mono">
                    Instant access &amp; pre-verified registration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addTeamError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono">
                {addTeamError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs font-mono">
              {/* Row 1: Team Name, Track, Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-brand-dim uppercase text-[10px] block">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={newTeamData.teamName}
                    onChange={(e) => setNewTeamData({ ...newTeamData, teamName: e.target.value })}
                    placeholder="e.g. SwarmIntelligence"
                    className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-navy-border text-brand-white text-xs focus:ring-1 focus:ring-teal-accent focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-brand-dim uppercase text-[10px] block">Domain Track *</label>
                  <select
                    value={newTeamData.domainId}
                    onChange={(e) => setNewTeamData({ ...newTeamData, domainId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-navy-border text-teal-accent text-xs focus:ring-1 focus:ring-teal-accent focus:outline-none"
                  >
                    {OFFICIAL_INNOVATION_DOMAINS.map((domain) => (
                      <option key={domain.id} value={domain.id} className="bg-[#0b1728] text-white">
                        {domain.name} ({domain.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-brand-dim uppercase text-[10px] block">Venue *</label>
                  <select
                    value={newTeamData.venue}
                    onChange={(e) => setNewTeamData({ ...newTeamData, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-navy-border text-emerald-400 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="1011">Venue 1011</option>
                    <option value="1019">Venue 1019</option>
                    <option value="1020">Venue 1020</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Team Leader Details */}
              <div className="p-3.5 rounded-2xl bg-bg-secondary/60 border border-navy-border/60 space-y-3">
                <span className="text-teal-accent font-bold text-[11px] block uppercase">
                  1. Team Leader (Primary Contact)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-brand-dim text-[10px] block mb-1">Leader Full Name</label>
                    <input
                      type="text"
                      value={newTeamData.leaderName}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderName: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-brand-dim text-[10px] block mb-1">Leader Email *</label>
                    <input
                      type="email"
                      required
                      value={newTeamData.leaderEmail}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderEmail: e.target.value })}
                      placeholder="leader@vce.ac.in"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-brand-dim text-[10px] block mb-1">Leader Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newTeamData.leaderPhone}
                      onChange={(e) => setNewTeamData({ ...newTeamData, leaderPhone: e.target.value })}
                      placeholder="10-digit Mobile"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Additional Members */}
              <div className="p-3.5 rounded-2xl bg-bg-secondary/60 border border-navy-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-brand-white font-bold text-[11px] uppercase">
                    Additional Team Members ({newTeamData.members.length} / 3)
                  </span>
                  {newTeamData.members.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddMemberSlot}
                      className="px-2.5 py-1 rounded-lg bg-teal-accent/20 border border-teal-accent/40 text-teal-accent text-xs font-bold hover:bg-teal-accent/30 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                {newTeamData.members.map((mem, mIdx) => (
                  <div key={mIdx} className="p-2.5 rounded-xl bg-bg-card border border-navy-border/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-brand-dim">
                      <span>Member #{mIdx + 2}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberSlot(mIdx)}
                        className="text-red-400 hover:text-red-300 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={mem.name}
                        onChange={(e) => handleMemberChange(mIdx, "name", e.target.value)}
                        className="px-2 py-1 rounded bg-bg-secondary border border-navy-border text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Roll No"
                        value={mem.rollNumber}
                        onChange={(e) => handleMemberChange(mIdx, "rollNumber", e.target.value)}
                        className="px-2 py-1 rounded bg-bg-secondary border border-navy-border text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Branch"
                        value={mem.branch}
                        onChange={(e) => handleMemberChange(mIdx, "branch", e.target.value)}
                        className="px-2 py-1 rounded bg-bg-secondary border border-navy-border text-white text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={mem.email}
                        onChange={(e) => handleMemberChange(mIdx, "email", e.target.value)}
                        className="px-2 py-1 rounded bg-bg-secondary border border-navy-border text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 4: Custom ID & Password (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-bg-secondary/40 border border-navy-border/40">
                <div>
                  <label className="text-brand-dim text-[10px] block mb-1">Custom Team ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto OPT-26-XXXX"
                    value={newTeamData.customTeamCode}
                    onChange={(e) => setNewTeamData({ ...newTeamData, customTeamCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-white text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-brand-dim text-[10px] block mb-1">Custom Password (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto secure password"
                    value={newTeamData.customPassword}
                    onChange={(e) => setNewTeamData({ ...newTeamData, customPassword: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-brand-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingTeam}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 font-bold text-white shadow-glow disabled:opacity-50 flex items-center gap-2"
                >
                  {isAddingTeam ? "Onboarding Team..." : "Submit & Onboard Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CREATED CREDENTIALS CARD MODAL ===== */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-bg-card border border-emerald-500/60 p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-brand-white">
                Team Successfully Onboarded!
              </h3>
              <p className="text-xs text-brand-muted mt-1">
                The team is active with payment confirmed and can log in immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-bg-secondary border border-navy-border text-left font-mono space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-navy-border/60">
                <span className="text-brand-dim">Team Name:</span>
                <span className="font-bold text-brand-white">{createdCredentialsModal.teamName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-navy-border/60">
                <span className="text-brand-dim">Team ID:</span>
                <span className="font-bold text-teal-accent text-sm">{createdCredentialsModal.teamCode}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-navy-border/60">
                <span className="text-brand-dim">Password:</span>
                <span className="font-bold text-orange-accent text-sm">{createdCredentialsModal.password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-dim">Assigned Venue:</span>
                <span className="font-bold text-emerald-400">Room {createdCredentialsModal.venue || "1011"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const text = `OPTIFORGE 2026 OFFICIAL LOGIN CREDENTIALS\nTeam ID: ${createdCredentialsModal.teamCode}\nPassword: ${createdCredentialsModal.password}\nAssigned Venue: Room ${createdCredentialsModal.venue || "1011"}\nLogin Portal: /login`;
                  navigator.clipboard.writeText(text);
                  alert("Credentials copied to clipboard!");
                }}
                className="w-full py-2.5 rounded-xl bg-teal-accent text-bg-primary font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-glow"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Credentials to Clipboard</span>
              </button>

              <button
                onClick={() => setCreatedCredentialsModal(null)}
                className="w-full py-2 rounded-xl text-xs text-brand-muted hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: 10 JUDGES EVALUATION ALLOCATION MATRIX ===== */}
      {showJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl rounded-3xl bg-bg-card border border-purple-500/60 p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between border-b border-navy-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-white">
                    Official 10 Judges Evaluation Matrix
                  </h3>
                  <p className="text-xs text-brand-muted font-mono">
                    Overview of the 10 evaluators, their credentials, and assigned teams workload
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJudgeModal(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-secondary/70 border border-navy-border font-mono text-xs">
              <div className="text-brand-muted">
                Total Teams: <span className="font-bold text-brand-white">{teams?.length || 0}</span> ·{" "}
                Active Evaluators: <span className="font-bold text-purple-400">{judges?.length || 10}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoAssignJudges}
                  disabled={isAutoAssigningJudges}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAutoAssigningJudges ? "Balancing..." : "⚡ Auto-Balance Teams Evenly"}</span>
                </button>
                <button
                  onClick={handleCopyJudgeCredentials}
                  className="px-3.5 py-1.5 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-teal-accent/40 text-teal-accent font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  {judgeCopiedSuccess ? <Check className="w-3.5 h-3.5 text-status-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{judgeCopiedSuccess ? "Copied!" : "📋 Copy All 10 Judge Logins"}</span>
                </button>
              </div>
            </div>

            {/* 10 Judges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
              {(judges && judges.length > 0 ? judges : []).map((j: any, idx: number) => {
                const assignedTeamsCount = teams.filter((t) => t.assignedJudgeId === j.id).length;
                const evaluatedCount = teams.filter((t) => t.assignedJudgeId === j.id && t.finalJudgeScore != null).length;
                const rawPass = j.rawPassword || `OptiForge#Judge0${idx + 1}!`;

                return (
                  <div
                    key={j.id || idx}
                    className="p-4 rounded-2xl bg-bg-secondary/60 border border-navy-border hover:border-purple-500/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-purple-300">{j.username}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Venue {j.assignedVenue || (idx < 3 ? "1011" : idx < 7 ? "1019" : "1020")}
                      </span>
                    </div>

                    <div className="text-[11px] text-brand-white font-sans font-medium line-clamp-1">
                      {j.name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-navy-border/40">
                      <span className="text-brand-dim">Teams Assigned:</span>
                      <span className="font-bold text-teal-accent">{assignedTeamsCount} teams</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-brand-dim">Evaluated:</span>
                      <span className={`font-bold ${evaluatedCount === assignedTeamsCount && assignedTeamsCount > 0 ? "text-status-green" : "text-orange-accent"}`}>
                        {evaluatedCount} / {assignedTeamsCount}
                      </span>
                    </div>

                    {/* Password slip */}
                    <div className="flex items-center justify-between bg-bg-card p-2 rounded-lg border border-navy-border/80 text-[10px]">
                      <span className="text-brand-muted">Pass: <span className="text-brand-white font-bold">{rawPass}</span></span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`Username: ${j.username}\nPassword: ${rawPass}`);
                          alert(`Copied login for ${j.username}`);
                        }}
                        className="p-1 rounded hover:bg-navy-deep text-brand-dim hover:text-teal-accent"
                        title="Copy Login Slip"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable detail field component
function DetailField({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-2.5 rounded-lg bg-bg-secondary border border-navy-border/60 space-y-0.5">
      <span className="text-[9px] uppercase text-brand-dim block tracking-wider font-sans">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-brand-white font-medium">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="p-0.5 rounded hover:bg-teal-accent/10">
            {copied ? (
              <Check className="w-3 h-3 text-status-green" />
            ) : (
              <Copy className="w-3 h-3 text-brand-dim" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
