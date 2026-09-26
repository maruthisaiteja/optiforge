"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Lock,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import LiveLeaderboardTable, { LeaderboardEntry } from "@/components/LiveLeaderboardTable";

// Theme Palette matching IEEE EMBS Vardhaman Light Theme
const THEME = {
  bgMain: "#F8FAFC",
  bgSoft: "#F0F7FB",
  card: "#FFFFFF",
  ieeeBlue: "#00629B",
  embsPurple: "#772583",
  cyan: "#18A9C9",
  navy: "#102A43",
  muted: "#627D98",
  border: "#E2E8F0",
};

// Target Unlock: 30 September 2026, 09:00 AM IST
const DEFAULT_TARGET_TIME = new Date("2026-09-30T09:00:00+05:30").getTime();

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [unlockDateFormatted, setUnlockDateFormatted] = useState("30 September 2026, 09:00 AM IST");
  const [targetTimestamp, setTargetTimestamp] = useState<number>(DEFAULT_TARGET_TIME);
  const [loading, setLoading] = useState(true);
  const [currentTeamCode, setCurrentTeamCode] = useState<string | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

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

      setIsLocked(data.isLocked ?? true);
      setIsAdminPreview(data.isAdminPreview ?? false);
      setIsFrozen(data.isFrozen || false);

      if (data.unlockDate) {
        setUnlockDateFormatted(data.unlockDate);
      }
      if (data.unlockTimestamp) {
        setTargetTimestamp(data.unlockTimestamp);
      }

      setEntries(data.entries || []);
      setLastRefreshed(new Date());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4" style={{ backgroundColor: THEME.bgMain }}>
        <div
          className="w-12 h-12 border-3 rounded-full animate-spin"
          style={{ borderColor: THEME.border, borderTopColor: THEME.cyan }}
        />
        <p className="text-sm font-medium" style={{ color: THEME.muted }}>
          Checking official tournament standings & schedule...
        </p>
      </div>
    );
  }

  // Display locked view if locked and not admin preview
  if (isLocked && !isAdminPreview) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bgMain, color: THEME.navy }}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header pill */}
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${THEME.border}`,
                color: THEME.embsPurple,
              }}
            >
              <Trophy className="w-3.5 h-3.5" style={{ color: THEME.cyan }} />
              <span>IEEE EMBS × IEEE CIS · OptiForge 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ color: THEME.navy }}>
              Tournament Leaderboard
            </h1>

            <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: THEME.muted }}>
              Live scoring, automated testbench evaluations, and jury rankings are locked until the event officially begins.
            </p>
          </div>

          {/* Main Locked Card */}
          <div
            className="rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: THEME.card,
              border: `1px solid ${THEME.border}`,
            }}
          >
            {/* Background subtle gradient decor */}
            <div
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: THEME.cyan }}
            />
            <div
              className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
              style={{ backgroundColor: THEME.embsPurple }}
            />

            <div className="relative z-10 text-center space-y-6">
              {/* Lock Icon Emblem */}
              <div className="inline-flex relative">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.ieeeBlue}, ${THEME.embsPurple})`,
                    color: "#FFFFFF",
                  }}
                >
                  <Lock className="w-10 h-10" />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow"
                  style={{ backgroundColor: THEME.cyan }}
                >
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Status Message */}
              <div className="space-y-2 max-w-2xl mx-auto">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Leaderboard Locked</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black" style={{ color: THEME.navy }}>
                  Unlocks on {unlockDateFormatted}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: THEME.muted }}>
                  The official OptiForge 2026 competitive leaderboard is currently locked to all teams and spectators.
                  Standings will automatically open at <strong className="text-slate-800">9:00 AM IST on Wednesday, 30 September 2026</strong> as
                  Round 1 algorithmic submissions undergo live deterministic CI testing.
                </p>
              </div>

              {/* Countdown Grid */}
              <div className="pt-2 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-500 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Countdown to Unlock</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: THEME.bgSoft,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight" style={{ color: THEME.ieeeBlue }}>
                        {String(unit.value).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider mt-1 text-slate-500">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Schedule Roadmap */}
              <div
                className="text-left rounded-2xl p-5 sm:p-6 space-y-4 max-w-2xl mx-auto"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: THEME.embsPurple }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Official Tournament Schedule (30 Sept 2026)
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">IST Timezone</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-sky-700 block">10:00 AM – 12:30 PM</span>
                    <span className="text-slate-700 font-medium">1st Development & AI Evaluation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-600 block">12:30 PM – 1:15 PM</span>
                    <span className="text-slate-700 font-medium">Networking & Lunch Break</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-purple-700 block">1:15 PM – 3:00 PM</span>
                    <span className="text-slate-700 font-medium">2nd Development & Hidden Perturbations</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-emerald-700 block">3:00 PM – 4:00 PM</span>
                    <span className="text-slate-700 font-medium">Final Panel Jury Evaluation</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-normal pt-2 border-t border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Scores are weighted <strong>60% automated benchmark auto-scoring</strong> and <strong>40% expert jury panel review</strong>.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.ieeeBlue}, ${THEME.cyan})`,
                  }}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Team Portal Login</span>
                </Link>

                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-sm"
                  style={{
                    backgroundColor: THEME.bgSoft,
                    border: `1px solid ${THEME.border}`,
                    color: THEME.navy,
                  }}
                >
                  <span>Register a Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked view OR Admin Preview View
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: THEME.bgMain, color: THEME.navy }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Preview Notice */}
        {isAdminPreview && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-200 flex items-center justify-center text-amber-900 shrink-0 font-bold">
                🔒
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider block">Admin Preview Active</span>
                <span>
                  The leaderboard is currently <strong>LOCKED</strong> to teams and the public until {unlockDateFormatted}. You are previewing live standings with Administrator privileges.
                </span>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 font-bold text-amber-900 transition-colors shrink-0"
            >
              Organizer Dashboard →
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div
          className="p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            backgroundColor: THEME.card,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-xs"
              style={{
                backgroundColor: THEME.bgSoft,
                border: `1px solid ${THEME.border}`,
                color: THEME.ieeeBlue,
              }}
            >
              <Trophy className="w-3.5 h-3.5 text-cyan-600" />
              <span>OptiForge 2026 Live Standings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: THEME.navy }}>
              Tournament Leaderboard
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: THEME.muted }}>
              Standings determined by deterministic CI benchmark runs (60%) and expert jury evaluation (40%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeaderboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-105"
              style={{
                backgroundColor: THEME.bgSoft,
                border: `1px solid ${THEME.border}`,
                color: THEME.navy,
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
              <span>Sync ({lastRefreshed.toLocaleTimeString()})</span>
            </button>
          </div>
        </div>

        {/* Main Leaderboard Table */}
        <div
          className="rounded-3xl p-4 sm:p-6 shadow-sm"
          style={{
            backgroundColor: THEME.card,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <LiveLeaderboardTable
            entries={entries}
            isFrozen={isFrozen}
            currentTeamCode={currentTeamCode}
            onRefresh={fetchLeaderboard}
          />
        </div>
      </div>
    </div>
  );
}
