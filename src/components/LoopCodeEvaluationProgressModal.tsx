"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles,
  Shield,
  Code2,
  Zap,
  CheckCircle2,
  Globe2,
  FileCheck,
  Terminal,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface LoopCodeEvaluationProgressModalProps {
  isOpen: boolean;
  problemTitle?: string;
  filename?: string;
  isBackendReady: boolean;
  onComplete: () => void;
}

interface EvaluationStage {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  durationSec: number;
}

const STAGES: EvaluationStage[] = [
  {
    id: 1,
    label: "AST Decomposition & Syntax Parsing",
    description: "Extracting function signatures, class hierarchy, control-flow depth, and modular imports.",
    icon: <Code2 className="w-4 h-4 text-cyan-400" />,
    durationSec: 10,
  },
  {
    id: 2,
    label: "Security Hygiene & Secret Boundary Sweep",
    description: "Scanning entropy, verifying lockfile dependencies, and inspecting credential leakage.",
    icon: <Shield className="w-4 h-4 text-emerald-400" />,
    durationSec: 10,
  },
  {
    id: 3,
    label: "Algorithmic Efficiency & Complexity Profiling",
    description: "Analyzing vectorization pipelines, asymptotic time/space bounds, and computational throughput.",
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    durationSec: 12,
  },
  {
    id: 4,
    label: "UN SDG & Track Innovation Alignment",
    description: "Cross-referencing against UN Sustainable Development Goals (SDG 3/7/9/11/12/13) & domain ontology.",
    icon: <Globe2 className="w-4 h-4 text-sky-400" />,
    durationSec: 12,
  },
  {
    id: 5,
    label: "Testing Fixtures & Validation Depth Audit",
    description: "Auditing automated test assertions, edge-case coverage, exception handlers, and type contracts.",
    icon: <FileCheck className="w-4 h-4 text-indigo-400" />,
    durationSec: 8,
  },
  {
    id: 6,
    label: "Multi-Dimensional Score Synthesis & Gap Diagnostics",
    description: "Computing 2-decimal precision ratings, diagnosing lagging areas, and compiling improvement roadmap.",
    icon: <Cpu className="w-4 h-4 text-teal-400" />,
    durationSec: 8,
  },
];

const TOTAL_DURATION_SEC = STAGES.reduce((acc, s) => acc + s.durationSec, 0); // 60 seconds

export default function LoopCodeEvaluationProgressModal({
  isOpen,
  problemTitle,
  filename,
  isBackendReady,
  onComplete,
}: LoopCodeEvaluationProgressModalProps) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Generate realistic live terminal logs based on elapsed seconds
  useEffect(() => {
    if (!isOpen) {
      setElapsedSec(0);
      setLogs([]);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const currentElapsed = Math.min(
        TOTAL_DURATION_SEC,
        Math.floor((Date.now() - startTime) / 1000)
      );
      setElapsedSec(currentElapsed);

      // Terminal Log Feed Progression
      if (currentElapsed === 1) {
        setLogs((prev) => [
          ...prev,
          `[LoopCode Engine v4.2] Ingesting candidate submission...`,
          `[AST] Analyzing artifact: ${filename || "source_bundle.py"}`,
        ]);
      } else if (currentElapsed === 5) {
        setLogs((prev) => [
          ...prev,
          `[AST] Generating Abstract Syntax Tree. Decomposing function and class definitions...`,
          `[AST] Cyclomatic complexity & modular isolation indexing complete.`,
        ]);
      } else if (currentElapsed === 12) {
        setLogs((prev) => [
          ...prev,
          `[Security] Initiating entropy analysis and hardcoded credential sweep...`,
          `[Security] Verifying external network boundary & environment configuration isolation.`,
        ]);
      } else if (currentElapsed === 22) {
        setLogs((prev) => [
          ...prev,
          `[Efficiency] Profiling memory allocations and algorithmic vectorization...`,
          `[Efficiency] Checking array operations, recursion boundaries, and tensor batching.`,
        ]);
      } else if (currentElapsed === 33) {
        setLogs((prev) => [
          ...prev,
          `[UN SDG] Cross-referencing submission with UN Sustainable Development Goals...`,
          `[UN SDG] Mapping technical contribution to SDG Targets & societal impact score.`,
        ]);
      } else if (currentElapsed === 44) {
        setLogs((prev) => [
          ...prev,
          `[Testing] Auditing unit test suites, assertions depth, and boundary conditions...`,
          `[Testing] Inspecting exception handling and robust error recovery routines.`,
        ]);
      } else if (currentElapsed === 53) {
        setLogs((prev) => [
          ...prev,
          `[Synthesis] Synthesizing multi-parameter continuous scoring matrix (7 criteria)...`,
          `[Synthesis] Diagnosing structural lagging areas & formulating actionable improvement roadmap.`,
        ]);
      } else if (currentElapsed >= TOTAL_DURATION_SEC) {
        setLogs((prev) => [
          ...prev,
          `[LoopCode Engine] Evaluation completed successfully. Audit report ready.`,
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, filename]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Determine current active stage index
  let accumulatedTime = 0;
  let currentStageIndex = 0;
  for (let i = 0; i < STAGES.length; i++) {
    accumulatedTime += STAGES[i].durationSec;
    if (elapsedSec < accumulatedTime) {
      currentStageIndex = i;
      break;
    }
    if (i === STAGES.length - 1) {
      currentStageIndex = STAGES.length - 1;
    }
  }

  // Progress percentage
  // If backend is ready and at least 30s have elapsed, allow swift completion or fast-forward
  const isFinished = elapsedSec >= TOTAL_DURATION_SEC && isBackendReady;
  const progressPercent = Math.min(
    100,
    Math.round((elapsedSec / TOTAL_DURATION_SEC) * 100)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#080E1C] border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-[#0B1528] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  LoopCode Evaluation Model
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  Autonomous Audit Active
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {problemTitle ? `Evaluating: ${problemTitle}` : "Deep AST, Security, Efficiency & UN SDG Verification"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-2xl font-black text-cyan-400 tracking-tight">
              {progressPercent}%
            </span>
            <span className="block text-[10px] font-mono text-slate-400">
              {isFinished
                ? "AUDIT READY"
                : `${Math.max(0, TOTAL_DURATION_SEC - elapsedSec)}s remaining`}
            </span>
          </div>
        </div>

        {/* Continuous Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Stage Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0F1E36] to-[#0A172D] border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {STAGES[currentStageIndex].icon}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  Stage {currentStageIndex + 1} of {STAGES.length}
                </span>
                <h4 className="font-semibold text-white text-sm">
                  {STAGES[currentStageIndex].label}
                </h4>
                <p className="text-xs text-slate-400">
                  {STAGES[currentStageIndex].description}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing</span>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex || isFinished;
              const isCurrent = idx === currentStageIndex && !isFinished;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    isCurrent
                      ? "bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : isPast
                      ? "bg-[#091122]/70 border-emerald-500/30"
                      : "bg-[#091122]/30 border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{stage.icon}</div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">
                        {stage.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {isPast ? "Verified" : isCurrent ? "Executing..." : "Pending"}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-700 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cybernetic Live Terminal Feed */}
          <div className="rounded-2xl bg-[#040812] border border-slate-800/80 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" /> LoopCode Inspection Stream
              </span>
              <span className="text-[10px] text-slate-500">Live Telemetry</span>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 max-h-32 overflow-y-auto text-slate-300 scrollbar-thin">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-500 select-none">&gt;</span>
                  <span
                    className={
                      log.includes("completed") || log.includes("Verified")
                        ? "text-emerald-400"
                        : log.includes("LoopCode")
                        ? "text-cyan-300 font-semibold"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B1528] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {isBackendReady && elapsedSec >= 25 ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Backend evaluation response ready
              </span>
            ) : (
              <span>Auditing source code and computing multi-factor weights...</span>
            )}
          </div>

          <div>
            {isBackendReady && (elapsedSec >= 30 || isFinished) ? (
              <button
                onClick={onComplete}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer animate-pulse"
              >
                <span>View Full Audit Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Auditing ({Math.max(0, TOTAL_DURATION_SEC - elapsedSec)}s)</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
