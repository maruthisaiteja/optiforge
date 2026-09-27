"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  Play,
  Pause,
  RotateCcw,
  Tv,
  Maximize2,
  Minimize2,
  Sliders,
  Flame,
  Zap,
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

// Speed configuration (pixels per frame at ~60fps)
const SPEED_CONFIG = {
  slow: { pxPerFrame: 0.6, label: "Slow" },
  normal: { pxPerFrame: 1.2, label: "Normal" },
  fast: { pxPerFrame: 2.2, label: "Fast" },
};

// Realistic sample tournament entries used for display when live DB has no confirmed teams yet
const DEFAULT_DEMO_ENTRIES: LeaderboardEntry[] = [
  {
    id: "team-demo-01",
    rank: 1,
    teamCode: "OPT-26-8041",
    teamName: "NeuralVanguard",
    trackName: "01: Biomedical AI",
    trackId: "theme-1-biomedical-ai",
    attemptsUsed: 3,
    bestScore: 96.4,
    finalJudgeScore: 95.0,
    finalCombinedScore: 95.8,
    updatedAt: "2026-09-30T10:15:00.000Z",
  },
  {
    id: "team-demo-02",
    rank: 2,
    teamCode: "OPT-26-4412",
    teamName: "WaveletSync Labs",
    trackName: "02: Biomedical Signals",
    trackId: "theme-2-signals",
    attemptsUsed: 3,
    bestScore: 94.8,
    finalJudgeScore: 94.5,
    finalCombinedScore: 94.7,
    updatedAt: "2026-09-30T10:14:00.000Z",
  },
  {
    id: "team-demo-03",
    rank: 3,
    teamCode: "OPT-26-1904",
    teamName: "QuantumLeap Dynamics",
    trackName: "06: Open Innovation",
    trackId: "theme-6-open-innovation",
    attemptsUsed: 2,
    bestScore: 93.2,
    finalJudgeScore: 92.0,
    finalCombinedScore: 92.7,
    updatedAt: "2026-09-30T10:12:00.000Z",
  },
  {
    id: "team-demo-04",
    rank: 4,
    teamCode: "OPT-26-5521",
    teamName: "GradientAscent AI",
    trackName: "04: ML & AI Theory",
    trackId: "theme-4-ml-ai",
    attemptsUsed: 3,
    bestScore: 91.5,
    finalJudgeScore: 90.0,
    finalCombinedScore: 90.9,
    updatedAt: "2026-09-30T10:10:00.000Z",
  },
  {
    id: "team-demo-05",
    rank: 5,
    teamCode: "OPT-26-7151",
    teamName: "Team 7151 (VCE)",
    trackName: "01: Biomedical AI",
    trackId: "theme-1-biomedical-ai",
    attemptsUsed: 2,
    bestScore: 89.6,
    finalJudgeScore: 88.0,
    finalCombinedScore: 89.0,
    updatedAt: "2026-09-30T10:08:00.000Z",
  },
  {
    id: "team-demo-06",
    rank: 6,
    teamCode: "OPT-26-3092",
    teamName: "DeepScan Vision",
    trackName: "03: Medical Imaging",
    trackId: "theme-3-imaging",
    attemptsUsed: 2,
    bestScore: 88.4,
    finalJudgeScore: 87.5,
    finalCombinedScore: 88.0,
    updatedAt: "2026-09-30T10:05:00.000Z",
  },
  {
    id: "team-demo-07",
    rank: 7,
    teamCode: "OPT-26-6633",
    teamName: "SwarmIntelligence Core",
    trackName: "05: Autonomous Systems",
    trackId: "theme-5-autonomous",
    attemptsUsed: 3,
    bestScore: 86.9,
    finalJudgeScore: 86.0,
    finalCombinedScore: 86.5,
    updatedAt: "2026-09-30T10:02:00.000Z",
  },
  {
    id: "team-demo-08",
    rank: 8,
    teamCode: "OPT-26-1112",
    teamName: "Team 1112 (OptiForge)",
    trackName: "01: Biomedical AI",
    trackId: "theme-1-biomedical-ai",
    attemptsUsed: 1,
    bestScore: 85.2,
    finalJudgeScore: 84.0,
    finalCombinedScore: 84.7,
    updatedAt: "2026-09-30T10:00:00.000Z",
  },
  {
    id: "team-demo-09",
    rank: 9,
    teamCode: "OPT-26-2245",
    teamName: "CardioOptima AI",
    trackName: "02: Biomedical Signals",
    trackId: "theme-2-signals",
    attemptsUsed: 2,
    bestScore: 83.7,
    finalJudgeScore: 83.0,
    finalCombinedScore: 83.4,
    updatedAt: "2026-09-30T09:58:00.000Z",
  },
  {
    id: "team-demo-10",
    rank: 10,
    teamCode: "OPT-26-9018",
    teamName: "AlgoKnights",
    trackName: "04: ML & AI Theory",
    trackId: "theme-4-ml-ai",
    attemptsUsed: 3,
    bestScore: 82.1,
    finalJudgeScore: 81.5,
    finalCombinedScore: 81.9,
    updatedAt: "2026-09-30T09:55:00.000Z",
  },
  {
    id: "team-demo-11",
    rank: 11,
    teamCode: "OPT-26-4782",
    teamName: "PathFinder 9",
    trackName: "05: Autonomous Systems",
    trackId: "theme-5-autonomous",
    attemptsUsed: 2,
    bestScore: 80.5,
    finalJudgeScore: 80.0,
    finalCombinedScore: 80.3,
    updatedAt: "2026-09-30T09:50:00.000Z",
  },
  {
    id: "team-demo-12",
    rank: 12,
    teamCode: "OPT-26-3829",
    teamName: "PixelPrecision Imaging",
    trackName: "03: Medical Imaging",
    trackId: "theme-3-imaging",
    attemptsUsed: 1,
    bestScore: 78.9,
    finalJudgeScore: 79.0,
    finalCombinedScore: 78.9,
    updatedAt: "2026-09-30T09:45:00.000Z",
  },
  {
    id: "team-demo-13",
    rank: 13,
    teamCode: "OPT-26-7711",
    teamName: "FuzzyLogic Dynamics",
    trackName: "02: Biomedical Signals",
    trackId: "theme-2-signals",
    attemptsUsed: 2,
    bestScore: 76.4,
    finalJudgeScore: 76.0,
    finalCombinedScore: 76.2,
    updatedAt: "2026-09-30T09:40:00.000Z",
  },
  {
    id: "team-demo-14",
    rank: 14,
    teamCode: "OPT-26-5590",
    teamName: "CyberGen Innovations",
    trackName: "06: Open Innovation",
    trackId: "theme-6-open-innovation",
    attemptsUsed: 2,
    bestScore: 74.8,
    finalJudgeScore: 75.0,
    finalCombinedScore: 74.9,
    updatedAt: "2026-09-30T09:35:00.000Z",
  },
  {
    id: "team-demo-15",
    rank: 15,
    teamCode: "OPT-26-6204",
    teamName: "RoboNexus Robotics",
    trackName: "05: Autonomous Systems",
    trackId: "theme-5-autonomous",
    attemptsUsed: 1,
    bestScore: 72.3,
    finalJudgeScore: 71.0,
    finalCombinedScore: 71.8,
    updatedAt: "2026-09-30T09:30:00.000Z",
  },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const [unlockDateFormatted, setUnlockDateFormatted] = useState("30 September 2026, 09:00 AM IST");
  const [targetTimestamp, setTargetTimestamp] = useState<number>(DEFAULT_TARGET_TIME);
  const [loading, setLoading] = useState(true);
  const [currentTeamCode, setCurrentTeamCode] = useState<string | undefined>(undefined);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Auto-scroll states for big screen display
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [isBigScreen, setIsBigScreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loopStateText, setLoopStateText] = useState<string>("Continuous auto-scroll active");

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollAccumulatorRef = useRef<number>(0);
  const isWaitingRef = useRef<boolean>(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Use live entries if available, otherwise fallback to rich sample tournament entries for big screen display
  const displayedEntries = useMemo(() => {
    return entries.length > 0 ? entries : DEFAULT_DEMO_ENTRIES;
  }, [entries]);

  // Smooth scroll back to top helper
  const resetToTop = useCallback(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      scrollAccumulatorRef.current = 0;
      setScrollProgress(0);
      setLoopStateText("Returned to Top (Rank #1)");
    }
  }, []);

  // Keyboard shortcut listener: Spacebar toggles pause/resume; ESC closes big screen; M/F toggles big screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.code === "Escape") {
        setIsBigScreen(false);
      } else if (e.key.toLowerCase() === "m" || e.key.toLowerCase() === "f") {
        setIsBigScreen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Main Smooth Auto-Scroll Animation Loop
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    let animId: number;

    const tick = () => {
      // If auto-scroll is disabled, paused, hovered, or in wait state
      if (!isAutoScrolling || isPaused || isHovered || isWaitingRef.current) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const currentScroll = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll <= 5) {
        // Table content fits without scrolling
        animId = requestAnimationFrame(tick);
        return;
      }

      // Sync accumulator if user manually scrolled
      if (Math.abs(scrollAccumulatorRef.current - currentScroll) > 15) {
        scrollAccumulatorRef.current = currentScroll;
      }

      const progress = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));
      setScrollProgress(progress);

      // Check if bottom reached (within 3 pixels)
      if (currentScroll >= maxScroll - 3) {
        isWaitingRef.current = true;
        setScrollProgress(100);
        setLoopStateText("Bottom reached · Looping back to top in 3s...");

        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          // Smooth glide back to top
          container.scrollTo({ top: 0, behavior: "smooth" });
          scrollAccumulatorRef.current = 0;
          setLoopStateText("Top of leaderboard · Resuming in 2.5s...");

          pauseTimerRef.current = setTimeout(() => {
            isWaitingRef.current = false;
            setScrollProgress(0);
            setLoopStateText("Auto-scrolling live standings");
          }, 2500);
        }, 3000);
      } else {
        const speed = SPEED_CONFIG[scrollSpeed].pxPerFrame;
        scrollAccumulatorRef.current += speed;
        container.scrollTop = scrollAccumulatorRef.current;
        setLoopStateText(`Scrolling (${Math.round(progress)}%)`);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [isAutoScrolling, isPaused, isHovered, scrollSpeed]);

  const handleManualScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;
    scrollAccumulatorRef.current = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((container.scrollTop / maxScroll) * 100);
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => {
      setIsHovered(false);
    }, 400);
  }, []);

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

  // Display locked view if locked and not admin preview and not explicitly previewing
  if (isLocked && !isAdminPreview && !previewUnlocked) {
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

              {/* Action Buttons with Big Screen Preview Option */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPreviewUnlocked(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.cyan}, ${THEME.ieeeBlue})`,
                  }}
                  title="Launch stage presentation view with continuous auto-scrolling"
                >
                  <Tv className="w-4 h-4" />
                  <span>Big Screen Leaderboard Display</span>
                </button>

                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${THEME.ieeeBlue}, ${THEME.embsPurple})`,
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

  // Unlocked view OR Admin Preview View OR User-triggered Big Screen Preview
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

        {/* Big Screen Display Preview Notice (if opened from locked screen) */}
        {previewUnlocked && isLocked && !isAdminPreview && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-sky-200 flex items-center justify-center text-sky-900 shrink-0 font-bold">
                📺
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider block">Big Screen Live Display Mode</span>
                <span>
                  Displaying continuous auto-scrolling tournament standings for venue screens and auditorium projectors.
                </span>
              </div>
            </div>
            <button
              onClick={() => setPreviewUnlocked(false)}
              className="px-3 py-1.5 rounded-xl bg-sky-200 hover:bg-sky-300 font-bold text-sky-900 transition-colors shrink-0"
            >
              ← Exit to Countdown View
            </button>
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

        {/* Auto-Scroll & Big Screen Control HUD */}
        <div
          className="rounded-2xl p-4 sm:p-5 shadow-sm border transition-all"
          style={{
            backgroundColor: THEME.card,
            borderColor: THEME.border,
          }}
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Left: Pause/Resume Toggle + Loop Status */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Toggle Button */}
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                title="Toggle Auto-Scroll (Press Spacebar)"
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                  !isPaused && !isHovered
                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                }`}
              >
                {!isPaused && !isHovered ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Auto-Scroll: Running</span>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Auto-Scroll: Paused</span>
                    <span className="w-2 h-2 rounded-full bg-amber-200" />
                  </>
                )}
              </button>

              {/* Status Pill */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium"
                style={{
                  backgroundColor: THEME.bgSoft,
                  color: THEME.navy,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    !isPaused && !isHovered
                      ? "bg-emerald-500 animate-pulse"
                      : isHovered
                      ? "bg-cyan-500"
                      : "bg-amber-500"
                  }`}
                />
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {isHovered ? "Paused (Hover inspection)" : loopStateText}
                </span>
                <span className="text-slate-400 font-normal hidden sm:inline">|</span>
                <span className="text-slate-500 font-bold hidden sm:inline">
                  {Math.round(scrollProgress)}%
                </span>
              </div>
            </div>

            {/* Right: Speed controls, Reset to top, Big Screen Mode */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Speed Preset Selector */}
              <div
                className="inline-flex items-center p-1 rounded-xl text-xs font-mono"
                style={{
                  backgroundColor: THEME.bgSoft,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <span className="px-2 text-slate-500 text-[11px] font-semibold flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-600" />
                  Speed:
                </span>
                {(["slow", "normal", "fast"] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setScrollSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      scrollSpeed === spd
                        ? "bg-white text-cyan-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>

              {/* Reset to Top Button */}
              <button
                onClick={resetToTop}
                title="Scroll back to top (Rank #1)"
                className="p-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-105 flex items-center gap-1.5"
                style={{
                  backgroundColor: THEME.bgSoft,
                  border: `1px solid ${THEME.border}`,
                  color: THEME.navy,
                }}
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">Top</span>
              </button>

              {/* Big Screen Mode Button */}
              <button
                onClick={() => setIsBigScreen(true)}
                title="Launch Fullscreen Presentation Mode for Big Screen Displays / Projectors"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${THEME.ieeeBlue}, ${THEME.embsPurple})`,
                }}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Big Screen Mode</span>
              </button>
            </div>
          </div>

          {/* Scrolling Progress Line */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, scrollProgress))}%`,
                background: `linear-gradient(90deg, ${THEME.cyan}, ${THEME.ieeeBlue}, ${THEME.embsPurple})`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Rank 1 (Podium)</span>
            <span className="text-slate-500">
              Auto-Scroll loop active · Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-700">Space</kbd> to Pause/Resume
            </span>
            <span>Final Rank ({displayedEntries.length} Teams)</span>
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
            entries={displayedEntries}
            isFrozen={isFrozen}
            currentTeamCode={currentTeamCode}
            onRefresh={fetchLeaderboard}
            tableContainerRef={tableContainerRef}
            scrollProgress={scrollProgress}
            isBigScreen={false}
            isAutoScrolling={isAutoScrolling}
            isPaused={isPaused || isHovered}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onManualScroll={handleManualScroll}
          />
        </div>
      </div>

      {/* Big Screen Fullscreen Presentation Modal / Stage Display */}
      {isBigScreen && (
        <div className="fixed inset-0 z-50 bg-[#081226] text-slate-100 flex flex-col justify-between overflow-hidden p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          {/* Top Bar for Big Screen */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                    IEEE EMBS × IEEE CIS · OptiForge 2026
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    STAGE DISPLAY
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Official Tournament Leaderboard
                </h1>
              </div>
            </div>

            {/* Quick Controls in Big Screen Mode */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  !isPaused && !isHovered
                    ? "bg-teal-500 hover:bg-teal-600 text-slate-900"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-900"
                }`}
              >
                {!isPaused && !isHovered ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause (Space)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume (Space)</span>
                  </>
                )}
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700 p-1 rounded-xl text-xs font-mono">
                {(["slow", "normal", "fast"] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setScrollSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      scrollSpeed === spd
                        ? "bg-cyan-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>

              {/* Reset to top */}
              <button
                onClick={resetToTop}
                title="Scroll back to top"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:bg-slate-800 transition-colors text-xs font-mono"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Exit Big Screen */}
              <button
                onClick={() => setIsBigScreen(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit (ESC)</span>
              </button>
            </div>
          </div>

          {/* Large Screen Progress Bar */}
          <div className="w-full bg-slate-900 h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-500 transition-all duration-100 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
            />
          </div>

          {/* Main Table in Big Screen Mode */}
          <div className="flex-1 overflow-hidden my-4">
            <LiveLeaderboardTable
              entries={displayedEntries}
              isFrozen={isFrozen}
              currentTeamCode={currentTeamCode}
              onRefresh={fetchLeaderboard}
              tableContainerRef={tableContainerRef}
              scrollProgress={scrollProgress}
              isBigScreen={true}
              isAutoScrolling={isAutoScrolling}
              isPaused={isPaused || isHovered}
              onTogglePause={() => setIsPaused((prev) => !prev)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onManualScroll={handleManualScroll}
            />
          </div>

          {/* Footer in Big Screen Mode */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>OptiForge 2026 Continuous Autonomous Testbench Benchmark Live Stream</span>
            </div>
            <div>
              <span>Loop: {loopStateText}</span> · <span>Progress: {Math.round(scrollProgress)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
