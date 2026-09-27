"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Calendar,
  ArrowUpDown,
  FileText,
  Shield,
} from "lucide-react";

interface AuditLogsTabProps {
  auditLogs: any[];
}

const ITEMS_PER_PAGE = 15;

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  TEAM_DELETED: { label: "Team Deleted", color: "text-red-400 bg-red-500/15 border-red-500/30" },
  TEAM_PASSWORD_RESET: { label: "Password Reset", color: "text-orange-accent bg-orange-accent/15 border-orange-accent/30" },
  JUDGE_PASSWORD_RESET: { label: "Judge PW Reset", color: "text-orange-accent bg-orange-accent/15 border-orange-accent/30" },
  MANUAL_PAYMENT_OVERRIDE: { label: "Payment Override", color: "text-status-green bg-status-green/15 border-status-green/30" },
  TEAM_DISQUALIFIED: { label: "Disqualified", color: "text-red-400 bg-red-500/15 border-red-500/30" },
  TEAM_REINSTATED: { label: "Reinstated", color: "text-status-green bg-status-green/15 border-status-green/30" },
  SCORE_OVERRIDE: { label: "Score Override", color: "text-electric-violet bg-electric-violet/15 border-electric-violet/30" },
  DOMAIN_REASSIGNED: { label: "Domain Changed", color: "text-teal-accent bg-teal-accent/15 border-teal-accent/30" },
  SETTING_CHANGED: { label: "Setting Changed", color: "text-brand-white bg-bg-secondary border-navy-border" },
  STAGE_ADVANCED: { label: "Stage Advanced", color: "text-teal-accent bg-teal-accent/15 border-teal-accent/30" },
  ANNOUNCEMENT_BROADCAST: { label: "Announcement", color: "text-brand-white bg-bg-secondary border-navy-border" },
  MANUAL_RESCORE_TRIGGERED: { label: "Rescore", color: "text-electric-violet bg-electric-violet/15 border-electric-violet/30" },
};

export default function AuditLogsTab({ auditLogs }: AuditLogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Unique action types for filter dropdown
  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    (auditLogs || []).forEach((log: any) => types.add(log.action));
    return Array.from(types).sort();
  }, [auditLogs]);

  // Filtered and sorted logs
  const processedLogs = useMemo(() => {
    let filtered = auditLogs || [];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log: any) =>
          log.action?.toLowerCase().includes(q) ||
          log.performedBy?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.reason?.toLowerCase().includes(q)
      );
    }

    // Action filter
    if (actionFilter !== "ALL") {
      filtered = filtered.filter((log: any) => log.action === actionFilter);
    }

    // Sort
    filtered = [...filtered].sort((a: any, b: any) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });

    return filtered;
  }, [auditLogs, searchQuery, actionFilter, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = processedLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (filter: string) => {
    setActionFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Export CSV
  const exportAuditCsv = () => {
    const headers = "Timestamp,Action,PerformedBy,Details,Reason\n";
    const rows = processedLogs
      .map(
        (log: any) =>
          `"${log.createdAt}","${log.action}","${log.performedBy}","${(log.details || "").replace(/"/g, '""')}","${(log.reason || "").replace(/"/g, '""')}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OptiForge_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Try to parse JSON details for rich display
  const parseDetails = (details: string) => {
    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch {}
    return null;
  };

  const getActionBadge = (action: string) => {
    const style = ACTION_LABELS[action] || {
      label: action,
      color: "text-brand-muted bg-bg-secondary border-navy-border",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-semibold border inline-block ${style.color}`}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-card border border-navy-border/80">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <Search className="w-4 h-4 text-brand-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by action, admin, details, or reason..."
            className="w-full bg-transparent text-xs text-brand-white placeholder:text-brand-dim focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={actionFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-white text-xs"
            >
              <option value="ALL">All Actions ({auditLogs?.length || 0})</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {ACTION_LABELS[type]?.label || type}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-brand-muted hover:text-brand-white transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
          </button>

          <button
            onClick={exportAuditCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-navy-deep hover:bg-teal-accent/20 border border-teal-accent/30 text-teal-accent transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-bg-card border border-navy-border/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-navy-border/60 text-brand-dim uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-8"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-border/40">
              {paginatedLogs.map((log: any) => {
                const isExpanded = expandedLogId === log.id;
                const parsedDetails = parseDetails(log.details);

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`hover:bg-bg-secondary/40 transition-colors cursor-pointer ${
                        isExpanded ? "bg-bg-secondary/30" : ""
                      }`}
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <td className="py-3 px-4">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-teal-accent" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-brand-dim" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-brand-dim whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(log.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                      <td className="py-3 px-4 text-brand-muted">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-brand-dim" />
                          <span className="text-[11px]">{log.performedBy}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-brand-muted max-w-[300px] truncate font-sans text-[11px]">
                        {parsedDetails
                          ? `${parsedDetails.teamName || ""} (${parsedDetails.teamCode || ""})`
                          : log.details}
                      </td>
                      <td className="py-3 px-4 text-brand-dim text-[11px] max-w-[200px] truncate font-sans">
                        {log.reason || "—"}
                      </td>
                    </tr>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-bg-secondary/20 px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-brand-white">
                              <FileText className="w-4 h-4 text-teal-accent" />
                              <span>Full Event Details</span>
                            </div>

                            {parsedDetails ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(parsedDetails).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="p-2 rounded-lg bg-bg-card border border-navy-border/60"
                                  >
                                    <span className="text-[9px] uppercase text-brand-dim block tracking-wider">
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span className="text-[11px] text-brand-white font-medium">
                                      {String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-bg-card border border-navy-border/60 text-xs text-brand-muted font-sans whitespace-pre-wrap">
                                {log.details}
                              </div>
                            )}

                            {log.reason && (
                              <div className="p-2.5 rounded-lg bg-bg-card border border-navy-border/60">
                                <span className="text-[9px] uppercase text-brand-dim block tracking-wider">
                                  Reason / Comment
                                </span>
                                <span className="text-[11px] text-brand-white font-sans">
                                  {log.reason}
                                </span>
                              </div>
                            )}

                            <div className="text-[10px] text-brand-dim font-mono">
                              Log ID: {log.id} · Created: {new Date(log.createdAt).toISOString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-muted text-xs">
                    No audit log entries match the current filters.
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
              Page {currentPage} of {totalPages} · {processedLogs.length} entries
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

      {/* Immutability Notice */}
      <div className="p-3 rounded-lg bg-navy-deep/40 border border-teal-accent/20 text-[11px] text-brand-muted flex items-start gap-2">
        <Shield className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
        <span>
          Audit logs are immutable and append-only. They cannot be edited or deleted through the admin interface.
          All administrative actions are permanently recorded for accountability and compliance.
        </span>
      </div>
    </div>
  );
}
