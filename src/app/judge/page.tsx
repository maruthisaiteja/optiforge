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
  Eye,
  Award,
} from "lucide-react";
import CodeViewer from "@/components/CodeViewer";

export default function JudgePortal() {
  const router = useRouter();

  const [judgeName, setJudgeName] = useState("");
  const [assignedTrack, setAssignedTrack] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
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
        alert(data.error || "Failed to save evaluation.");
        setSubmittingScore(false);
        return;
      }

      setSuccessMsg(`Evaluation saved successfully (${totalScore}/100). Leaderboard updated.`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 border border-electric-violet/30 text-electric-violet text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Expert Judge Evaluation Console</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-white">
            {judgeName || "Domain Evaluator"}
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Evaluating: <span className="text-teal-accent font-semibold">{assignedTrack}</span>
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
                    Evaluating Final Submission
                  </span>
                  <h2 className="font-display font-black text-2xl text-brand-white mt-1">
                    {selectedTeam.teamName}
                  </h2>
                  <p className="text-xs font-mono text-brand-muted">
                    Team Code: <span className="text-brand-white">{selectedTeam.teamCode}</span> ·{" "}
                    Track: <span className="text-teal-accent">{selectedTeam.trackName}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-bg-secondary border border-navy-border text-center font-mono">
                  <span className="text-[10px] text-brand-dim uppercase block">Auto-Score</span>
                  <span className="font-display font-bold text-xl text-teal-accent">
                    {selectedTeam.bestScore.toFixed(1)} / 100
                  </span>
                </div>
              </div>

              {/* Written Approach Notes */}
              {selectedTeam.finalSubmission?.approachNotes && (
                <div className="p-4 rounded-xl bg-navy-deep/40 border border-teal-accent/20 space-y-1.5">
                  <span className="text-xs font-mono font-semibold text-teal-accent flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Team's Written Approach & Tuning Notes:
                  </span>
                  <p className="text-xs text-brand-white/90 leading-relaxed font-sans">
                    {selectedTeam.finalSubmission.approachNotes}
                  </p>
                </div>
              )}

              {/* Code Inspection Viewer */}
              {selectedTeam.finalSubmission ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-teal-accent" />
                      Submitted Code: {selectedTeam.finalSubmission.filename} (Attempt #
                      {selectedTeam.finalSubmission.attemptNumber})
                    </span>
                    <span>Runtime: {selectedTeam.finalSubmission.runtimeMs} ms</span>
                  </div>
                  <CodeViewer
                    code={selectedTeam.finalSubmission.codeContent}
                    filename={selectedTeam.finalSubmission.filename}
                    maxHeight="380px"
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
                      <span className="text-brand-dim">Score:</span>
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
                          Algorithmic Reasoning
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
                        Theoretical correctness of the CI technique and operator choice.
                      </p>
                    </div>

                    {/* Rubric 3 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Result Interpretation
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
                        Justification of tuning parameters and convergence characteristics.
                      </p>
                    </div>

                    {/* Rubric 4 */}
                    <div className="p-4 rounded-xl bg-bg-secondary/70 border border-navy-border/60 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-medium text-brand-white">
                          Innovation & Creativity
                        </label>
                        <span className="font-mono font-bold text-orange-accent">{innovation} / 20</span>
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
                        Novel operators, adaptive heuristics, and unique optimization strategies.
                      </p>
                    </div>
                  </div>

                  {/* Qualitative Feedback Textarea */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-brand-white">
                      Qualitative Feedback & Notes for Team:
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g., Commendable dynamic inertia damping formulation. Consider exploring tournament selection with higher pressure..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-bg-secondary border border-navy-border text-xs text-brand-white placeholder:text-brand-dim focus:outline-none focus:border-electric-violet"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingScore}
                    className="w-full py-3.5 rounded-xl bg-gradient-signature text-bg-primary font-display font-bold text-xs shadow-glow hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingScore ? (
                      <span>Saving Evaluation...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Final Evaluation ({totalScore}/100)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-bg-card border border-navy-border text-center space-y-3">
              <UserCheck className="w-12 h-12 text-brand-muted mx-auto" />
              <h3 className="font-display font-bold text-brand-white">No Team Selected</h3>
              <p className="text-xs text-brand-muted">
                Please select a team from the assigned queue on the left to begin evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
