"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Zap, Sparkles, Timer, FileCode2, Award } from "lucide-react";

interface ScoreRevealProps {
  score: number;
  breakdown: {
    solutionQuality: number;
    efficiencyScore: number;
    designQuality: number;
    consistencyScore: number;
  };
  runtimeMs: number;
  attemptNumber: number;
  aiExplanation?: string | null;
  executionLogs?: string | null;
}

export default function ScoreReveal({
  score,
  breakdown,
  runtimeMs,
  attemptNumber,
  aiExplanation,
  executionLogs,
}: ScoreRevealProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    // Animate score count-up
    let start = 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(score * easeOut * 10) / 10;
      setDisplayedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayedScore(score);
        if (score >= 85) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#2FE6D6", "#7B5CFA", "#3ED598"],
          });
        }
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-electric-violet/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-status-green/20 border border-status-green/40 flex items-center justify-center text-status-green">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-brand-white">
              Attempt {attemptNumber} Evaluated Successfully
            </h3>
            <p className="text-xs text-brand-muted">
              Auto-benchmarked against held-out test suite & AST static rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-brand-muted px-3 py-1.5 rounded-lg bg-bg-secondary border border-navy-border">
          <Timer className="w-3.5 h-3.5 text-teal-accent" />
          <span>Runtime: {runtimeMs} ms</span>
        </div>
      </div>

      {/* Big Score Meter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-bg-secondary/60 rounded-xl p-6 border border-navy-border/40">
        <div className="text-center sm:text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-teal-accent font-semibold">
            Overall Auto-Score (100 Max)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-5xl sm:text-6xl font-black tracking-tight text-brand-white">
              {displayedScore.toFixed(1)}
            </span>
            <span className="text-brand-muted font-mono text-lg">/ 100</span>
          </div>
          <p className="text-xs text-brand-muted mt-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-electric-violet" />
            Contributes 60% toward final ranking (combined with judge evaluation)
          </p>
        </div>

        {/* Score Badge */}
        <div className="shrink-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-sm shadow-glow">
            <Sparkles className="w-4 h-4" />
            <span>
              {score >= 90
                ? "Optimal Grade (A+)"
                : score >= 80
                ? "Superior Grade (A)"
                : score >= 70
                ? "Proficient Grade (B)"
                : "Baseline Grade"}
            </span>
          </div>
        </div>
      </div>

      {/* Subscores Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-brand-white flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-teal-accent" />
          Automated Metric Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Metric 1 */}
          <div className="p-4 rounded-xl bg-bg-secondary/50 border border-navy-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-white font-medium">Solution Quality (40%)</span>
              <span className="font-mono text-teal-accent font-bold">
                {breakdown.solutionQuality.toFixed(1)} / 100
              </span>
            </div>
            <div className="w-full bg-navy-deep/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-accent h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, breakdown.solutionQuality)}%` }}
              />
            </div>
            <p className="text-[11px] text-brand-muted">Proximity to theoretical optimum</p>
          </div>

          {/* Metric 2 */}
          <div className="p-4 rounded-xl bg-bg-secondary/50 border border-navy-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-white font-medium">Computational Efficiency (25%)</span>
              <span className="font-mono text-electric-violet font-bold">
                {breakdown.efficiencyScore.toFixed(1)} / 100
              </span>
            </div>
            <div className="w-full bg-navy-deep/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-electric-violet h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, breakdown.efficiencyScore)}%` }}
              />
            </div>
            <p className="text-[11px] text-brand-muted">Convergence speed & execution runtime</p>
          </div>

          {/* Metric 3 */}
          <div className="p-4 rounded-xl bg-bg-secondary/50 border border-navy-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-white font-medium">Algorithm Design Quality (20%)</span>
              <span className="font-mono text-status-green font-bold">
                {breakdown.designQuality.toFixed(1)} / 100
              </span>
            </div>
            <div className="w-full bg-navy-deep/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-status-green h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, breakdown.designQuality)}%` }}
              />
            </div>
            <p className="text-[11px] text-brand-muted">
              AST static analysis & technique operators
            </p>
          </div>

          {/* Metric 4 */}
          <div className="p-4 rounded-xl bg-bg-secondary/50 border border-navy-border/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-white font-medium">Attempt Consistency (15%)</span>
              <span className="font-mono text-orange-accent font-bold">
                {breakdown.consistencyScore.toFixed(1)} / 100
              </span>
            </div>
            <div className="w-full bg-navy-deep/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-accent h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, breakdown.consistencyScore)}%` }}
              />
            </div>
            <p className="text-[11px] text-brand-muted">Iterative convergence trend across attempts</p>
          </div>
        </div>
      </div>

      {/* AI Qualitative Feedback */}
      {aiExplanation && (
        <div className="p-4 rounded-xl bg-navy-deep/30 border border-teal-accent/20 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Qualitative Diagnostics:</span>
          </div>
          <p className="text-xs text-brand-white/90 leading-relaxed font-sans">{aiExplanation}</p>
        </div>
      )}

      {/* Execution Logs Drawer / Collapsible */}
      {executionLogs && (
        <details className="text-xs font-mono bg-bg-primary/80 rounded-xl p-3 border border-navy-border/50 text-brand-muted">
          <summary className="cursor-pointer text-teal-accent hover:underline flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>View Sandboxed Execution Telemetry & Logs</span>
          </summary>
          <pre className="mt-3 p-3 bg-black/40 rounded-lg overflow-x-auto text-[11px] text-brand-white/80 whitespace-pre-wrap leading-relaxed">
            {executionLogs}
          </pre>
        </details>
      )}
    </div>
  );
}
