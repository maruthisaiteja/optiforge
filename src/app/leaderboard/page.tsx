"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, RefreshCw, Layers, ShieldCheck, Sparkles } from "lucide-react";
import LiveLeaderboardTable, { LeaderboardEntry } from "@/components/LiveLeaderboardTable";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hiddenMessage, setHiddenMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentTeamCode, setCurrentTeamCode] = useState<string | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLeaderboard = async () => {
    try {
      // Check current user session for highlighting
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user?.role === "TEAM") {
            setCurrentTeamCode(data.user.code);
          }
        })
        .catch(() => {});

      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (!data.isVisible) {
        setIsVisible(false);
        setHiddenMessage(data.message || "Leaderboard is currently private.");
      } else {
        setIsVisible(true);
        setIsFrozen(data.isFrozen || false);
        setEntries(data.entries || []);
      }

      setLastRefreshed(new Date());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Auto-sync polling every 4 seconds for real-time rank transitions
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Fetching live leaderboard telemetry...</p>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-electric-violet/20 border border-electric-violet/40 flex items-center justify-center text-electric-violet mx-auto">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
          Leaderboard Unveiling Soon
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
          {hiddenMessage}
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-semibold text-xs mt-2"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 border border-electric-violet/30 text-electric-violet text-xs font-mono mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>OptiForge 2026 Live Standings</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-white tracking-tight">
            Tournament Leaderboard
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time standings computed via deterministic benchmark auto-scoring (60%) and expert jury evaluation (40%).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-secondary hover:bg-navy-deep border border-navy-border text-xs font-mono text-brand-muted hover:text-teal-accent transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Now ({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <LiveLeaderboardTable
        entries={entries}
        isFrozen={isFrozen}
        currentTeamCode={currentTeamCode}
        onRefresh={fetchLeaderboard}
      />
    </div>
  );
}
