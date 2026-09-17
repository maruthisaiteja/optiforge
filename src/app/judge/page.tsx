"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  FileCode,
  Sparkles,
  Sliders,
  Send,
  Trophy,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import CodeViewer from "@/components/CodeViewer";

export default function JudgePortal() {
  const router = useRouter();

  const [judgeName, setJudgeName] = useState("");
  const [assignedTrack, setAssignedTrack] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Rubric Scores
  const [codeQuality, setCodeQuality] = useState(20);
  const [algorithmicReasoning, setAlgorithmicReasoning] = useState(28);
  const [resultInterpretation, setResultInterpretation] = useState(16);
  const [innovation, setInnovation] = useState(16);
  const [notes, setNotes] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchJudgeQueue = async () => {
    try {
      const res = await fetch("/api/judge");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setJudgeName(data.judgeName);
      setAssignedTrack(data.assignedTrack);
      setQueue(data.queue || []);

      if (data.queue && data.queue.length > 0 && !selectedTeam) {
        selectTeamForReview(data.queue[0]);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgeQueue();
  }, []);

  const selectTeamForReview = (teamItem: any) => {
    setSelectedTeam(teamItem);
    setSelectedSubIndex(0);
    setSuccessMsg(null);

    if (teamItem.evaluation) {
      setCodeQuality(teamItem.evaluation.codeQuality);
      setAlgorithmicReasoning(teamItem.evaluation.algorithmicReasoning);
      setResultInterpretation(teamItem.evaluation.resultInterpretation);
      setInnovation(teamItem.evaluation.innovation);
      setNotes(teamItem.evaluation.notes || "");
    } else {
      // Default baseline rubric
      setCodeQuality(20);
      setAlgorithmicReasoning(28);
      setResultInterpretation(16);
      setInnovation(16);
      setNotes("");
    }
  };

  const totalScore = codeQuality + algorithmicReasoning + resultInterpretation + innovation;

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam?.finalSubmission) {
      alert("No submission available to evaluate for this team.");
      return;
    }

    setSubmittingScore(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.teamId,
          submissionId: selectedTeam.finalSubmission.id,
          codeQuality,
          algorithmicReasoning,
          resultInterpretation,
          innovation,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit evaluation.");
        setSubmittingScore(false);
        return;
      }

      setSuccessMsg(`Evaluation saved successfully! Total Judge Score: ${data.totalJudgeScore} / 100`);
      setSubmittingScore(false);

      // Refresh queue
      fetchJudgeQueue();
    } catch {
      alert("Error saving evaluation.");
      setSubmittingScore(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-electric-violet border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-brand-muted">Loading Judge Evaluation Queue...</p>
      </div>
    );
  }

  const evaluatedCount = queue.filter((q) => q.hasEvaluated).length;
  const progressPercent = queue.length > 0 ? Math.round((evaluatedCount / queue.length) * 100) : 0;

  const currentSub = selectedTeam?.submissions?.[selectedSubIndex] || selectedTeam?.finalSubmission || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 border border-electric-violet/30 text-electric-violet text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Expert Judge Evaluation Console · Stage 8 Viva Q&A</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
            {judgeName || "Domain Evaluator"}
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Track Domain: <span className="text-teal-accent font-semibold">{assignedTrack}</span>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="p-4 rounded-xl bg-bg-card border border-navy-border text-xs font-mono space-y-2 w-full sm:w-64">
          <div className="flex justify-between items-center text-brand-muted">
            <span>Evaluation Progress</span>
            <span className="text-electric-violet font-bold">
              {evaluatedCount} / {queue.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-navy-deep rounded-full h-2 overflow-hidden">
            <div
              className="bg-electric-violet h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Evaluation Workstation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Assigned Teams Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-display font-bold text-sm text-brand-white uppercase tracking-wider">
            Assigned Teams Queue ({queue.length})
          </h3>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {queue.map((item) => {
              const isSelected = selectedTeam?.teamId === item.teamId;

              return (
                <button
                  key={item.teamId}
                  onClick={() => selectTeamForReview(item)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-electric-violet/15 border-electric-violet shadow-glow-violet"
                      : "bg-bg-card border-navy-border/70 hover:border-navy-border hover:bg-navy-deep/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-sm text-brand-white">
                      {item.teamName}
                    </span>
                    {item.hasEvaluated ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-status-green bg-status-green/10 px-2 py-0.5 rounded border border-status-green/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Evaluated
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-orange-accent bg-orange-accent/10 px-2 py-0.5 rounded border border-orange-accent/30">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
                    <span>ID: {item.teamCode}</span>
                    <span className="text-teal-accent">Auto: {item.bestScore.toFixed(1)}</span>
                  </div>
                </button>
              );
            })}

            {queue.length === 0 && (
              <p className="text-xs text-brand-muted p-4 bg-bg-card rounded-xl border border-navy-border">
                No teams currently assigned to this track.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Code Inspection & Rubric Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Team Profile Banner */}
              <div className="p-6 rounded-2xl bg-bg-card border border-navy-border/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-teal-accent font-bold px-2 py-0.5 rounded bg-teal-accent/10 border border-teal-accent/30">
                    Evaluating Team
                  </span>
                  <h2 className="font-display font-black text-2xl text-brand-white mt-1">
                    {selectedTeam.teamName}
                  </h2>
                  <p className="text-xs font-mono text-brand-muted">
                    Team ID: <span className="text-brand-white">{selectedTeam.teamCode}</span> ·{" "}
                    Track: <span className="text-teal-accent">{selectedTeam.trackName}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-bg-secondary border border-navy-border text-center font-mono">
                  <span className="text-[10px] text-brand-dim uppercase block">Best Auto-Score</span>
                  <span className="font-display font-bold text-xl text-teal-accent">
                    {selectedTeam.bestScore.toFixed(1)} / 100
                  </span>
                </div>
              </div>

              {/* Submissions Tab Selector */}
              {selectedTeam.submissions && selectedTeam.submissions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-brand-dim mr-1">Inspect Attempt:</span>
                  {selectedTeam.submissions.map((sub: any, idx: number) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                        selectedSubIndex === idx
                          ? "bg-teal-accent/20 border-teal-accent text-teal-accent font-bold shadow-glow"
                          : "bg-bg-secondary border-navy-border text-brand-muted hover:text-brand-white"
                      }`}
                    >
                      {sub.isLivePatch ? "Stage 7 Live Patch" : `Attempt #${sub.attemptNumber}`} ({sub.autoScore.toFixed(1)} pts)
                    </button>
                  ))}
                </div>
              )}

              {/* Written Reflection / 'What Changed & Why' */}
              {currentSub && (
                <div className="p-4 rounded-xl bg-navy-deep/50 border border-teal-accent/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-teal-accent font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {currentSub.isLivePatch
                        ? "Live Patch Written Notes:"
                        : currentSub.attemptNumber > 1
                        ? `What Changed & Why (Attempt #${currentSub.attemptNumber} Reflection):`
                        : "Baseline Approach Notes:"}
                    </span>
                    <span className="text-brand-dim">
                      AST Design: {currentSub.designQuality}/100 · Similarity: {currentSub.similarityScore || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-brand-white font-sans leading-relaxed pl-5">
                    {currentSub.whatChangedNotes || currentSub.approachNotes || "No notes submitted for this attempt."}
                  </p>
                </div>
              )}

              {/* Confidential Viva Questions Panel */}
              {selectedTeam.vivaQuestions && selectedTeam.vivaQuestions.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-electric-violet/10 border border-electric-violet/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-electric-violet uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Confidential Domain Viva Q&A Guide (Judge Reference)</span>
                  </div>
                  <p className="text-xs text-brand-muted">
                    Pointed questions to probe algorithmic representation, shift adaptation, and parameter tuning:
                  </p>
                  <ul className="space-y-1.5 text-xs text-brand-white font-sans pt-1">
                    {selectedTeam.vivaQuestions.map((q: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-electric-violet font-bold font-mono">Q{i + 1}:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code Inspection Viewer */}
              {currentSub ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-teal-accent" />
                      Code: {currentSub.filename} ({currentSub.isLivePatch ? "Live Patch" : `Attempt #${currentSub.attemptNumber}`})
                    </span>
                    <span>Runtime: {currentSub.runtimeMs} ms</span>
                  </div>
                  <CodeViewer
                    code={currentSub.codeContent}
                    filename={currentSub.filename}
                    maxHeight="360px"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-bg-card border border-navy-border text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-orange-accent mx-auto" />
                  <p className="text-xs text-brand-muted font-mono">
                    This team has not uploaded any submissions yet.
                  </p>
                </div>
              )}

              {/* Rubric Scoring Form */}
              {selectedTeam.finalSubmission && (
                <form
                  onSubmit={handleSubmitEvaluation}
                  className="rounded-2xl bg-bg-card border border-navy-border/80 p-6 sm:p-8 space-y-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-navy-border/60 pb-4">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-electric-violet" />
                      <h3 className="font-display font-bold text-base text-brand-white">
                        Expert Rubric Scoring Matrix
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1 font-mono text-sm">
                      <span className="text-brand-dim">Total:</span>
                      <span className="font-display font-bold text-xl text-electric-violet">
                        {totalScore}
                      </span>
                      <span className="text-brand-muted text-xs">/ 100</span>
                    </div>
                  </div>

                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-status-green/15 border border-status-green/40 text-status-green text-xs flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* 4 Rubric Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    {/* Rubric 1 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Code Quality & Documentation
                        </label>
                        <span className="font-mono font-bold text-teal-accent">{codeQuality} / 25</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={codeQuality}
                        onChange={(e) => setCodeQuality(Number(e.target.value))}
                        className="w-full accent-teal-accent cursor-pointer"
                      />
                      <p className="text-[11px] text-brand-muted">
                        Modularity, clean functions, error resilience, and code clarity.
                      </p>
                    </div>

                    {/* Rubric 2 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Algorithmic Reasoning & Viva
                        </label>
                        <span className="font-mono font-bold text-electric-violet">
                          {algorithmicReasoning} / 35
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={35}
                        value={algorithmicReasoning}
                        onChange={(e) => setAlgorithmicReasoning(Number(e.target.value))}
                        className="w-full accent-electric-violet cursor-pointer"
                      />
                      <p className="text-[11px] text-brand-muted">
                        Selection of operators, fitness design, shift handling, and viva defense.
                      </p>
                    </div>

                    {/* Rubric 3 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Convergence & Result Interpretation
                        </label>
                        <span className="font-mono font-bold text-status-green">
                          {resultInterpretation} / 20
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={resultInterpretation}
                        onChange={(e) => setResultInterpretation(Number(e.target.value))}
                        className="w-full accent-status-green cursor-pointer"
                      />
                      <p className="text-[11px] text-brand-muted">
                        Interpretation of fitness curves, diversity preservation, and sensitivity.
                      </p>
                    </div>

                    {/* Rubric 4 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Innovation & Shift Adaptability
                        </label>
                        <span className="font-mono font-bold text-orange-accent">
                          {innovation} / 20
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={innovation}
                        onChange={(e) => setInnovation(Number(e.target.value))}
                        className="w-full accent-orange-accent cursor-pointer"
                      />
                      <p className="text-[11px] text-brand-muted">
                        Novel representations, hybrid operators, and Stage 7 live patch performance.
                      </p>
                    </div>
                  </div>

                  {/* Written Feedback / Notes */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-brand-white">
                      Judge Qualitative Feedback & Viva Observations:
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g. Team demonstrated solid grasp of roulette selection and defended fuzzy membership boundaries convincingly during viva..."
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-electric-violet resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingScore}
                      className="px-6 py-2.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingScore ? "Submitting Evaluation..." : "Save Evaluation Score"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-bg-card border border-navy-border text-center space-y-3">
              <Trophy className="w-10 h-10 text-brand-dim mx-auto" />
              <h3 className="font-display font-bold text-lg text-brand-white">
                No Team Selected
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                Select a team from the queue on the left to review their submissions, written reflections,
                and record your viva scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
