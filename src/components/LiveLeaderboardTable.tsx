"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Search, Filter, ShieldAlert, Sparkles, Flame, CheckCircle, Zap } from "lucide-react";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  teamCode: string;
  teamName: string;
  trackName: string;
  trackId: string;
  attemptsUsed: number;
  bestScore: number;
  finalJudgeScore?: number | null;
  finalCombinedScore?: number | null;
  updatedAt: string;
  isCurrentUserTeam?: boolean;
}

interface LiveLeaderboardTableProps {
  entries: LeaderboardEntry[];
  isFrozen?: boolean;
  currentTeamCode?: string;
  onRefresh?: () => void;
}

export default function LiveLeaderboardTable({
  entries,
  isFrozen = false,
  currentTeamCode,
  onRefresh,
}: LiveLeaderboardTableProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredEntries = entries.filter((e) => {
    const matchesTrack = selectedTrack === "ALL" || e.trackId === selectedTrack;
    const matchesSearch =
      e.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.teamCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Frozen Alert if applicable */}
      {isFrozen && (
        <div className="p-4 rounded-xl bg-orange-accent/15 border border-orange-accent/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-orange-accent font-semibold">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              LEADERBOARD FROZEN: Submissions are undergoing expert judge evaluation. Final ranks will be
              announced during the valedictory ceremony!
            </span>
          </div>
          <span className="font-mono px-2 py-0.5 rounded bg-orange-accent/20 text-orange-accent">
            FROZEN
          </span>
        </div>
      )}

      {/* Control Bar: Search & Track Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Track Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "All Tracks" },
            { id: "track-ga", label: "Genetic Algorithms" },
            { id: "track-pso", label: "Particle Swarm (PSO)" },
            { id: "track-aco", label: "Ant Colony (ACO)" },
            { id: "track-fuzzy", label: "Fuzzy Logic" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedTrack === t.id
                  ? "bg-gradient-signature text-bg-primary font-semibold shadow-glow"
                  : "bg-bg-secondary hover:bg-navy-deep text-brand-muted hover:text-brand-white border border-navy-border/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Live Beacon */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-brand-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or code..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-teal-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-accent bg-teal-accent/10 px-2.5 py-1.5 rounded-lg border border-teal-accent/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-accent animate-ping" />
            <span>LIVE SYNC</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="rounded-2xl border border-navy-border/80 bg-bg-card shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-border bg-bg-secondary/70 text-xs font-mono uppercase tracking-wider text-brand-muted">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">Problem Track</th>
                <th className="py-3.5 px-4 text-center">Attempts</th>
                <th className="py-3.5 px-4 text-right">Auto-Score</th>
                <th className="py-3.5 px-4 text-right">Final Combined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-border/40 text-xs font-mono">
              <AnimatePresence>
                {filteredEntries.map((team, index) => {
                  const isSelf = currentTeamCode && team.teamCode === currentTeamCode;
                  const displayRank = index + 1;
                  const isTopRank = displayRank === 1;

                  return (
                    <motion.tr
                      key={team.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className={`group transition-colors ${
                        isSelf
                          ? "bg-teal-accent/10 border-l-4 border-teal-accent"
                          : isTopRank
                          ? "bg-electric-violet/10"
                          : "hover:bg-navy-deep/30"
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {displayRank === 1 ? (
                            <div className="w-7 h-7 rounded-lg bg-gradient-signature flex items-center justify-center text-bg-primary font-bold shadow-glow">
                              <Trophy className="w-4 h-4" />
                            </div>
                          ) : displayRank === 2 ? (
                            <div className="w-7 h-7 rounded-lg bg-brand-white/20 border border-brand-white/40 flex items-center justify-center text-brand-white font-bold">
                              2
                            </div>
                          ) : displayRank === 3 ? (
                            <div className="w-7 h-7 rounded-lg bg-orange-accent/20 border border-orange-accent/40 flex items-center justify-center text-orange-accent font-bold">
                              3
                            </div>
                          ) : (
                            <span className="text-brand-muted font-mono">{displayRank}</span>
                          )}
                        </div>
                      </td>

                      {/* Team Info */}
                      <td className="py-4 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-brand-white text-sm">
                            {team.teamName}
                          </span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded bg-teal-accent text-bg-primary font-mono text-[10px] font-bold">
                              YOU
                            </span>
                          )}
                          {isTopRank && (
                            <Flame className="w-4 h-4 text-orange-accent animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-brand-muted">
                          ID: <span className="text-teal-accent/80">{team.teamCode}</span>
                        </div>
                      </td>

                      {/* Track */}
                      <td className="py-4 px-4 font-sans text-brand-muted">
                        <span className="px-2.5 py-1 rounded-md bg-navy-deep/70 border border-navy-border text-brand-white text-xs inline-block">
                          {team.trackName || "Unassigned"}
                        </span>
                      </td>

                      {/* Attempts Used */}
                      <td className="py-4 px-4 text-center font-mono">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-secondary text-brand-muted text-xs">
                          <Zap className="w-3 h-3 text-teal-accent" />
                          <span>{team.attemptsUsed} / 3</span>
                        </span>
                      </td>

                      {/* Auto-Score (60%) */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-sm text-brand-white">
                          {team.bestScore > 0 ? team.bestScore.toFixed(1) : "—"}
                        </div>
                        <span className="text-[10px] text-brand-dim">60% weight</span>
                      </td>

                      {/* Final Combined Score */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-black text-base text-teal-accent">
                          {team.finalCombinedScore !== null && team.finalCombinedScore !== undefined
                            ? team.finalCombinedScore.toFixed(1)
                            : team.bestScore > 0
                            ? team.bestScore.toFixed(1)
                            : "—"}
                        </div>
                        <span className="text-[10px] text-brand-muted">
                          {team.finalCombinedScore ? "Verified by Judges" : "Auto-score"}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-muted text-xs">
                    No teams found matching the selected track or query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
