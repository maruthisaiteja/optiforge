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
} from "lucide-react";
import { generateAttendanceSheetPdf, generateCredentialsSheetPdf } from "@/lib/pdfReportGenerator";

interface TeamManagementTabProps {
  teams: any[];
  onAdminAction: (action: string, payload: any) => Promise<void>;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 10;

type SortField = "teamCode" | "teamName" | "createdAt" | "paymentStatus";
type SortDirection = "asc" | "desc";

export default function TeamManagementTab({ teams, onAdminAction, onRefresh }: TeamManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
  }, [teams, searchQuery, statusFilter, sortField, sortDirection]);

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
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-white text-xs"
            >
              <option value="ALL">All Teams ({teams?.length || 0})</option>
              <option value="CONFIRMED">Registered (Paid)</option>
              <option value="PENDING">Pending Payment</option>
              <option value="COMPLETE">Complete Teams</option>
              <option value="INCOMPLETE">Incomplete Teams</option>
            </select>
          </div>

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
                <th className="py-3.5 px-4">Domain</th>
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
                    <td className="py-3.5 px-4 text-brand-muted text-[11px]">
                      {t.track?.shortName || t.domainId || "—"}
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
              <DetailField label="Domain" value={selectedTeam.track?.shortName || selectedTeam.domainId || "—"} />
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
